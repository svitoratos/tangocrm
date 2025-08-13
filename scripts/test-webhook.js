#!/usr/bin/env node

const https = require('https');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const WEBHOOK_URL = 'https://www.gotangocrm.com/api/stripe/webhook';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

async function testWebhook() {
  console.log('🔧 Testing Webhook Endpoint');
  console.log('============================');
  
  // Test 1: GET endpoint
  console.log('\n1️⃣ Testing GET endpoint...');
  try {
    const getResponse = await makeRequest('GET', WEBHOOK_URL);
    console.log('✅ GET endpoint working:', getResponse);
  } catch (error) {
    console.log('❌ GET endpoint failed:', error.message);
  }
  
  // Test 2: POST with invalid signature
  console.log('\n2️⃣ Testing POST with invalid signature...');
  try {
    const testData = { test: 'data' };
    const postResponse = await makeRequest('POST', WEBHOOK_URL, testData);
    console.log('✅ POST endpoint working (rejected invalid signature):', postResponse);
  } catch (error) {
    console.log('❌ POST endpoint failed:', error.message);
  }
  
  // Test 3: Check webhook secret
  console.log('\n3️⃣ Checking webhook secret...');
  if (WEBHOOK_SECRET) {
    console.log('✅ Webhook secret is configured');
    console.log('   Secret starts with:', WEBHOOK_SECRET.substring(0, 10) + '...');
  } else {
    console.log('❌ Webhook secret is missing!');
  }
  
  // Test 4: Check other required environment variables
  console.log('\n4️⃣ Checking environment variables...');
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName} is configured`);
    } else {
      console.log(`❌ ${varName} is missing!`);
    }
  }
  
  // Test 5: Check if the webhook URL is correct in Stripe
  console.log('\n5️⃣ Webhook URL verification...');
  console.log('   Current webhook URL:', WEBHOOK_URL);
  console.log('   Make sure this matches your Stripe Dashboard webhook endpoint');
  
  console.log('\n📋 Troubleshooting Steps:');
  console.log('1. Check Stripe Dashboard > Webhooks > Endpoints');
  console.log('2. Verify the webhook URL is exactly:', WEBHOOK_URL);
  console.log('3. Check if the webhook secret matches your Stripe Dashboard');
  console.log('4. Review recent webhook delivery attempts in Stripe Dashboard');
  console.log('5. Check Vercel deployment logs for any errors');
}

function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TangoCRM-Webhook-Test/1.0'
      }
    };
    
    if (data && method === 'POST') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data && method === 'POST') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run the test
testWebhook().catch(console.error);
