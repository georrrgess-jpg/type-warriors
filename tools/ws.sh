#!/bin/bash
# Isolated workspaces so several agents can build and test at once without overwriting each other's out.html.
#   bash tools/ws.sh new NAME     lean copy of source + tools into $WSROOT/NAME/{base,work}  (base = untouched snapshot)
#   bash tools/ws.sh diff NAME    unified diff of work vs base (new files included); build outputs, backups and the build lists excluded
#   bash tools/ws.sh apply NAME   apply that diff to the real repo (dry run first; stops if anything rejects)
# WSROOT defaults to /tmp/tw_ws. Inside a workspace, work/ has type-warriors-source/ and tools/ like the repo root.
T="$(cd "$(dirname "$0")" && pwd)"; R="$(cd "$T/.." && pwd)"; WSROOT="${WSROOT:-/tmp/tw_ws}"; C="$1"; N="${2:?workspace name needed}"
W="${WSROOT:?}/${N:?}"
EXC=(--exclude='*bak*' --exclude='out.*' --exclude='out_ast.*' --exclude='out' --exclude='before.html' --exclude='shots' --exclude='refs' --exclude='__pycache__' --exclude='logs' --exclude='pylib' --exclude='HANDOFF.md.*' --exclude='*.png' --exclude='p.diff')
DEXC=("${EXC[@]}" --exclude='build.sh' --exclude='build_ast3.sh')   # module registration is done by hand with addmod.sh, never merged
case "$C" in
 new) rm -rf "$W"; mkdir -p "$W/base" "$W/work"
   for d in base work; do (cd "$R" && tar -c "${EXC[@]}" type-warriors-source tools) | tar -x -C "$W/$d"; done
   ln -s "$R/tools/pylib" "$W/work/tools/pylib"; echo "$W/work" ;;
 diff) cd "$W" && diff -ruN "${DEXC[@]}" base work | sed 's#^\(---\|+++\) \(base\|work\)/#\1 #' ;;
 apply) cd "$W" && diff -ruN "${DEXC[@]}" base work | sed 's#^\(---\|+++\) \(base\|work\)/#\1 #' > "$W/p.diff"
   cd "$R" && patch -p0 --dry-run < "$W/p.diff" >/dev/null && patch -p0 < "$W/p.diff" >/dev/null || { echo APPLY_FAILED; exit 1; }; echo APPLIED ;;
 *) echo "usage: ws.sh new|diff|apply NAME"; exit 1 ;;
esac
