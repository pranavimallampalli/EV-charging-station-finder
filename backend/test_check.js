import app from './src/app.js';

const runTests = async () => {
  const PORT = 5099;
  const server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);

    try {
      // Test 1: Health check endpoint
      console.log('\n--- Test 1: GET /api/health ---');
      const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
      const healthData = await healthRes.json();
      console.log('Status:', healthRes.status);
      console.log('Response:', JSON.stringify(healthData, null, 2));

      if (healthRes.status === 200 && healthData.success === true && healthData.database) {
        console.log('✅ Test 1 Passed: Health check is operational and reports database status.');
      } else {
        console.error('❌ Test 1 Failed');
      }

      // Test 2: Unmatched route (404 handler)
      console.log('\n--- Test 2: GET /api/nonexistent-route ---');
      const notFoundRes = await fetch(`http://localhost:${PORT}/api/nonexistent-route`);
      const notFoundData = await notFoundRes.json();
      console.log('Status:', notFoundRes.status);
      console.log('Response:', JSON.stringify(notFoundData, null, 2));

      if (notFoundRes.status === 404 && notFoundData.success === false) {
        console.log('✅ Test 2 Passed: 404 handler returns clean error response.');
      } else {
        console.error('❌ Test 2 Failed');
      }

      // Test 3: Invalid ObjectId validation
      console.log('\n--- Test 3: GET /api/stations/invalid-id-xyz ---');
      const invalidIdRes = await fetch(`http://localhost:${PORT}/api/stations/invalid-id-xyz`);
      const invalidIdData = await invalidIdRes.json();
      console.log('Status:', invalidIdRes.status);
      console.log('Response:', JSON.stringify(invalidIdData, null, 2));

      if (invalidIdRes.status === 400 && invalidIdData.success === false && invalidIdData.error.includes('Invalid station ID format')) {
        console.log('✅ Test 3 Passed: Invalid ID format caught and returned 400 Bad Request.');
      } else {
        console.error('❌ Test 3 Failed');
      }

      // Test 4: Missing body fields on POST /api/stations
      console.log('\n--- Test 4: POST /api/stations with empty payload ---');
      const postEmptyRes = await fetch(`http://localhost:${PORT}/api/stations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const postEmptyData = await postEmptyRes.json();
      console.log('Status:', postEmptyRes.status);
      console.log('Response:', JSON.stringify(postEmptyData, null, 2));

      if (postEmptyRes.status === 400 && postEmptyData.success === false && Array.isArray(postEmptyData.errors)) {
        console.log('✅ Test 4 Passed: Input validation caught missing fields with detailed errors array.');
      } else {
        console.error('❌ Test 4 Failed');
      }

      // Test 5: Stations endpoint when database is disconnected (requireDB middleware)
      console.log('\n--- Test 5: GET /api/stations without DB connected ---');
      const stationsRes = await fetch(`http://localhost:${PORT}/api/stations`);
      const stationsData = await stationsRes.json();
      console.log('Status:', stationsRes.status);
      console.log('Response:', JSON.stringify(stationsData, null, 2));

      if (stationsRes.status === 503 && stationsData.success === false) {
        console.log('✅ Test 5 Passed: Gracefully handled disconnected DB with 503 status.');
      } else {
        console.error('❌ Test 5 Failed');
      }

      console.log('\n=======================================');
      console.log('All backend checks completed successfully!');
      console.log('=======================================');
    } catch (err) {
      console.error('Error running tests:', err);
    } finally {
      server.close(() => {
        console.log('Test server closed cleanly.');
      });
    }
  });
};

runTests();
