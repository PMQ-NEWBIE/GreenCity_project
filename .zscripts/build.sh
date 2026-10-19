#!/bin/bash

# Redirect stderr to stdout to prevent execute_command from failing on stderr output
exec 2>&1

set -e

# Get the directory where the script is located (.zscripts directory, i.e. workspace-agent/.zscripts)
# Use $0 to get the script path (compatible with sh and bash)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Next.js project path
NEXTJS_PROJECT_DIR="/home/z/my-project"

# Check if Next.js project directory exists
if [ ! -d "$NEXTJS_PROJECT_DIR" ]; then
    echo "❌ Error: Next.js project directory does not exist: $NEXTJS_PROJECT_DIR"
    exit 1
fi

echo "🚀 Starting build for Next.js app and mini-services..."
echo "📁 Next.js project path: $NEXTJS_PROJECT_DIR"

# Switch to Next.js project directory
cd "$NEXTJS_PROJECT_DIR" || exit 1

# Set environment variables
export NEXT_TELEMETRY_DISABLED=1

BUILD_DIR="/tmp/build_fullstack_$BUILD_ID"
echo "📁 Cleaning and creating build directory: $BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Build Next.js app
echo "🔨 Building Next.js app..."
bun run build

# Verify if standalone server entry is generated (deployment success guard).
# Next only outputs .next/standalone/server.js when next.config contains output:"standalone".
# If user/AI edited or deleted this config, bun run build will still succeed (static
# assets produced as usual, exit code 0), but standalone is missing -- no server.js in
# packaged artifact. After deploying to FC, start.sh cannot find next-service-dist/server.js
# -> Next is not started -> Caddy:81 reverse proxies empty 3000 -> FC health check times out
# after 120s (primary cause of warmup_412 / FunctionNotStarted in production).
# Self-healing: only when actually missing, inject output:"standalone" into next.config and rebuild.
# Normal projects (server.js already generated) skip this entire block without reading or writing user files.
if [ ! -f ".next/standalone/server.js" ]; then
    echo "⚠️  Build did not produce .next/standalone/server.js, starting self-healing for next.config output configuration..."
    NEXT_CONFIG_FILE="$(ls next.config.ts next.config.js next.config.mjs next.config.cjs 2>/dev/null | head -1)"

    if [ -z "$NEXT_CONFIG_FILE" ]; then
        echo "❌ Build failed: next.config.* not found, unable to generate standalone deployment artifacts."
        exit 1
    fi

    if grep -Eq "output\s*:\s*['\"]standalone['\"]" "$NEXT_CONFIG_FILE"; then
        # Standalone was declared but server.js was still not produced, indicating this is not a missing config
        # issue (build might have failed, custom distDir, etc.). Do not guess/modify user config, fail directly with reason.
        echo "❌ Build failed: $NEXT_CONFIG_FILE already contains output:\"standalone\", but .next/standalone/server.js was not generated."
        echo "   Please check error logs above or the project's custom build configuration."
        exit 1
    fi

    if grep -Eq "output\s*:\s*['\"]" "$NEXT_CONFIG_FILE"; then
        # Another output is explicitly declared (such as "export" static export / non-"standalone" value).
        # "export" is incompatible with this deployment model (standalone + custom server) -- cannot inject
        # a second output overriding user intent (duplicate JS object keys: latter takes effect, injection invalid). Fail clearly.
        echo "❌ Build failed: $NEXT_CONFIG_FILE declared a non-standalone output (e.g. \"export\" static export), which is incompatible with the current deployment model."
        echo "   Current deployment requires output:\"standalone\". Please change to standalone, or confirm if this project should use static hosting instead of deployment sandbox."
        exit 1
    fi

    echo "🔧 Detected $NEXT_CONFIG_FILE missing output:\"standalone\", auto-injecting and rebuilding..."
    cp "$NEXT_CONFIG_FILE" "${NEXT_CONFIG_FILE}.zbak"
    # Insert output:"standalone" after opening { of the first config object literal,
    # covering common scaffolding patterns: const nextConfig...= {  /  export default {  /  module.exports = {
    perl -0pi -e 's/((?:const\s+\w+[^=]*=|export\s+default|module\.exports\s*=)\s*\{)/$1\n  output: "standalone",/' "$NEXT_CONFIG_FILE"

    if ! grep -Eq "output\s*:\s*['\"]standalone['\"]" "$NEXT_CONFIG_FILE"; then
        echo "❌ Unable to match injectable config object, unconventional next.config syntax; please manually add output:\"standalone\"."
        echo "   Current $NEXT_CONFIG_FILE content:"
        cat "$NEXT_CONFIG_FILE"
        mv "${NEXT_CONFIG_FILE}.zbak" "$NEXT_CONFIG_FILE"
        exit 1
    fi

    echo "🔨 Injected output:\"standalone\", rebuilding..."
    bun run build

    if [ ! -f ".next/standalone/server.js" ]; then
        echo "❌ After injecting output:\"standalone\" and rebuilding, .next/standalone/server.js was still not generated."
        exit 1
    fi
    echo "✅ Self-healing succeeded: standalone server entry generated."
