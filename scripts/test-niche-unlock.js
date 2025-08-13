#!/usr/bin/env node

/**
 * Test script to debug niche unlocking issues
 * Run with: node scripts/test-niche-unlock.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USER_ID = process.env.TEST_USER_ID || 'test-user-id';

console.log('🔧 Testing niche unlocking system...');
console.log('🔧 Base URL:', BASE_URL);
console.log('🔧 Test User ID:', TEST_USER_ID);

// Test functions
async function testWebhookEndpoint() {
  console.log('\n📡 Testing webhook endpoint...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/stripe/webhook`, 'GET');
    console.log('✅ Webhook endpoint response:', response);
  } catch (error) {
    console.error('❌ Webhook endpoint test failed:', error.message);
  }
}

async function testPaymentStatusAPI() {
  console.log('\n💰 Testing payment status API...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/user/payment-status`, 'GET');
    console.log('✅ Payment status API response:', response);
  } catch (error) {
    console.error('❌ Payment status API test failed:', error.message);
  }
}

async function testAddNicheAPI() {
  console.log('\n➕ Testing add niche API...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/user/add-niche`, 'POST', {
      nicheToAdd: 'creator'
    });
    console.log('✅ Add niche API response:', response);
  } catch (error) {
    console.error('❌ Add niche API test failed:', error.message);
  }
}

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 3000),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NicheUnlockTest/1.0'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const protocol = urlObj.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting niche unlock system tests...\n');
  
  await testWebhookEndpoint();
  await testPaymentStatusAPI();
  await testAddNicheAPI();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Check the console logs above for any errors');
  console.log('2. Verify webhook endpoint is accessible');
  console.log('3. Check if payment status API is working');
  console.log('4. Test add-niche API functionality');
  console.log('5. Check Stripe webhook logs for processing issues');
}

// Run the tests
runTests().catch(console.error);
