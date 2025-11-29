# spike-qubo-solver-worker

Cloudflare Worker wrapper for [spike-qubo-solver](https://github.com/robbob-tech/spike-qubo-solver).

## What it is

A serverless API endpoint that exposes the spike-qubo-solver via Cloudflare Workers. Handles QUBO and Max-Cut problems via HTTP POST requests.

## API

### POST /api/solve

Solve a QUBO or Max-Cut problem.

**Request Body:**
```json
{
  "problem": {
    "kind": "qubo",
    "payload": {
      "n": 10,
      "terms": [[0, 0, -1.5], [1, 1, -2.0], [0, 1, 1.0]]
    }
  },
  "options": {
    "maxIterations": 1000,
    "recordTrace": false
  }
}
```

**Response:**
```json
{
  "bestEnergy": -2.5,
  "state": [1, 1, 0, ...],
  "iterations": 1000,
  "timeMs": 5.2,
  "earlyTermination": false
}
```

**Max-Cut Example:**
```json
{
  "problem": {
    "kind": "maxcut",
    "payload": {
      "n": 5,
      "edges": [[0, 1, 1.0], [1, 2, 1.0], [2, 3, 1.0]]
    }
  }
}
```

**Response:**
```json
{
  "bestEnergy": 3.0,
  "state": [0, 1, 1, 0, 1],
  "iterations": 1500,
  "timeMs": 3.1,
  "earlyTermination": false
}
```

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Deploy to Cloudflare
npm run deploy
```

## Deployment

### Prerequisites

1. Install Wrangler CLI: `npm install -g wrangler`
2. Authenticate: `wrangler login`

### Local Development

For local development, the package.json references the local solver:
```json
"dependencies": {
  "spike-qubo-solver": "file:../spike-qubo-solver"
}
```

Make sure `spike-qubo-solver` is in the parent directory.

### Production Deployment

**Option 1: Publish to npm (Recommended)**
1. Publish `spike-qubo-solver` to npm
2. Update `package.json` to use the published version: `"spike-qubo-solver": "^1.0.0"`
3. Run `npm install`
4. Deploy: `npm run deploy`

**Option 2: Bundle the solver**
Use a bundler (esbuild, webpack) to bundle the solver code directly into the worker. See `DEPLOYMENT.md` for details.

### Deploy Command

```bash
npm run deploy
```

## Note

This worker uses the open-source `spike-qubo-solver` package. Advanced diagnostics (USL/FRAI metrics, auto-tuning) are not included in this public worker. The worker only returns basic solver results: `bestEnergy`, `state`, `iterations`, `timeMs`, and `earlyTermination`.

