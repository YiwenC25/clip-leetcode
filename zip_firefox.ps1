#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$src = Join-Path $PSScriptRoot 'source_firefox'
$dst = Join-Path $PSScriptRoot 'clip-leetcode.xpi'

if (Test-Path $dst) { Remove-Item $dst }

# Refresh the bundled solution library from the repo root copy.
$solutions = Join-Path $PSScriptRoot 'solutions.md'
if (Test-Path $solutions) { Copy-Item $solutions $src -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem
# includeBaseDirectory = $false: Firefox requires manifest.json at the xpi root
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    $src, $dst, [System.IO.Compression.CompressionLevel]::Optimal, $false)

Write-Host "Created $dst"
