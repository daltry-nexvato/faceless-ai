#!/usr/bin/env node
/**
 * Post-build script that packages Next.js standalone output
 * into Amplify Hosting's .amplify-hosting deployment format.
 *
 * Next.js 16 is not natively supported by Amplify yet,
 * so we manually create the deployment bundle.
 * Amplify compute limit: 220MB uncompressed.
 *
 * pnpm uses multi-layer symlinks that cpSync cannot fully resolve,
 * so we replace standalone's node_modules with the real hoisted
 * copies from the project root (requires --shamefully-hoist).
 */

import {
  cpSync, mkdirSync, writeFileSync, existsSync, rmSync,
  readdirSync, statSync, readlinkSync,
} from 'fs';
import { join, extname, resolve } from 'path';
import { execSync } from 'child_process';

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

// 1. Copy standalone files (server.js, package.json, .next) WITHOUT node_modules
const standaloneEntries = readdirSync(STANDALONE);
console.log('Standalone contents:', standaloneEntries);

for (const entry of standaloneEntries) {
  if (entry === 'node_modules') continue; // Skip — we'll handle this separately
  const src = join(STANDALONE, entry);
  const dest = join(COMPUTE, entry);
  cpSync(src, dest, { recursive: true, dereference: true });
}

// 2. Copy node_modules from project root (flat, real files from --shamefully-hoist)
// Only copy packages that standalone identified as needed
const standaloneNM = join(STANDALONE, 'node_modules');
const computeNM = join(COMPUTE, 'node_modules');
mkdirSync(computeNM, { recursive: true });

if (existsSync(standaloneNM)) {
  const neededPackages = readdirSync(standaloneNM);
  console.log(`Standalone needs ${neededPackages.length} packages: ${neededPackages.join(', ')}`);

  for (const pkg of neededPackages) {
    const rootPkg = join(ROOT, 'node_modules', pkg);
    const destPkg = join(computeNM, pkg);

    if (existsSync(rootPkg)) {
      cpSync(rootPkg, destPkg, { recursive: true, dereference: true });
      const sizeMB = (getDirSize(destPkg) / 1024 / 1024).toFixed(1);
      console.log(`  Copied ${pkg}: ${sizeMB}MB`);
    } else {
      console.log(`  WARNING: ${pkg} not found in root node_modules`);
    }
  }
} else {
  console.log('WARNING: No standalone node_modules — copying all critical deps from root');
  const criticalDeps = ['next', 'react', 'react-dom'];
  for (const pkg of criticalDeps) {
    const rootPkg = join(ROOT, 'node_modules', pkg);
    const destPkg = join(computeNM, pkg);
    if (existsSync(rootPkg)) {
      cpSync(rootPkg, destPkg, { recursive: true, dereference: true });
    }
  }
}

// 3. Remove unnecessary files to stay under 220MB limit
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

cleanDir(computeNM);

// 4. Copy static assets to static/_next
if (existsSync(join(ROOT, '.next', 'static'))) {
  mkdirSync(join(HOSTING, 'static', '_next', 'static'), { recursive: true });
  cpSync(
    join(ROOT, '.next', 'static'),
    join(HOSTING, 'static', '_next', 'static'),
    { recursive: true }
  );
}

// 5. Copy public folder to static
if (existsSync(join(ROOT, 'public'))) {
  cpSync(join(ROOT, 'public'), join(HOSTING, 'static'), { recursive: true });
}

// 6. Create deploy-manifest.json
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

const computeSize = getDirSize(COMPUTE);
const sizeMB = (computeSize / 1024 / 1024).toFixed(1);
console.log(`\n✓ Amplify deployment bundle created (compute: ${sizeMB}MB / 220MB limit)`);

if (computeSize > 220 * 1024 * 1024) {
  console.error('ERROR: Compute bundle exceeds 220MB limit!');
  process.exit(1);
}

// Final verification
console.log('Key packages:', ['next', 'react', 'react-dom'].map(
  p => `${p}: ${existsSync(join(computeNM, p)) ? 'YES' : 'MISSING'}`
).join(', '));

// Verify next has actual content (not an empty symlink shell)
const nextDist = join(computeNM, 'next', 'dist');
if (existsSync(nextDist)) {
  const nextDistSize = (getDirSize(nextDist) / 1024 / 1024).toFixed(1);
  console.log(`next/dist size: ${nextDistSize}MB`);
} else {
  console.error('ERROR: next/dist not found — package copy failed!');
  process.exit(1);
}
