#!/bin/bash
# rebuild type-warriors-source.zip from the source folder (excludes build outputs); run from anywhere
cd "$(dirname "$0")/.." || exit 1
rm -f type-warriors-source.zip
zip -qr type-warriors-source.zip type-warriors-source -x 'type-warriors-source/out.html' 'type-warriors-source/out.js' 'type-warriors-source/out_ast.html' 'type-warriors-source/out_ast.js' 'type-warriors-source/before.html' 'type-warriors-source/shots/*' '*/__pycache__/*'
ls -la type-warriors-source.zip
