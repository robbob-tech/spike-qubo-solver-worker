# Deployment Guide

## Local Development

For local development, you can reference the local solver:

```json
// package.json
"dependencies": {
  "spike-qubo-solver": "file:../spike-qubo-solver"
}
```

Then in `worker.mjs`, import from the npm package:
```javascript
import { solveQubo, solveMaxCut } from 'spike-qubo-solver';
```

## Production Deployment

For Cloudflare Workers, you have two options:

### Option 1: Bundle the solver code

Use a bundler (esbuild, webpack, etc.) to bundle the solver code directly into the worker:

```bash
npm install -D esbuild
```

Create a build script that bundles `spike-qubo-solver` into the worker.

### Option 2: Publish to npm and use npm package

1. Publish `spike-qubo-solver` to npm
2. Install it in the worker: `npm install spike-qubo-solver`
3. Wrangler will bundle it automatically

### Option 3: Copy solver code directly

For simplicity, you can copy the solver source files directly into the worker repo and import them.

## Deploy

```bash
npm install
wrangler login
wrangler deploy
```

