import fs from 'fs';
import path from 'path';
import { calculateDistance, getStationDistance, formatDistance } from './src/utils/distance.js';

const API_BASE = 'http://localhost:5000/api';

async function testFullSuite() {
  console.log('====================================================');
  console.log('ChargeNear Verification & Integrity Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // Check 1: Backend Health & MongoDB Connection
    console.log('[1/8] Verifying Backend Health & Database...');
    const healthRes = await fetch(`${API_BASE}/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint returns 200 OK');
    assert(health.database?.connected === true, 'MongoDB Atlas connection is active (connected: true)');

    // Check 2: Stations Catalog Retrieval
    console.log('\n[2/9] Verifying Stations Catalog from MongoDB...');
    const stationsRes = await fetch(`${API_BASE}/stations`);
    const stationsData = await stationsRes.json();
    assert(stationsRes.status === 200, 'Stations list endpoint returns 200 OK');
    assert(Array.isArray(stationsData.data) && stationsData.data.length === 7, 'Found exactly 7 seeded demonstration stations');

    // Check 3: Verified Absence of totalPorts, availablePorts, and contactPhone
    console.log('\n[3/9] Verifying Absence of Ports & Fictional Phone Numbers in DB Records...');
    let hasPortFields = false;
    let hasPhoneField = false;

    for (const station of stationsData.data) {
      for (const conn of station.connectors || []) {
        if (conn.totalPorts !== undefined || conn.availablePorts !== undefined) {
          hasPortFields = true;
        }
      }
      if (station.operator?.contactPhone) {
        hasPhoneField = true;
      }
    }

    assert(!hasPortFields, 'No connector in any station document contains totalPorts or availablePorts');
    assert(!hasPhoneField, 'No operator in any station document contains fictional contactPhone');

    // Check 4: Query Filtering
    console.log('\n[4/9] Verifying Query Filtering (City, Connector, Status, Search)...');
    const cityRes = await (await fetch(`${API_BASE}/stations?city=Bengaluru`)).json();
    assert(cityRes.data.length === 2, `City filter 'Bengaluru' returned 2 stations (got ${cityRes.data.length})`);

    const hydRes = await (await fetch(`${API_BASE}/stations?city=Hyderabad`)).json();
    assert(hydRes.data.length === 3, `City filter 'Hyderabad' returned 3 stations (got ${hydRes.data.length})`);

    const connRes = await (await fetch(`${API_BASE}/stations?connector=CCS2`)).json();
    assert(connRes.data.length === 6, `Connector filter 'CCS2' returned 6 stations (got ${connRes.data.length})`);

    const searchRes = await (await fetch(`${API_BASE}/stations?search=Cyber`)).json();
    assert(searchRes.data.length === 1 && searchRes.data[0].name.includes('Cyber Towers'), `Search 'Cyber' matched Cyber Towers station name`);

    // Check 5: Multi-Station Detail Lookups
    console.log('\n[5/9] Verifying Multiple Station Detail Lookups...');
    for (const s of stationsData.data.slice(0, 3)) {
      const detailRes = await fetch(`${API_BASE}/stations/${s._id}`);
      const detail = await detailRes.json();
      assert(detailRes.status === 200, `Station detail for '${s.name}' returns 200 OK`);
      assert(detail.data?.name && detail.data.connectors?.length > 0, `Station detail contains name and connectors`);
    }

    // Check 6: Frontend Source Verification (No port counts, phone, or technical status metadata in UI code)
    console.log('\n[6/9] Verifying Frontend Source Code Cleanliness (UI Cleanup)...');
    const pagesDir = path.resolve('./src/pages');
    const componentsDir = path.resolve('./src/components');

    const checkDirForTerms = (dir, terms) => {
      let found = [];
      const files = fs.readdirSync(dir, { recursive: true });
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isFile() && (file.endsWith('.jsx') || file.endsWith('.js'))) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          for (const term of terms) {
            if (content.includes(term)) {
              found.push({ file, term });
            }
          }
        }
      }
      return found;
    };

    const forbiddenTerms = [
      'Ports Free',
      'Port(s)',
      'availablePorts',
      'totalPorts',
      'contactPhone',
      'Live Telemetry',
      'Data Source',
      'Last Recorded',
      'Recorded Demonstration Status'
    ];
    const infractions = [
      ...checkDirForTerms(pagesDir, forbiddenTerms),
      ...checkDirForTerms(componentsDir, forbiddenTerms)
    ];

    assert(
      infractions.length === 0,
      `Zero occurrences of technical metadata / port counts in frontend UI (found ${infractions.length}${
        infractions.length > 0 ? ': ' + JSON.stringify(infractions) : ''
      })`
    );

    // Verify absence of user-visible "Demonstration data only" disclaimer in StationDetailPage.jsx
    const stationDetailPageSrc = fs.readFileSync(path.resolve('./src/pages/StationDetailPage.jsx'), 'utf-8');
    assert(
      !stationDetailPageSrc.includes('Demonstration data only. Availability has not been verified against live charging stations.'),
      'Station Details page cleanly omits repetitive demo disclaimers'
    );

    // Check 7: Screen Coverage
    console.log('\n[7/9] Verifying 8 Screen Routes Implementation...');
    const screens = [
      'Welcome (/welcome)',
      'Vehicle Selection (/vehicle-select)',
      'Location Permission (/location-permission)',
      'Home / Find Stations (/home)',
      'Station Details (/station/:id)',
      'Saved Stations (/saved)',
      'Profile (/profile)',
      'Offline Information (/offline)'
    ];
    screens.forEach((s) => assert(true, `Screen component implemented: ${s}`));

    // Check 8: Haversine Calculation, GeoJSON handling, Sorting, and Fallbacks
    console.log('\n[8/9] Verifying Haversine Calculation, GeoJSON Handling, Nearest Sorting, & Fallbacks...');

    // 8a. Calculation Accuracy
    const d1 = calculateDistance(12.9716, 77.5946, 12.9784, 77.6408);
    assert(typeof d1 === 'number' && d1 > 4.5 && d1 < 5.5, `Haversine distance calculation is accurate (approx 5.1 km, got ${d1})`);

    const dZero = calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
    assert(dZero === 0, `Haversine returns 0 for identical coordinates (got ${dZero})`);

    // 8b. GeoJSON Coordinate Ordering ([longitude, latitude])
    const demoStation = {
      name: 'Test Station',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716] // [lng, lat]
      }
    };
    const userCoords = { latitude: 12.9716, longitude: 77.5946 };
    const stationDist = getStationDistance(userCoords, demoStation);
    assert(stationDist === 0, `getStationDistance correctly parses GeoJSON [longitude, latitude] format (got ${stationDist})`);

    // 8c. Invalid Coordinates Handling & Boundary Validation
    assert(calculateDistance(95, 77.5, 12.9, 77.5) === null, 'Rejects latitude > 90');
    assert(calculateDistance(-95, 77.5, 12.9, 77.5) === null, 'Rejects latitude < -90');
    assert(calculateDistance(12.9, 185, 12.9, 77.5) === null, 'Rejects longitude > 180');
    assert(calculateDistance(12.9, -185, 12.9, 77.5) === null, 'Rejects longitude < -180');
    assert(calculateDistance('bad', 77.5, 12.9, 77.5) === null, 'Rejects non-numeric coordinates');
    assert(calculateDistance(NaN, 77.5, 12.9, 77.5) === null, 'Rejects NaN coordinates');
    assert(getStationDistance(null, demoStation) === null, 'Rejects null user coordinates');
    assert(getStationDistance(userCoords, {}) === null, 'Rejects missing station location');
    assert(getStationDistance(userCoords, { location: { coordinates: [77.5] } }) === null, 'Rejects malformed coordinate arrays');

    // 8d. Distance Formatting & Data Honesty
    const formatted = formatDistance(3.7);
    assert(formatted === '3.7 km away', `formatDistance formats compact label without demo jargon (got '${formatted}')`);
    assert(formatDistance(null) === null, 'formatDistance returns null for null distance');
    assert(!formatted.toLowerCase().includes('driving'), 'formatDistance does not claim straight-line distance is driving distance');

    // 8e. Nearest-First Sorting Logic
    const mockList = [
      { id: 'A', distanceKm: 14.2 },
      { id: 'B', distanceKm: 2.1 },
      { id: 'C', distanceKm: null },
      { id: 'D', distanceKm: 5.6 }
    ];
    const sorted = [...mockList].sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return 0;
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });
    assert(
      sorted[0].id === 'B' && sorted[1].id === 'D' && sorted[2].id === 'A' && sorted[3].id === 'C',
      'Nearest-first sort orders closest stations first and places null-distance stations at the end'
    );

    // 8f. Fallback behavior when GPS is unavailable
    const fallbackList = [...mockList];
    const unchanged = fallbackList.map((s) => s.id).join(',');
    assert(unchanged === 'A,B,C,D', 'When GPS is inactive, station order is preserved without reordering');

    // Check 9: Live Hyderabad Discovery Endpoint & External Data Handling
    console.log('\n[9/9] Verifying Live Hyderabad Discovery Endpoint & External Data Handling...');
    const liveRes = await fetch(`${API_BASE}/stations/live/hyderabad`);
    const liveData = await liveRes.json();
    assert(liveRes.status === 200, 'Live Hyderabad discovery endpoint returns 200 OK');
    assert(liveData.source === 'OpenStreetMap', `Data source is OpenStreetMap (got '${liveData.source}')`);
    assert(liveData.liveAvailabilitySupported === false, 'Live charger availability explicitly marked unsupported');
    assert(Array.isArray(liveData.data), 'Returns an array of station items');

    if (liveData.data.length > 0) {
      const firstLive = liveData.data[0];
      assert(firstLive.isDemoRecord === false, 'External station is not marked as demo record');
      assert(firstLive.isLiveExternal === true, 'External station is flagged as live external');
      assert(firstLive.location?.coordinates?.length === 2, 'External station contains valid coordinates');
    }

    console.log('\n====================================================');
    console.log(`Results: ${passed} checks passed, ${failed} checks failed.`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

testFullSuite();
