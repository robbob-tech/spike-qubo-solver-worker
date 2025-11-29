// end-to-end-test.mjs
// Full end-to-end smoke test: solver → worker → API response

import worker from './worker.mjs';

async function smokeTest() {
  console.log('🔥 End-to-End Smoke Test\n');
  console.log('='.repeat(50));

  // Test 1: QUBO via API
  console.log('\n📦 Test 1: QUBO Problem via API');
  console.log('-'.repeat(50));
  
  const quboRequest = new Request('https://example.com/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problem: {
        kind: 'qubo',
        payload: [
          [0, 0, -1.5],
          [1, 1, -2.0],
          [0, 1, 1.0]
        ]
      },
      options: {
        maxSteps: 1000,
        trace: false
      }
    })
  });

  const quboResponse = await worker.fetch(quboRequest);
  const quboResult = await quboResponse.json();
  
  console.log('✅ Status:', quboResponse.status);
  console.log('📊 Response:', JSON.stringify(quboResult, null, 2));
  
  // Validate response structure
  const required = ['bestEnergy', 'state', 'iterations', 'timeMs'];
  const missing = required.filter(k => !(k in quboResult));
  if (missing.length > 0) {
    console.error('❌ Missing fields:', missing);
    process.exit(1);
  }
  console.log('✅ All required fields present');

  // Test 2: Max-Cut via API
  console.log('\n📦 Test 2: Max-Cut Problem via API');
  console.log('-'.repeat(50));
  
  const maxcutRequest = new Request('https://example.com/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problem: {
        kind: 'maxcut',
        payload: {
          n: 4,
          edges: [
            [0, 1, 1.0],
            [1, 2, 1.0],
            [2, 3, 1.0],
            [3, 0, 1.0]
          ]
        }
      },
      options: {
        maxSteps: 1000
      }
    })
  });

  const maxcutResponse = await worker.fetch(maxcutRequest);
  const maxcutResult = await maxcutResponse.json();
  
  console.log('✅ Status:', maxcutResponse.status);
  console.log('📊 Response:', JSON.stringify(maxcutResult, null, 2));
  
  // Validate response structure
  const requiredMaxCut = ['bestEnergy', 'state', 'cutValue', 'iterations', 'timeMs'];
  const missingMaxCut = requiredMaxCut.filter(k => !(k in maxcutResult));
  if (missingMaxCut.length > 0) {
    console.error('❌ Missing fields:', missingMaxCut);
    process.exit(1);
  }
  console.log('✅ All required fields present');

  // Test 3: Error handling
  console.log('\n📦 Test 3: Error Handling');
  console.log('-'.repeat(50));
  
  const badRequest = new Request('https://example.com/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problem: {
        kind: 'invalid'
      }
    })
  });

  const errorResponse = await worker.fetch(badRequest);
  const errorResult = await errorResponse.json();
  
  console.log('✅ Status:', errorResponse.status, '(expected 400)');
  console.log('📊 Error:', errorResult.error);
  if (errorResponse.status !== 400) {
    console.error('❌ Expected 400 status');
    process.exit(1);
  }
  console.log('✅ Error handling works');

  // Test 4: CORS preflight
  console.log('\n📦 Test 4: CORS Preflight');
  console.log('-'.repeat(50));
  
  const optionsRequest = new Request('https://example.com/api/solve', {
    method: 'OPTIONS'
  });

  const optionsResponse = await worker.fetch(optionsRequest);
  console.log('✅ Status:', optionsResponse.status);
  console.log('✅ CORS headers:', optionsResponse.headers.get('Access-Control-Allow-Origin'));

  console.log('\n' + '='.repeat(50));
  console.log('🎉 All smoke tests passed!');
  console.log('='.repeat(50));
}

smokeTest().catch(err => {
  console.error('❌ Smoke test failed:', err);
  process.exit(1);
});

