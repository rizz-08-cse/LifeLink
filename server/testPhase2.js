// LifeLink Phase 2 End-to-End Authentication Test
// Run: node testPhase2.js (from server/ or root)
"use strict";

const BASE_URL = "http://localhost:5000";
const TEST_EMAIL = "phase2.test." + Date.now() + "@lifelink-test.dev";
const TEST_PASSWORD = "TestPass@2026";

let passCount = 0;
let failCount = 0;

function pass(name, detail) {
  passCount++;
  console.log("\n  PASS | " + name);
  if (detail) console.log("       " + detail);
}

function fail(name, detail) {
  failCount++;
  console.error("\n  FAIL | " + name);
  if (detail) console.error("       " + detail);
}

async function req(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json;
  try { json = await res.json(); } catch { json = {}; }
  return { status: res.status, json };
}

async function run() {
  console.log("\n=== LifeLink Phase 2 - MongoDB & Auth Verification ===");
  console.log("Target: " + BASE_URL);
  console.log("Test user: " + TEST_EMAIL);
  console.log("======================================================\n");

  // 1. Health check
  console.log("[1/7] Health check...");
  try {
    const r = await req("GET", "/api/health");
    if (r.status === 200 && r.json.status === "online") {
      pass("Health check", "status=200 service=" + r.json.service);
    } else {
      fail("Health check", "status=" + r.status);
      process.exit(1);
    }
  } catch(e) {
    fail("Health check", "Server not reachable: " + e.message);
    process.exit(1);
  }

  // 2. Register new donor
  console.log("\n[2/7] Register new donor...");
  let token = null;
  try {
    const r = await req("POST", "/api/auth/register", {
      fullName: "Phase Two Tester",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      phone: "+1-555-0200",
      role: "donor",
      bloodGroup: "A+",
      latitude: 40.7128,
      longitude: -74.0060,
      addressLocality: "Test District"
    });
    if (r.status === 201 && r.json.success && r.json.token) {
      token = r.json.token;
      pass("Register", "HTTP 201 | user._id=" + r.json.user._id + " | bloodGroup=" + r.json.donorProfile.bloodGroup);
    } else {
      fail("Register", "status=" + r.status + " body=" + JSON.stringify(r.json));
    }
  } catch(e) { fail("Register", e.message); }

  // 3. Login with correct credentials
  console.log("\n[3/7] Login with valid credentials...");
  let loginTok = null;
  if (token) {
    try {
      const r = await req("POST", "/api/auth/login", { email: TEST_EMAIL, password: TEST_PASSWORD });
      if (r.status === 200 && r.json.success && r.json.token) {
        loginTok = r.json.token;
        pass("Login (valid)", "HTTP 200 | user._id=" + r.json.user._id);
      } else {
        fail("Login (valid)", "status=" + r.status + " body=" + JSON.stringify(r.json));
      }
    } catch(e) { fail("Login (valid)", e.message); }
  } else { fail("Login (valid)", "Skipped - registration failed"); }

  // 4. Protected GET /api/auth/me
  console.log("\n[4/7] Protected GET /api/auth/me...");
  const useToken = loginTok || token;
  if (useToken) {
    try {
      const r = await req("GET", "/api/auth/me", null, useToken);
      if (r.status === 200 && r.json.success && r.json.user && r.json.user.email === TEST_EMAIL) {
        pass("GET /api/auth/me", "HTTP 200 | email=" + r.json.user.email + " | role=" + r.json.user.role + " | bloodGroup=" + r.json.donorProfile.bloodGroup);
      } else {
        fail("GET /api/auth/me", "status=" + r.status + " body=" + JSON.stringify(r.json));
      }
    } catch(e) { fail("GET /api/auth/me", e.message); }
  } else { fail("GET /api/auth/me", "No token available"); }

  // 5. Duplicate email guard
  console.log("\n[5/7] Duplicate registration guard...");
  try {
    const r = await req("POST", "/api/auth/register", {
      fullName: "Dup", email: TEST_EMAIL, password: TEST_PASSWORD,
      phone: "+1-555-9999", role: "donor", bloodGroup: "B-", latitude: 0, longitude: 0
    });
    if (r.status === 400 && r.json.success === false) {
      pass("Duplicate guard", "HTTP 400 | " + r.json.message);
    } else {
      fail("Duplicate guard", "Expected 400, got " + r.status + " body=" + JSON.stringify(r.json));
    }
  } catch(e) { fail("Duplicate guard", e.message); }

  // 6. Wrong password
  console.log("\n[6/7] Wrong password...");
  try {
    const r = await req("POST", "/api/auth/login", { email: TEST_EMAIL, password: "WrongPass!" });
    if (r.status === 401 && r.json.success === false) {
      pass("Wrong password guard", "HTTP 401 | " + r.json.message);
    } else {
      fail("Wrong password guard", "Expected 401, got " + r.status + " body=" + JSON.stringify(r.json));
    }
  } catch(e) { fail("Wrong password guard", e.message); }

  // 7. No-token guard
  console.log("\n[7/7] Protected route without token...");
  try {
    const r = await req("GET", "/api/auth/me");
    if (r.status === 401 && r.json.success === false) {
      pass("No-token guard", "HTTP 401 | " + r.json.message);
    } else {
      fail("No-token guard", "Expected 401, got " + r.status + " body=" + JSON.stringify(r.json));
    }
  } catch(e) { fail("No-token guard", e.message); }

  // Summary
  console.log("\n======================================================");
  console.log("  Results: " + passCount + " PASSED  /  " + failCount + " FAILED  (7 total)");
  console.log("======================================================\n");

  if (failCount === 0) {
    console.log("Phase 2 COMPLETE - MongoDB + JWT auth fully verified.\n");
  } else {
    console.error("Phase 2 has failures. Fix items marked FAIL before proceeding.\n");
    process.exit(1);
  }
}

run().catch(e => { console.error("Runner error:", e); process.exit(1); });
