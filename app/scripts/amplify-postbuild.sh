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

# 1. Copy standalone output to compute/default
# Copy non-node_modules files first (server.js, package.json, .next/)
echo "Copying standalone server files..."
for item in "$STANDALONE"/*; do
  name=$(basename "$item")
  if [ "$name" != "node_modules" ]; then
    cp -rL "$item" "$HOSTING/compute/default/$name"
  fi
done

# Copy each package from standalone node_modules individually
# Skip broken symlinks (pnpm can leave dangling refs)
echo "Copying node_modules packages..."
mkdir -p "$HOSTING/compute/default/node_modules"

for pkg in "$STANDALONE/node_modules"/*; do
  name=$(basename "$pkg")
  # Skip hidden dirs (.pnpm, .package-lock.json, etc.)
  [[ "$name" == .* ]] && continue

  # For scoped packages (@next, @swc, @img), copy contents
  if [[ "$name" == @* ]]; then
    mkdir -p "$HOSTING/compute/default/node_modules/$name"
    for subpkg in "$pkg"/*; do
      subname=$(basename "$subpkg")
      if cp -rL "$subpkg" "$HOSTING/compute/default/node_modules/$name/$subname" 2>/dev/null; then
        echo "  Copied $name/$subname"
      else
        echo "  Skipped broken symlink: $name/$subname"
      fi
    done
  else
    if cp -rL "$pkg" "$HOSTING/compute/default/node_modules/$name" 2>/dev/null; then
      SIZE=$(du -sm "$HOSTING/compute/default/node_modules/$name" 2>/dev/null | cut -f1)
      echo "  Copied $name: ${SIZE}MB"
    else
      # Broken symlink — try copying from root node_modules instead
      echo "  Broken symlink: $name — copying from root node_modules..."
      if cp -rL "$ROOT/node_modules/$name" "$HOSTING/compute/default/node_modules/$name" 2>/dev/null; then
        SIZE=$(du -sm "$HOSTING/compute/default/node_modules/$name" 2>/dev/null | cut -f1)
        echo "  Fallback copied $name: ${SIZE}MB"
      else
        echo "  WARNING: Could not copy $name from either location"
      fi
    fi
  fi
done

# Verify critical packages
for pkg in next react react-dom; do
  if [ -d "$HOSTING/compute/default/node_modules/$pkg" ]; then
    SIZE=$(du -sm "$HOSTING/compute/default/node_modules/$pkg" 2>/dev/null | cut -f1)
    echo "  $pkg: ${SIZE}MB"
  else
    echo "  WARNING: $pkg missing! Copying from root node_modules..."
    cp -rL "$ROOT/node_modules/$pkg" "$HOSTING/compute/default/node_modules/$pkg"
  fi
done

# 2. Remove non-Linux platform binaries to save space
echo "Removing non-Linux platform binaries..."
cd "$HOSTING/compute/default/node_modules"

# Remove non-Linux @swc binaries
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
  -o -name "CHANGELOG.md" -o -name "README.md" -o -name "LICENSE" \) \
  -delete 2>/dev/null || true

cd "$ROOT"

# 3. Copy static assets
echo "Copying static assets..."
if [ -d "$ROOT/.next/static" ]; then
  mkdir -p "$HOSTING/static/_next/static"
  cp -r "$ROOT/.next/static/." "$HOSTING/static/_next/static/"
fi

# 4. Copy public folder
if [ -d "$ROOT/public" ]; then
  cp -r "$ROOT/public/." "$HOSTING/static/"
fi

# 5. Create deploy-manifest.json
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

# 6. Report final size
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
  echo "ERROR: next/dist is too small (${NEXT_DIST_SIZE}MB) — symlinks not resolved properly!"
  exit 1
fi

echo "=== Post-build complete ==="
