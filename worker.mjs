// worker.mjs
// Cloudflare Worker wrapper for spike-qubo-solver
// Exposes POST /api/solve endpoint
//
// Note: This worker uses the open-source spike-qubo-solver package.
// No USL/FRAI metrics or advanced diagnostics are included.

import { solveQubo, solveMaxCut } from '@sparse-supernova/spike-qubo-solver';

/**
 * Handle incoming requests
 */
export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      const url = new URL(request.url);

      // Route: /api/solve
      if (url.pathname === '/api/solve') {
        const body = await request.json();
        const { problem, options = {} } = body;

        if (!problem) {
          return new Response(
            JSON.stringify({ error: 'Missing "problem" in request body' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        let result;

        // Determine problem type
        if (problem.kind === 'qubo') {
          // QUBO problem: { kind: 'qubo', payload: Array<[i, j, weight]> }
          if (!problem.payload || !Array.isArray(problem.payload)) {
            return new Response(
              JSON.stringify({
                error: 'Invalid QUBO problem. Expected { kind: "qubo", payload: [[i, j, weight], ...] }',
              }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
          // Map options: maxSteps -> maxSteps, seed -> seed, trace -> trace
          const solverOptions = {
            maxSteps: options.maxSteps || options.maxIterations || 2000,
            seed: options.seed,
            trace: options.trace || false
          };
          result = await solveQubo(problem.payload, solverOptions);
        } else if (problem.kind === 'maxcut') {
          // Max-Cut problem: { kind: 'maxcut', payload: { n, edges } }
          if (!problem.payload || !problem.payload.n || !problem.payload.edges) {
            return new Response(
              JSON.stringify({
                error:
                  'Invalid Max-Cut problem. Expected { kind: "maxcut", payload: { n, edges } }',
              }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
          // Map options
          const solverOptions = {
            maxSteps: options.maxSteps || options.maxIterations || 2000,
            seed: options.seed,
            trace: options.trace || false
          };
          result = await solveMaxCut(problem.payload, solverOptions);
        } else {
          return new Response(
            JSON.stringify({
              error: 'Unknown problem kind. Use "qubo" or "maxcut"',
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Return simplified response (no USL internals)
        const response = {
          bestEnergy: result.bestEnergy,
          state: result.state,
          iterations: result.iterations,
          timeMs: result.timeMs,
          ...(result.cutValue !== undefined && { cutValue: result.cutValue })
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 404 for unknown routes
      return new Response(
        JSON.stringify({ error: 'Not found. Use POST /api/solve' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Internal server error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};

