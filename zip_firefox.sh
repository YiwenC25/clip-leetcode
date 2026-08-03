#!/usr/bin/bash

# Refresh the bundled solution library from the repo root copy.
[ -f solutions.md ] && cp solutions.md source_firefox/solutions.md

cd source_firefox && zip -r ../clip-leetcode.xpi . -x ".*" && cd ..
