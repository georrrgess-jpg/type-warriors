#!/bin/bash
# Build the game from the module list, compare both build paths and syntax-check the result.
# Run from anywhere: bash tools/bld.sh   (needs type-warriors-source/ unzipped at the repo root)
cd "$(dirname "$0")/../type-warriors-source" || exit 1
bash build.sh >/dev/null 2>&1; bash build_ast3.sh >/dev/null 2>&1
cmp out.html out_ast.html && echo CMP OK
CHK="$(mktemp /tmp/tw_chk.XXXXXX.js)"
python3 -c "
import re,sys;s=open('out.html').read();js='\n'.join(re.findall(r'<script>(.*?)</script>',s,re.S));open(sys.argv[1],'w').write(js)" "$CHK" && node --check "$CHK" && echo SYNTAX_OK
rm -f "$CHK"
