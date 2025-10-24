/**
 * CORS Testing Script
 * Run this file to test CORS configuration
 *
 * Usage:
 * node utils/test-cors.js
 */

const https = require("https");
const http = require("http");

const API_URL = process.env.BASE_URL || "http://localhost:8000";
const API_ENDPOINT = "/api/v1/categories";

console.log("\n🧪 CORS Configuration Test\n");
console.log(`Testing API: ${API_URL}${API_ENDPOINT}\n`);
console.log("═══════════════════════════════════════\n");

// Test 1: Request without Origin (Simulates Postman)
function testNoOrigin() {
  return new Promise((resolve) => {
    console.log("Test 1: Request without Origin header");
    console.log("Expected: Should work in development mode\n");

    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const url = new URL(API_URL + API_ENDPOINT);
    const protocol = url.protocol === "https:" ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = protocol.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   CORS Headers:`);
      console.log(
        `   - Access-Control-Allow-Origin: ${res.headers["access-control-allow-origin"] || "Not set"}`
      );
      console.log(
        `   - Access-Control-Allow-Credentials: ${res.headers["access-control-allow-credentials"] || "Not set"}`
      );

      if (res.statusCode === 200) {
        console.log("   ✅ PASSED: Request without origin allowed\n");
      } else {
        console.log("   ❌ FAILED: Request blocked\n");
      }
      resolve();
    });

    req.on("error", (error) => {
      console.log(`   ❌ ERROR: ${error.message}\n`);
      resolve();
    });

    req.end();
  });
}

// Test 2: Request with Allowed Origin
function testAllowedOrigin() {
  return new Promise((resolve) => {
    console.log("Test 2: Request with Allowed Origin");
    console.log("Expected: Should work\n");

    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const url = new URL(API_URL + API_ENDPOINT);
    const protocol = url.protocol === "https:" ? https : http;
    const testOrigin = "http://localhost:3000";

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname,
      method: "GET",
      headers: {
        Origin: testOrigin,
        "Content-Type": "application/json",
      },
    };

    const req = protocol.request(options, (res) => {
      console.log(`   Origin Sent: ${testOrigin}`);
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   CORS Headers:`);
      console.log(
        `   - Access-Control-Allow-Origin: ${res.headers["access-control-allow-origin"] || "Not set"}`
      );

      if (
        res.statusCode === 200 &&
        res.headers["access-control-allow-origin"]
      ) {
        console.log("   ✅ PASSED: Allowed origin accepted\n");
      } else {
        console.log("   ❌ FAILED: Allowed origin rejected\n");
      }
      resolve();
    });

    req.on("error", (error) => {
      console.log(`   ❌ ERROR: ${error.message}\n`);
      resolve();
    });

    req.end();
  });
}

// Test 3: Request with Unauthorized Origin
function testUnauthorizedOrigin() {
  return new Promise((resolve) => {
    console.log("Test 3: Request with Unauthorized Origin");
    console.log("Expected: Should be blocked\n");

    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const url = new URL(API_URL + API_ENDPOINT);
    const protocol = url.protocol === "https:" ? https : http;
    const testOrigin = "https://evil-site.com";

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname,
      method: "GET",
      headers: {
        Origin: testOrigin,
        "Content-Type": "application/json",
      },
    };

    const req = protocol.request(options, (res) => {
      console.log(`   Origin Sent: ${testOrigin}`);
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   CORS Headers:`);
      console.log(
        `   - Access-Control-Allow-Origin: ${res.headers["access-control-allow-origin"] || "Not set"}`
      );

      if (
        res.statusCode === 403 ||
        !res.headers["access-control-allow-origin"]
      ) {
        console.log("   ✅ PASSED: Unauthorized origin blocked\n");
      } else {
        console.log("   ⚠️  WARNING: Unauthorized origin was allowed\n");
      }
      resolve();
    });

    req.on("error", (error) => {
      console.log(`   ❌ ERROR: ${error.message}\n`);
      resolve();
    });

    req.end();
  });
}

// Test 4: Check Security Headers
function testSecurityHeaders() {
  return new Promise((resolve) => {
    console.log("Test 4: Security Headers Check");
    console.log("Expected: Should have security headers\n");

    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const url = new URL(API_URL + API_ENDPOINT);
    const protocol = url.protocol === "https:" ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname,
      method: "GET",
    };

    const req = protocol.request(options, (res) => {
      const securityHeaders = {
        "X-Frame-Options": res.headers["x-frame-options"],
        "X-Content-Type-Options": res.headers["x-content-type-options"],
        "X-XSS-Protection": res.headers["x-xss-protection"],
        "Referrer-Policy": res.headers["referrer-policy"],
      };

      console.log("   Security Headers:");
      let allPresent = true;

      Object.entries(securityHeaders).forEach(([header, value]) => {
        const status = value ? "✅" : "❌";
        console.log(`   ${status} ${header}: ${value || "Not set"}`);
        if (!value) allPresent = false;
      });

      if (allPresent) {
        console.log("\n   ✅ PASSED: All security headers present\n");
      } else {
        console.log("\n   ⚠️  WARNING: Some security headers missing\n");
      }
      resolve();
    });

    req.on("error", (error) => {
      console.log(`   ❌ ERROR: ${error.message}\n`);
      resolve();
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `CORS_ORIGINS: ${process.env.CORS_ORIGINS || "Not configured"}\n`
  );
  console.log("═══════════════════════════════════════\n");

  await testNoOrigin();
  await testAllowedOrigin();
  await testUnauthorizedOrigin();
  await testSecurityHeaders();

  console.log("═══════════════════════════════════════");
  console.log("\n✨ Testing Complete!\n");
  console.log("Note: Make sure your server is running before testing");
  console.log("Start server with: npm run dev\n");
}

// Check if server is running first
function checkServer() {
  return new Promise((resolve) => {
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const url = new URL(API_URL);
    const protocol = url.protocol === "https:" ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: "/health",
      method: "GET",
      timeout: 3000,
    };

    const req = protocol.request(options, () => {
      resolve(true);
    });

    req.on("error", () => {
      resolve(false);
    });

    req.on("timeout", () => {
      resolve(false);
    });

    req.end();
  });
}

// Main execution
(async () => {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log("❌ Server is not running!");
    console.log(`   Cannot connect to ${API_URL}`);
    console.log("\n   Please start the server first:");
    console.log("   npm run dev\n");
    process.exit(1);
  }

  await runTests();
})();
