#!/bin/bash
set -e

echo "=== Amplify Post-Build: Creating deployment bundle ==="

ROOT=$(pwd)
STANDALONE="$ROOT/.next/standalone"
HOSTING="$ROOT/.amplify-hosting"

# Clean previous build
rm -rf "$HOSTING"

# Create directory structure
mkdir -p "$HOSTING/compute/default"
mkdir -p "$HOSTING/static"

# 1. Copy standalone server files (server.js, package.json, .next/)
echo "Copying standalone server files..."
for item in "$STANDALONE"/*; do
  name=$(basename "$item")
  if [ "$name" = "node_modules" ]; then
    continue
  fi
  cp -r "$item" "$HOSTING/compute/default/$name"
done

# 2. Use pnpm deploy to create real node_modules (no symlinks)
# pnpm deploy is specifically designed for this use case
echo "Creating real node_modules with pnpm deploy..."
DEPLOY_DIR=$(mktemp -d)
pnpm deploy --filter . --prod "$DEPLOY_DIR" 2>&1 | tail -5

# Copy only node_modules from the deploy output
if [ -d "$DEPLOY_DIR/node_modules" ]; then
  cp -r "$DEPLOY_DIR/node_modules" "$HOSTING/compute/default/node_modules"
  echo "Copied node_modules from pnpm deploy"
else
  echo "ERROR: pnpm deploy did not create node_modules!"
  # Fallback: use rsync to dereference symlinks from standalone
  echo "Fallback: rsync from standalone node_modules..."
  rsync -rL --exclude='.pnpm' "$STANDALONE/node_modules/" "$HOSTING/compute/default/node_modules/"
fi
rm -rf "$DEPLOY_DIR"

# 3. Aggressively prune to stay under 220MB
echo "Pruning non-Linux binaries and unnecessary files..."
NM="$HOSTING/compute/default/node_modules"

# Remove ALL non-linux platform packages
find "$NM" -type d -name "*darwin*" -exec rm -rf {} + 2>/dev/null || true
find "$NM" -type d -name "*win32*" -exec rm -rf {} + 2>/dev/null || true
find "$NM" -type d -name "*arm64*" -exec rm -rf {} + 2>/dev/null || true
find "$NM" -type d -name "*freebsd*" -exec rm -rf {} + 2>/dev/null || true
find "$NM" -type d -name "*android*" -exec rm -rf {} + 2>/dev/null || true
find "$NM" -type d -name "*musl*" -exec rm -rf {} + 2>/dev/null || true

# Remove specific platform packages by name pattern
cd "$NM"
for dir in @next/swc-* @img/sharp-* @img/sharp-libvips-*; do
  case "$dir" in
    *linux-x64-gnu*|*linux-x64) echo "  Keeping $dir" ;;
    *) [ -d "$dir" ] && rm -rf "$dir" && echo "  Removed platform pkg: $dir" ;;
  esac
done 2>/dev/null || true

# Remove next's compiled SWC binaries for non-linux
if [ -d "next/dist/compiled/@next" ]; then
  for dir in next/dist/compiled/@next/swc-*; do
    case "$dir" in
      *linux-x64*) echo "  Keeping compiled: $dir" ;;
      *) [ -d "$dir" ] && rm -rf "$dir" && echo "  Removed compiled: $dir" ;;
    esac
  done 2>/dev/null || true
fi

# Remove sharp and @img (we use fal.ai for images, not Next.js image optimization)
rm -rf sharp @img detect-libc color color-convert color-name color-string 2>/dev/null || true

# Remove test/docs/examples/benchmarks
find "$NM" -type d \( -name "test" -o -name "tests" -o -name "__tests__" \
  -o -name "docs" -o -name "doc" -o -name "example" -o -name "examples" \
  -o -name ".github" -o -name "fixtures" -o -name "benchmark" \) \
  -exec rm -rf {} + 2>/dev/null || true

# Remove unnecessary files
find "$NM" -type f \( -name "*.map" -o -name "*.d.ts" -o -name "*.d.mts" \
  -o -name "*.md" -o -name "*.txt" -o -name "*.yml" -o -name "*.yaml" \
  -o -name "LICENSE*" -o -name "LICENCE*" -o -name "*.flow" \
  -o -name "*.tsbuildinfo" -o -name ".eslintrc*" -o -name ".prettierrc*" \
  -o -name "tsconfig*.json" \) \
  -delete 2>/dev/null || true

# Remove next ESM duplicate and webpack/sass compiled bundles
rm -rf next/dist/esm 2>/dev/null || true
rm -rf next/dist/compiled/webpack 2>/dev/null || true
rm -rf next/dist/compiled/sass-loader 2>/dev/null || true
rm -rf next/dist/compiled/css-loader 2>/dev/null || true
rm -rf next/dist/compiled/mini-css-extract-plugin 2>/dev/null || true

# Remove caniuse-lite and source-map-js
rm -rf caniuse-lite source-map-js 2>/dev/null || true

cd "$ROOT"

# 4. Copy static assets
echo "Copying static assets..."
if [ -d "$ROOT/.next/static" ]; then
  mkdir -p "$HOSTING/static/_next/static"
  cp -r "$ROOT/.next/static/." "$HOSTING/static/_next/static/"
fi

# 5. Copy public folder
if [ -d "$ROOT/public" ]; then
  cp -r "$ROOT/public/." "$HOSTING/static/"
fi

# 6. Create deploy-manifest.json
echo "Creating deploy-manifest.json..."
cat > "$HOSTING/deploy-manifest.json" << 'MANIFEST'
{
  "version": 1,
  "routes": [
    {
      "path": "/_next/static/*",
      "target": {
        "kind": "Static",
        "cacheControl": "public, max-age=31536000, immutable"
      }
    },
    {
      "path": "/*.*",
      "target": { "kind": "Static" },
      "fallback": { "kind": "Compute", "src": "default" }
    },
    {
      "path": "/*",
      "target": { "kind": "Compute", "src": "default" }
    }
  ],
  "computeResources": [
    {
      "name": "default",
      "entrypoint": "server.js",
      "runtime": "nodejs20.x"
    }
  ],
  "framework": {
    "name": "next",
    "version": "16.2.0"
  }
}
MANIFEST

# 7. Report final size
COMPUTE_SIZE=$(du -sm "$HOSTING/compute/default" | cut -f1)
echo ""
echo "=== Deployment bundle created ==="
echo "Compute size: ${COMPUTE_SIZE}MB / 220MB limit"

# Show top packages
echo "Top packages by size:"
du -sm "$HOSTING/compute/default/node_modules"/* 2>/dev/null | sort -rn | head -10

if [ "$COMPUTE_SIZE" -gt 220 ]; then
  echo "ERROR: Compute bundle exceeds 220MB limit!"
  exit 1
fi

# Verify server.js exists
if [ ! -f "$HOSTING/compute/default/server.js" ]; then
  echo "ERROR: server.js not found!"
  exit 1
fi

# Verify next has real content
NEXT_DIST_SIZE=$(du -sm "$HOSTING/compute/default/node_modules/next/dist" 2>/dev/null | cut -f1)
echo "next/dist size: ${NEXT_DIST_SIZE}MB"

if [ "${NEXT_DIST_SIZE:-0}" -lt 10 ]; then
  echo "ERROR: next/dist too small — module resolution will fail at runtime!"
  exit 1
fi

echo "=== Post-build complete ==="
