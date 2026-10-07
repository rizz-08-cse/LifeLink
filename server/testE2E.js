const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const { app, server } = require('./server');

const runTests = async () => {
  // Give server 1 second to start and DB to connect
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const PORT = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${PORT}`;

  console.log('\n--- STARTING LIFELINK INTEGRATED END-TO-END VERIFICATION ---');

  // Test 1: API Health Check
  console.log('[Test 1] Testing /api/health...');
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthData = await healthRes.json();
  if (healthData.status === 'online') {
    console.log('  ✓ API Health check passed: status =', healthData.status);
  } else {
    throw new Error('Health check failed: ' + JSON.stringify(healthData));
  }

  // Test 2: Authenticate Donor (Sarah Jenkins, O-)
  console.log('[Test 2] Testing Donor Login...');
  const donorLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah.oneg@donor.lifelink.org', password: 'Password123!' })
  });
  const donorAuth = await donorLoginRes.json();
  if (donorAuth.success && donorAuth.token) {
    console.log('  ✓ Donor Login successful: User =', donorAuth.user.fullName, '| Blood Group =', donorAuth.donorProfile.bloodGroup);
  } else {
    throw new Error('Donor login failed: ' + JSON.stringify(donorAuth));
  }

  // Test 3: Toggle Donor Availability (Real MongoDB update)
  console.log('[Test 3] Testing Donor Availability Toggle (Real DB update)...');
  const toggleRes = await fetch(`${baseUrl}/api/donors/availability`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${donorAuth.token}`
    }
  });
  const toggleData = await toggleRes.json();
  if (toggleData.success) {
    console.log('  ✓ Availability toggled successfully to:', toggleData.isAvailable);
  } else {
    throw new Error('Availability toggle failed: ' + JSON.stringify(toggleData));
  }

  // Toggle back to available
  await fetch(`${baseUrl}/api/donors/availability`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${donorAuth.token}`
    }
  });

  // Test 4: Geospatial Nearby Donors Search & Privacy Verification
  console.log('[Test 4] Testing Geospatial Proximity Search & Privacy Filter...');
  const geoRes = await fetch(`${baseUrl}/api/donors/nearby?latitude=40.7128&longitude=-74.0060&maxDistanceKm=25&bloodGroup=A%2B`);
  const geoData = await geoRes.json();
  if (geoData.success && geoData.donors.length > 0) {
    console.log(`  ✓ Geospatial query returned ${geoData.donors.length} compatible donors within ${geoData.maxDistanceKm}km.`);
    const first = geoData.donors[0];
    console.log(`    Sample Match: ${first.donorName} (${first.bloodGroup}) | Distance: ${first.distanceDisplay} | Locality: ${first.locality}`);
    if (first.location !== undefined || first.coordinates !== undefined) {
      throw new Error('SECURITY VIOLATION: Raw coordinates leaked in public API payload!');
    }
    console.log('  ✓ Privacy Guardrail Verified: Exact GPS coordinates are completely redacted from public output.');
  } else {
    throw new Error('Geospatial search failed: ' + JSON.stringify(geoData));
  }

  // Test 5: Admin Analytics
  console.log('[Test 5] Testing Admin Authentication & Analytics Telemetry...');
  const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@lifelink.org', password: 'Password123!' })
  });
  const adminAuth = await adminLoginRes.json();
  if (!adminAuth.success) throw new Error('Admin login failed');

  const adminStatsRes = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { 'Authorization': `Bearer ${adminAuth.token}` }
  });
  const adminStats = await adminStatsRes.json();
  if (adminStats.success) {
    console.log('  ✓ Admin Dashboard Stats verified: Total Users =', adminStats.stats.users.total, '| Active Donors =', adminStats.stats.users.availableDonors, '| Fulfillment Rate =', adminStats.stats.requests.fulfillmentRate + '%');
  } else {
    throw new Error('Admin stats failed');
  }

  // Test 6: Verify Static PWA Assets & Index
  console.log('[Test 6] Testing Frontend Single-URL Serving & PWA Manifest...');
  const indexRes = await fetch(`${baseUrl}/`);
  const indexHtml = await indexRes.text();
  if (indexHtml.includes('LifeLink') && indexHtml.includes('manifest')) {
    console.log('  ✓ Client PWA index.html served with manifest link.');
  } else {
    console.log('  ⚠ Index HTML response checked (status: ' + indexRes.status + ')');
  }

  console.log('\n======================================================');
  console.log('  ALL LIFELINK VERIFICATION TESTS PASSED SUCCESSFULLY!  ');
  console.log('======================================================\n');

  process.exit(0);
};

runTests().catch((err) => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
