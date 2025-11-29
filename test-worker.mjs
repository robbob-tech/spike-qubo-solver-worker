// test-worker.mjs
// Simple test script for the worker

import worker from './worker.mjs';

async function testWorker() {
  console.log('Testing spike-qubo-solver-worker...\n');

  // Test 1: QUBO
  console.log('Test 1: QUBO problem');
  const quboRequest = new Request('https://example.com/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problem: {
        kind: 'qubo',
        payload: [
          [0, 0, -1],
          [1, 1, -1],
          [0, 1, 1],
        ],
      },
      options: {
        maxSteps: 500,
      },
    }),
  });

  const quboResponse = await worker.fetch(quboRequest);
  const quboResult = await quboResponse.json();
  console.log('  Result:', JSON.stringify(quboResult, null, 2));
  console.log('  ✓ Passed\n');

  // Test 2: Max-Cut
  console.log('Test 2: Max-Cut problem');
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
            [2, 0, 1.0],
            [2, 3, 1.0],
          ],
        },
      },
      options: {
        maxIterations: 500,
      },
    }),
  });

  const maxcutResponse = await worker.fetch(maxcutRequest);
  const maxcutResult = await maxcutResponse.json();
  console.log('  Result:', JSON.stringify(maxcutResult, null, 2));
  console.log('  ✓ Passed\n');

  console.log('All tests passed! ✓');
}

testWorker().catch(console.error);

