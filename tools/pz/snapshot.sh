#!/bin/bash
# copy a frozen build + sources + tools for reviewers: bash tools/pz/snapshot.sh DEST
set -e
D="$1"; [ -z "$D" ] && { echo "usage: snapshot.sh DEST"; exit 1; }
R="$(cd "$(dirname "$0")/../.." && pwd)"
rm -rf "$D"; mkdir -p "$D/type-warriors-source" "$D/tools" "$D/pool_plan"
cp "$R/type-warriors-source/out.html" "$D/type-warriors-source/out.html"
cp "$R"/type-warriors-source/96*.js "$D/type-warriors-source/"
cp -r "$R/tools/pz" "$D/tools/pz"
cp "$R"/pool_plan/*.png "$D/pool_plan/"; cp "$R/POOL_PLAN.md" "$D/"
echo "snapshot at $D"
