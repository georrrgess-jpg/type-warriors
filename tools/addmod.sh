#!/bin/bash
# bash tools/addmod.sh NEWMODULE.js AFTERMODULE.js  : register a module in build.sh and build_ast3.sh right after another one.
# Works on the type-warriors-source next to this tools folder (also inside a workspace made by ws.sh).
D="$(cd "$(dirname "$0")/../type-warriors-source" && pwd)"; N="$1"; A="$2"
[ -n "$N" ] && [ -n "$A" ] || { echo "usage: addmod.sh NEW.js AFTER.js"; exit 1; }
for f in build.sh build_ast3.sh; do
  grep -q " $N " "$D/$f" && { echo "$f already has $N"; continue; }
  grep -q " $A " "$D/$f" || { echo "$f has no $A"; exit 1; }
  sed -i "s/ $A / $A $N /" "$D/$f"; echo "$f: $N after $A"
done