fi

# Build mini-services
# Check if mini-services directory exists under Next.js project directory
if [ -d "$NEXTJS_PROJECT_DIR/mini-services" ]; then
    echo "🔨 Building mini-services..."
    # Use mini-services script under workspace-agent directory
    sh "$SCRIPT_DIR/mini-services-install.sh"
    sh "$SCRIPT_DIR/mini-services-build.sh"

    # Copy mini-services-start.sh to mini-services-dist directory
    echo "  - Copying mini-services-start.sh to $BUILD_DIR"
    cp "$SCRIPT_DIR/mini-services-start.sh" "$BUILD_DIR/mini-services-start.sh"
    chmod +x "$BUILD_DIR/mini-services-start.sh"
else
    echo "ℹ️  mini-services directory does not exist, skipping"
fi

# Copy all build artifacts to temporary build directory
echo "📦 Collecting build artifacts into $BUILD_DIR..."

# Copy Next.js standalone build output
if [ -d ".next/standalone" ]; then
    echo "  - Copying .next/standalone"
    cp -r .next/standalone "$BUILD_DIR/next-service-dist/"
fi

# Copy Next.js static files
if [ -d ".next/static" ]; then
    echo "  - Copying .next/static"
    mkdir -p "$BUILD_DIR/next-service-dist/.next"
    cp -r .next/static "$BUILD_DIR/next-service-dist/.next/"
fi

# Copy public directory
if [ -d "public" ]; then
    echo "  - Copying public"
    cp -r public "$BUILD_DIR/next-service-dist/"
fi

# Python does not inherit workspace-agent's /home/z/.venv. If project contains Python sources
# or dependency manifest, pin production dependencies into artifact during build and maintain relative paths.
PROJECT_DIR="$NEXTJS_PROJECT_DIR" BUILD_DIR="$BUILD_DIR" \
    bash "$SCRIPT_DIR/python-runtime-build.sh"

# If Preview database exists, copy existing data; if not, initialize empty database in deployment artifact directly.
# Template source does not carry db/custom.db; cannot rely on dev.sh having run successfully before Deploy.
PROJECT_DIR="$NEXTJS_PROJECT_DIR" BUILD_DIR="$BUILD_DIR" \
    bash "$SCRIPT_DIR/database-runtime-build.sh"

# Copy Caddyfile (if exists)
if [ -f "Caddyfile" ]; then
    echo "  - Copying Caddyfile"
    cp Caddyfile "$BUILD_DIR/"
else
    echo "ℹ️  Caddyfile does not exist, skipping"
fi

# Copy start.sh script
echo "  - Copying start.sh to $BUILD_DIR"
cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
chmod +x "$BUILD_DIR/start.sh"

# Package into $BUILD_DIR.tar.gz
PACKAGE_FILE="${BUILD_DIR}.tar.gz"
echo ""
echo "📦 Packaging build artifacts into $PACKAGE_FILE..."
cd "$BUILD_DIR" || exit 1
tar -czf "$PACKAGE_FILE" .
cd - > /dev/null || exit 1

# # Clean up temporary directory
# rm -rf "$BUILD_DIR"

echo ""
echo "✅ Build completed! All artifacts packaged into $PACKAGE_FILE"
echo "📊 Packaged file size:"
ls -lh "$PACKAGE_FILE"
