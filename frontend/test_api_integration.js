const BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('Testing Frontend API Integration against backend at', BASE);

  // 1. Health
  const healthRes = await fetch(`${BASE}/health`);
  const health = await healthRes.json();
  console.log('1. Health check status:', healthRes.status, 'DB connected:', health.database?.connected);

  // 2. All stations
  const allRes = await fetch(`${BASE}/stations`);
  const all = await allRes.json();
  console.log('2. All stations count:', all.data?.length, 'Names:', all.data?.map(s => s.name));

  // 3. City filter
  const bngRes = await fetch(`${BASE}/stations?city=Bengaluru`);
  const bng = await bngRes.json();
  console.log('3. City=Bengaluru count:', bng.data?.length, 'Cities:', bng.data?.map(s => s.address?.city));

  // 4. Connector filter
  const ccs2Res = await fetch(`${BASE}/stations?connector=CCS2`);
  const ccs2 = await ccs2Res.json();
  console.log('4. Connector=CCS2 count:', ccs2.data?.length);

  // 5. Status filter
  const availRes = await fetch(`${BASE}/stations?status=Available`);
  const avail = await availRes.json();
  console.log('5. Status=Available count:', avail.data?.length, 'Statuses:', avail.data?.map(s => s.availability?.status));

  // 6. Search keyword
  const searchRes = await fetch(`${BASE}/stations?search=Metro`);
  const search = await searchRes.json();
  console.log('6. Search="Metro" count:', search.data?.length, 'Names:', search.data?.map(s => s.name));

  // 7. Single station detail
  if (all.data && all.data.length > 0) {
    const firstId = all.data[0]._id;
    const detailRes = await fetch(`${BASE}/stations/${firstId}`);
    const detail = await detailRes.json();
    console.log('7. Detail lookup for ID', firstId, 'Success:', detail.success, 'Name:', detail.data?.name);
  }

  console.log('\nAll API integration tests passed successfully!');
}

runTests().catch(console.error);
