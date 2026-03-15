#!/bin/bash
# Build script for n8n-skills distribution packages
# Creates one zip per skill folder plus a complete bundle.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$ROOT_DIR/dist"
SKILLS_DIR="$ROOT_DIR/skills"
VERSION="1.1.0"


cd "$ROOT_DIR"

echo "🔨 Building n8n-skills distribution packages..."

mkdir -p "$DIST_DIR"

echo "🗑️  Removing old zip files..."
rm -f "$DIST_DIR"/*.zip

SKILLS=$(find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d ! -name '.*' -exec basename {} \; | sort)

if [ -z "$SKILLS" ]; then
    echo "❌ No skill folders found in $SKILLS_DIR"
    exit 1
fi

echo "📦 Building individual skill zips from detected skill folders..."
for skill in $SKILLS; do
    echo "   - $skill"
    zip -rq "$DIST_DIR/${skill}-v${VERSION}.zip" "skills/${skill}/" -x "*.DS_Store"
done

echo "📦 Building complete bundle..."
bundle_items=("skills")

if [ -d ".claude-plugin" ]; then
    bundle_items+=(".claude-plugin")
fi

if [ -f "README.md" ]; then
    bundle_items+=("README.md")
fi

if [ -f "LICENSE" ]; then
    bundle_items+=("LICENSE")
fi

if [ -f "CONTRIBUTING.md" ]; then
    bundle_items+=("CONTRIBUTING.md")
fi

zip -rq "$DIST_DIR/n8n-mcp-skills-v${VERSION}.zip" "${bundle_items[@]}" -x "*.DS_Store"

echo ""
echo "✅ Build complete! Files in $DIST_DIR/:"
echo ""
ls -lh "$DIST_DIR"/*.zip
echo ""
echo "📊 Package sizes:"
du -h "$DIST_DIR"/*.zip
