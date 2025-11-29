// test-deployed.mjs
// Test the deployed Cloudflare Worker

const WORKER_URL = 'https://spike-qubo-solver-worker.sparsesupernova.workers.dev';

async function testDeployed() {
  console.log('🌐 Testing Deployed API\n');
  console.log('URL:', WORKER_URL);
  console.log('='.repeat(50));

  // Test 1: QUBO
  console.log('\n📦 Test 1: QUBO via Deployed API');
  console.log('-'.repeat(50));
  
  const quboResponse = await fetch(`${WORKER_URL}/api/solve`, {
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
        maxSteps: 1000
      }
    })
  });

  const quboResult = await quboResponse.json();
  console.log('✅ Status:', quboResponse.status);
  console.log('📊 Response:', JSON.stringify(quboResult, null, 2));
  
  if (quboResponse.status !== 200) {
    console.error('❌ Failed');
    process.exit(1);
  }

  // Test 2: Max-Cut
  console.log('\n📦 Test 2: Max-Cut via Deployed API');
  console.log('-'.repeat(50));
  
  const maxcutResponse = await fetch(`${WORKER_URL}/api/solve`, {
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

  const maxcutResult = await maxcutResponse.json();
  console.log('✅ Status:', maxcutResponse.status);
  console.log('📊 Response:', JSON.stringify(maxcutResult, null, 2));
  
  if (maxcutResponse.status !== 200) {
    console.error('❌ Failed');
    process.exit(1);
  }

  // Test 3: CORS
  console.log('\n📦 Test 3: CORS Preflight');
  console.log('-'.repeat(50));
  
  const corsResponse = await fetch(`${WORKER_URL}/api/solve`, {
    method: 'OPTIONS'
  });
  
  console.log('✅ Status:', corsResponse.status);
  console.log('✅ CORS Origin:', corsResponse.headers.get('Access-Control-Allow-Origin'));

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Deployed API is working!');
  console.log('='.repeat(50));
  console.log('\n📍 API Endpoint:', `${WORKER_URL}/api/solve`);
}

testDeployed().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

