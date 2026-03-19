#!/usr/bin/env node
/**
 * Post-build script that packages Next.js standalone output
 * into Amplify Hosting's .amplify-hosting deployment format.
 *
 * Next.js 16 is not natively supported by Amplify yet,
 * so we manually create the deployment bundle.
 * Amplify compute limit: 220MB uncompressed.
 */

import {
  cpSync, mkdirSync, writeFileSync, existsSync, rmSync,
  readdirSync, statSync,
} from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();
const STANDALONE = join(ROOT, '.next', 'standalone');
const HOSTING = join(ROOT, '.amplify-hosting');

// Clean previous build
if (existsSync(HOSTING)) {
  rmSync(HOSTING, { recursive: true });
}

// Create directory structure
const COMPUTE = join(HOSTING, 'compute', 'default');
mkdirSync(COMPUTE, { recursive: true });
mkdirSync(join(HOSTING, 'static'), { recursive: true });

// 1. Copy standalone server to compute/default
cpSync(STANDALONE, COMPUTE, { recursive: true });

// 2. Remove unnecessary files to stay under 220MB limit
const PATTERNS_TO_REMOVE = [
  'LICENSE', 'README.md', 'CHANGELOG.md', 'readme.md',
  '.package-lock.json',
];

function cleanDir(dir) {
  if (!existsSync(dir)) return;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        // Remove test/doc directories from node_modules
        if (['test', 'tests', '__tests__', 'docs', 'doc', 'example', 'examples', '.github'].includes(entry.name)) {
          rmSync(fullPath, { recursive: true, force: true });
          continue;
        }
        cleanDir(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        // Remove unnecessary file types
        if (['.md', '.map', '.d.ts', '.d.mts', '.txt', '.yaml', '.yml'].includes(ext) ||
            PATTERNS_TO_REMOVE.includes(entry.name)) {
          rmSync(fullPath, { force: true });
        }
      }
    }
  } catch {
    // Skip permission errors
  }
}

cleanDir(join(COMPUTE, 'node_modules'));

// 3. Copy static assets to static/_next
if (existsSync(join(ROOT, '.next', 'static'))) {
  mkdirSync(join(HOSTING, 'static', '_next', 'static'), { recursive: true });
  cpSync(
    join(ROOT, '.next', 'static'),
    join(HOSTING, 'static', '_next', 'static'),
    { recursive: true }
  );
}

// 4. Copy public folder to static
if (existsSync(join(ROOT, 'public'))) {
  cpSync(join(ROOT, 'public'), join(HOSTING, 'static'), { recursive: true });
}

// 5. Create deploy-manifest.json
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

// Report size
function getDirSize(dir) {
  let size = 0;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        size += getDirSize(fullPath);
      } else {
        size += statSync(fullPath).size;
      }
    }
  } catch { /* skip */ }
  return size;
}

const sizeMB = (getDirSize(COMPUTE) / 1024 / 1024).toFixed(1);
console.log(`✓ Amplify deployment bundle created (compute: ${sizeMB}MB / 220MB limit)`);
