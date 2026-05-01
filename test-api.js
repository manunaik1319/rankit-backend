/**
 * Quick API Test Script
 * Run this after starting the server to test all endpoints
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing RankIt Backend API\n');
  console.log(`📍 API URL: ${API_URL}\n`);

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check (GET /)...');
  try {
    const response = await fetch(`${API_URL}/`);
    const data = await response.json();
    console.log('✅ Health check passed');
    console.log('   Status:', data.status);
    console.log('   Endpoints:', Object.keys(data.endpoints).length);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Predict
  console.log('\n2️⃣ Testing Predict (POST /api/predict)...');
  try {
    const response = await fetch(`${API_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exam: 'JEE Main',
        rank: 5000,
        category: 'OPEN',
        gender: 'Gender-Neutral',
        state: 'Delhi',
        round: '6',
        collegeTypes: { iit: true, nit: true, iiit: true, gfti: true }
      })
    });
    const data = await response.json();
    console.log('✅ Predict endpoint passed');
    console.log('   Results:', data.results?.length || 0);
    console.log('   Safe:', data.stats?.safe || 0);
    console.log('   Target:', data.stats?.moderate || 0);
    console.log('   Dream:', data.stats?.reach || 0);
  } catch (error) {
    console.log('❌ Predict endpoint failed:', error.message);
  }

  // Test 3: CSAB
  console.log('\n3️⃣ Testing CSAB (GET /api/csab)...');
  try {
    const response = await fetch(`${API_URL}/api/csab?limit=10`);
    const data = await response.json();
    console.log('✅ CSAB endpoint passed');
    console.log('   Results:', data.count || 0);
  } catch (error) {
    console.log('❌ CSAB endpoint failed:', error.message);
  }

  // Test 4: Cutoffs
  console.log('\n4️⃣ Testing Cutoffs (GET /api/cutoffs)...');
  try {
    const response = await fetch(`${API_URL}/api/cutoffs?exam=JEE Main&limit=10`);
    const data = await response.json();
    console.log('✅ Cutoffs endpoint passed');
    console.log('   Results:', data.count || 0);
  } catch (error) {
    console.log('❌ Cutoffs endpoint failed:', error.message);
  }

  // Test 5: Branches
  console.log('\n5️⃣ Testing Branches (GET /api/branches)...');
  try {
    const response = await fetch(`${API_URL}/api/branches`);
    const data = await response.json();
    console.log('✅ Branches endpoint passed');
    console.log('   Results:', data.count || 0);
  } catch (error) {
    console.log('❌ Branches endpoint failed:', error.message);
  }

  // Test 6: Compare
  console.log('\n6️⃣ Testing Compare (POST /api/compare)...');
  try {
    const response = await fetch(`${API_URL}/api/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collegeIds: ['iit-bombay', 'iit-delhi']
      })
    });
    const data = await response.json();
    console.log('✅ Compare endpoint passed');
    console.log('   Results:', data.count || 0);
  } catch (error) {
    console.log('❌ Compare endpoint failed:', error.message);
  }

  console.log('\n✨ API testing complete!\n');
}

testAPI();
