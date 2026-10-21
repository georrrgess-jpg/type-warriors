#!/bin/bash
# Build the game from the module list, compare both build paths and syntax-check the result.
# Run from anywhere: bash tools/bld.sh   (needs type-warriors-source/ unzipped at the repo root)
cd "$(dirname "$0")/../type-warriors-source" || exit 1
bash build.sh >/dev/null 2>&1; bash build_ast3.sh >/dev/null 2>&1
cmp out.html out_ast.html && echo CMP OK
python3 -c "
import re;s=open('out.html').read();js='\n'.join(re.findall(r'<script>(.*?)</script>',s,re.S));open('/tmp/tw_chk.js','w').write(js)" && node --check /tmp/tw_chk.js && echo SYNTAX_OK
