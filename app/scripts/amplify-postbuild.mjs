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
  readdirSync, statSync, lstatSync,
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

// Debug: list standalone contents
console.log('Standalone contents:', readdirSync(STANDALONE));
const standaloneNM = join(STANDALONE, 'node_modules');
if (existsSync(standaloneNM)) {
  const nmContents = readdirSync(standaloneNM);
  console.log(`Standalone node_modules: ${nmContents.length} entries`);
  console.log('Has next:', nmContents.includes('next'));
  // Check if next is a symlink
  const nextPath = join(standaloneNM, 'next');
  if (existsSync(nextPath)) {
    const stat = lstatSync(nextPath);
    console.log('next is symlink:', stat.isSymbolicLink());
  }
} else {
  console.log('WARNING: No node_modules in standalone output!');
}

// 1. Copy standalone server to compute/default
// Use dereference: true to follow symlinks (pnpm uses symlinks)
cpSync(STANDALONE, COMPUTE, { recursive: true, dereference: true });

// Verify next was copied
const computeNext = join(COMPUTE, 'node_modules', 'next');
if (!existsSync(computeNext)) {
  console.log('WARNING: next not found in compute, copying from main node_modules');
  const mainNext = join(ROOT, 'node_modules', 'next');
  if (existsSync(mainNext)) {
    cpSync(mainNext, computeNext, { recursive: true, dereference: true });
  } else {
    console.error('ERROR: next not found in main node_modules either!');
  }
}

// Also ensure critical peer deps exist
const criticalDeps = ['react', 'react-dom'];
for (const dep of criticalDeps) {
  const computeDep = join(COMPUTE, 'node_modules', dep);
  if (!existsSync(computeDep)) {
    console.log(`WARNING: ${dep} not found in compute, copying from main node_modules`);
    const mainDep = join(ROOT, 'node_modules', dep);
    if (existsSync(mainDep)) {
      cpSync(mainDep, computeDep, { recursive: true, dereference: true });
    }
  }
}

// 2. Remove unnecessary files to stay under 220MB limit
function cleanDir(dir) {
  if (!existsSync(dir)) return;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['test', 'tests', '__tests__', 'docs', 'doc', 'example', 'examples', '.github'].includes(entry.name)) {
          rmSync(fullPath, { recursive: true, force: true });
          continue;
        }
        cleanDir(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (['.md', '.map', '.d.ts', '.d.mts'].includes(ext)) {
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

// List what's in compute node_modules for debugging
const computeNM = join(COMPUTE, 'node_modules');
if (existsSync(computeNM)) {
  const mods = readdirSync(computeNM);
  console.log(`Compute node_modules: ${mods.length} packages`);
  console.log('Key packages:', ['next', 'react', 'react-dom'].map(
    p => `${p}: ${existsSync(join(computeNM, p)) ? 'YES' : 'MISSING'}`
  ).join(', '));
}
