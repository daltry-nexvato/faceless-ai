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
  if [ "$name" != "node_modules" ]; then
    cp -r "$item" "$HOSTING/compute/default/$name"
  fi
done

# 2. Install ONLY the packages that standalone actually needs (not all deps)
# pnpm symlinks can't be copied, so we use npm to install real files.
echo "Building minimal package.json from standalone trace..."

# Get the list of packages standalone identified as needed
STANDALONE_NM="$STANDALONE/node_modules"
DEPS="{}"
for pkg in "$STANDALONE_NM"/*; do
  name=$(basename "$pkg")
  # Skip hidden dirs and scoped packages (they're sub-deps)
  [[ "$name" == .* ]] && continue
  [[ "$name" == @* ]] && continue
  # Get version from the package's own package.json
  if [ -f "$pkg/package.json" ] || [ -L "$pkg" ]; then
    # Read version from the original (resolved) package
    VER=$(node -e "try{console.log(require('$ROOT/node_modules/$name/package.json').version)}catch{console.log('*')}" 2>/dev/null)
    DEPS=$(echo "$DEPS" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));d['$name']='$VER';console.log(JSON.stringify(d))")
  fi
done

# Create minimal package.json
cat > "$HOSTING/compute/default/package.json" << MINPKG
{
  "name": "amplify-compute",
  "private": true,
  "dependencies": $DEPS
}
MINPKG

echo "Minimal deps: $DEPS"

cd "$HOSTING/compute/default"
npm install --ignore-scripts 2>&1 | tail -5
cd "$ROOT"

# 3. Remove non-Linux platform binaries to save space
echo "Removing non-Linux platform binaries..."
cd "$HOSTING/compute/default/node_modules"

# Remove non-Linux @next/swc binaries
for dir in @next/swc-*; do
  case "$dir" in
    *linux-x64*) echo "  Keeping $dir" ;;
    *) [ -d "$dir" ] && rm -rf "$dir" && echo "  Removed $dir" ;;
  esac
done 2>/dev/null || true

# Remove non-Linux @img binaries (sharp)
if [ -d "@img" ]; then
  for dir in @img/sharp-*; do
    case "$dir" in
      *linux-x64*) echo "  Keeping $dir" ;;
      *) [ -d "$dir" ] && rm -rf "$dir" && echo "  Removed $dir" ;;
    esac
  done 2>/dev/null || true
fi

# Remove test/docs/examples directories
find . -type d \( -name "test" -o -name "tests" -o -name "__tests__" \
  -o -name "docs" -o -name "doc" -o -name "example" -o -name "examples" \
  -o -name ".github" \) -exec rm -rf {} + 2>/dev/null || true

# Remove unnecessary files
find . -type f \( -name "*.map" -o -name "*.d.ts" -o -name "*.d.mts" \
  -o -name "CHANGELOG.md" -o -name "README.md" \) \
  -delete 2>/dev/null || true

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

if [ "$COMPUTE_SIZE" -gt 220 ]; then
  echo "ERROR: Compute bundle exceeds 220MB limit!"
  exit 1
fi

# Verify server.js exists
if [ ! -f "$HOSTING/compute/default/server.js" ]; then
  echo "ERROR: server.js not found in compute bundle!"
  exit 1
fi

# Verify next/dist exists with real content
NEXT_DIST_SIZE=$(du -sm "$HOSTING/compute/default/node_modules/next/dist" 2>/dev/null | cut -f1)
echo "next/dist size: ${NEXT_DIST_SIZE}MB"

if [ "${NEXT_DIST_SIZE:-0}" -lt 10 ]; then
  echo "ERROR: next/dist is too small (${NEXT_DIST_SIZE}MB) — packages not installed properly!"
  exit 1
fi

echo "Key packages:"
for pkg in next react react-dom; do
  SIZE=$(du -sm "$HOSTING/compute/default/node_modules/$pkg" 2>/dev/null | cut -f1)
  echo "  $pkg: ${SIZE}MB"
done

echo "=== Post-build complete ==="
