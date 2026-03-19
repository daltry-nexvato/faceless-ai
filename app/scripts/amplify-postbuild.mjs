#!/usr/bin/env node
/**
 * Post-build script that packages Next.js standalone output
 * into Amplify Hosting's .amplify-hosting deployment format.
 *
 * Next.js 16 is not natively supported by Amplify yet,
 * so we manually create the deployment bundle.
 */

import { cpSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const STANDALONE = join(ROOT, '.next', 'standalone');
const HOSTING = join(ROOT, '.amplify-hosting');

// Clean previous build
if (existsSync(HOSTING)) {
  rmSync(HOSTING, { recursive: true });
}

// Create directory structure
mkdirSync(join(HOSTING, 'compute', 'default'), { recursive: true });
mkdirSync(join(HOSTING, 'static'), { recursive: true });

// 1. Copy standalone server to compute/default
cpSync(STANDALONE, join(HOSTING, 'compute', 'default'), { recursive: true });

// 2. Copy static assets to static/_next
if (existsSync(join(ROOT, '.next', 'static'))) {
  mkdirSync(join(HOSTING, 'static', '_next', 'static'), { recursive: true });
  cpSync(
    join(ROOT, '.next', 'static'),
    join(HOSTING, 'static', '_next', 'static'),
    { recursive: true }
  );
}

// 3. Copy public folder to static
if (existsSync(join(ROOT, 'public'))) {
  cpSync(join(ROOT, 'public'), join(HOSTING, 'static'), { recursive: true });
}

// 4. Create deploy-manifest.json
const manifest = {
  version: 1,
  routes: [
    {
      path: '/_next/static/*',
      target: {
        kind: 'Static',
        cacheControl: 'public, max-age=31536000, immutable',
      },
    },
    {
      path: '/*.*',
      target: { kind: 'Static' },
      fallback: { kind: 'Compute', src: 'default' },
    },
    {
      path: '/*',
      target: { kind: 'Compute', src: 'default' },
    },
  ],
  computeResources: [
    {
      name: 'default',
      entrypoint: 'server.js',
      runtime: 'nodejs20.x',
    },
  ],
  framework: {
    name: 'next',
    version: '16.2.0',
  },
};

writeFileSync(
  join(HOSTING, 'deploy-manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('✓ Amplify deployment bundle created at .amplify-hosting/');
