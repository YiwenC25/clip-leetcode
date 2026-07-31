#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$src = Join-Path $PSScriptRoot 'source_firefox'
$dst = Join-Path $PSScriptRoot 'clip-leetcode.xpi'

if (Test-Path $dst) { Remove-Item $dst }

Add-Type -AssemblyName System.IO.Compression.FileSystem
# includeBaseDirectory = $false: Firefox requires manifest.json at the xpi root
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    $src, $dst, [System.IO.Compression.CompressionLevel]::Optimal, $false)

Write-Host "Created $dst"
