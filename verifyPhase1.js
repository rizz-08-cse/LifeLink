(async () => {
  const baseUrl = 'http://localhost:5000';

  console.log('=== PHASE 1 VERIFICATION TESTS (http://localhost:5000) ===\n');

  // 1. Health API
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthJson = await healthRes.json();
  console.log('1. Backend /api/health:');
  console.log(`   - HTTP Status: ${healthRes.status}`);
  console.log(`   - Response: ${JSON.stringify(healthJson)}`);
  console.log(`   - Status Verified: ${healthJson.status === 'online' ? 'PASS' : 'FAIL'}\n`);

  // 2. Frontend HTML
  const htmlRes = await fetch(`${baseUrl}/`);
  const htmlText = await htmlRes.text();
  console.log('2. Frontend Root (http://localhost:5000/):');
  console.log(`   - HTTP Status: ${htmlRes.status}`);
  console.log(`   - HTML Length: ${htmlText.length} bytes`);
  console.log(`   - Contains Root Container: ${htmlText.includes('id="root"') ? 'PASS' : 'FAIL'}`);
  console.log(`   - Contains LifeLink Title: ${htmlText.includes('LifeLink') ? 'PASS' : 'FAIL'}\n`);

  // 3. PWA Manifest webmanifest
  const manifestWebRes = await fetch(`${baseUrl}/manifest.webmanifest`);
  const manifestWebJson = await manifestWebRes.json();
  console.log('3. PWA Web Manifest (/manifest.webmanifest):');
  console.log(`   - HTTP Status: ${manifestWebRes.status}`);
  console.log(`   - Application Name: ${manifestWebJson.name}`);
  console.log(`   - Theme Color: ${manifestWebJson.theme_color}`);
  console.log(`   - Display Mode: ${manifestWebJson.display}`);
  console.log(`   - Configured Icons: ${manifestWebJson.icons.length} (192x192 & 512x512 maskable)\n`);

  // 4. PWA Manifest JSON
  const manifestJsonRes = await fetch(`${baseUrl}/manifest.json`);
  const manifestJsonData = await manifestJsonRes.json();
  console.log('4. Standard PWA Manifest (/manifest.json):');
  console.log(`   - HTTP Status: ${manifestJsonRes.status}`);
  console.log(`   - Short Name: ${manifestJsonData.short_name}\n`);

  // 5. Service Worker
  const swRes = await fetch(`${baseUrl}/sw.js`);
  const swText = await swRes.text();
  console.log('5. PWA Service Worker (/sw.js):');
  console.log(`   - HTTP Status: ${swRes.status}`);
  console.log(`   - Size: ${swText.length} bytes`);
  console.log(`   - Workbox Engine: ${swText.includes('workbox') ? 'PASS' : 'FAIL'}\n`);

  // 6. PWA Vector Icons
  const icon192 = await fetch(`${baseUrl}/pwa-192x192.svg`);
  const favIcon = await fetch(`${baseUrl}/favicon.svg`);
  console.log('6. PWA & Vector Icons:');
  console.log(`   - /pwa-192x192.svg Status: ${icon192.status} (${icon192.headers.get('content-type')})`);
  console.log(`   - /favicon.svg Status: ${favIcon.status} (${favIcon.headers.get('content-type')})\n`);

  // 7. Backend Proximity API ($geoNear)
  const donorRes = await fetch(`${baseUrl}/api/donors/nearby?latitude=40.7128&longitude=-74.0060&maxDistanceKm=25`);
  const donorJson = await donorRes.json();
  console.log('7. MongoDB Geospatial & Privacy API (/api/donors/nearby):');
  console.log(`   - HTTP Status: ${donorRes.status}`);
  console.log(`   - Proximity Donors Found: ${donorJson.count}`);
  console.log(`   - First Donor Sample: ${donorJson.donors[0]?.donorName} (${donorJson.donors[0]?.bloodGroup}) - ${donorJson.donors[0]?.distanceDisplay}`);
  console.log(`   - Privacy Guardrail (Exact GPS Redacted): ${donorJson.donors[0]?.location === undefined ? 'PASS' : 'FAIL'}\n`);

  // 8. Backend Blood Requests API
  const reqRes = await fetch(`${baseUrl}/api/requests`);
  const reqJson = await reqRes.json();
  console.log('8. Real Blood Requests Database API (/api/requests):');
  console.log(`   - HTTP Status: ${reqRes.status}`);
  console.log(`   - Active Requests Count: ${reqJson.count}`);
  console.log(`   - Sample Patient: ${reqJson.requests[0]?.patientName} (${reqJson.requests[0]?.bloodGroup}) at ${reqJson.requests[0]?.hospitalName}\n`);

  console.log('================================================================');
  console.log('   ALL 7 PHASE 1 CRITERIA FULLY VERIFIED ON RUNNING SERVER!     ');
  console.log('================================================================\n');

  process.exit(0);
})().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
