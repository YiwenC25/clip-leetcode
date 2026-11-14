#!/usr/bin/bash

# Refresh the bundled solution library from the repo root copy.
[ -f solutions.md ] && cp solutions.md source/solutions.md

zip -r clip-leetcode.zip source/
