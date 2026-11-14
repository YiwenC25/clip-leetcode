#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$src = Join-Path $PSScriptRoot 'source'
$dst = Join-Path $PSScriptRoot 'clip-leetcode.zip'

if (Test-Path $dst) { Remove-Item $dst }

# Refresh the bundled solution library from the repo root copy.
$solutions = Join-Path $PSScriptRoot 'solutions.md'
if (Test-Path $solutions) { Copy-Item $solutions $src -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem
# includeBaseDirectory = $true: same layout as zip.sh (source/ at the zip root)
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    $src, $dst, [System.IO.Compression.CompressionLevel]::Optimal, $true)

Write-Host "Created $dst"
