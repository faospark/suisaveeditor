$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$ReleaseDir = Join-Path $Root "release"
$StagingRust = Join-Path $ReleaseDir "_stage_rust"
$StagingTauri = Join-Path $ReleaseDir "_stage_tauri"

New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null

# ----------------------------------------------------------------------------
# 1. Build & Package Native Rust (iced) Edition -> BrightShield-win64.zip
# ----------------------------------------------------------------------------
Write-Host "`n[1/2] Building Bright Shield (Native Rust / iced) release binary..." -ForegroundColor Cyan
cargo build --release --manifest-path (Join-Path $Root "rust-editor\Cargo.toml")

if (Test-Path $StagingRust) { Remove-Item -Recurse -Force $StagingRust }
New-Item -ItemType Directory -Force -Path $StagingRust | Out-Null

Copy-Item (Join-Path $Root "rust-editor\target\release\BrightShield.exe") (Join-Path $StagingRust "BrightShield.exe")
Copy-Item (Join-Path $Root "rust-editor\README.txt") (Join-Path $StagingRust "README.txt")
Copy-Item (Join-Path $Root "rust-editor\assets\fonts\OFL.txt") (Join-Path $StagingRust "OFL.txt")
Copy-Item (Join-Path $Root "rust-editor\assets\fonts\LICENSE-APACHE.txt") (Join-Path $StagingRust "LICENSE-APACHE.txt")

$RustZip = Join-Path $ReleaseDir "BrightShield-win64.zip"
if (Test-Path $RustZip) { Remove-Item -Force $RustZip }
Compress-Archive -Path (Join-Path $StagingRust "*") -DestinationPath $RustZip -CompressionLevel Optimal
Remove-Item -Recurse -Force $StagingRust
Write-Host "  Created: $RustZip ($(([math]::Round((Get-Item $RustZip).Length / 1MB, 2))) MB)" -ForegroundColor Green

# ----------------------------------------------------------------------------
# 2. Sync dist/ & Build Tauri Desktop Edition -> SuiSaveEditor-Tauri-win64.zip
# ----------------------------------------------------------------------------
Write-Host "`n[2/2] Syncing dist/ and building Tauri release binary..." -ForegroundColor Cyan
$DistDir = Join-Path $Root "dist"
if (Test-Path $DistDir) { Remove-Item -Recurse -Force $DistDir }
New-Item -ItemType Directory -Force -Path $DistDir | Out-Null

Copy-Item (Join-Path $Root "editor.html") (Join-Path $DistDir "editor.html")
Copy-Item (Join-Path $Root "editor.html") (Join-Path $DistDir "index.html")
Copy-Item (Join-Path $Root "CHANGELOG.md") (Join-Path $DistDir "CHANGELOG.md")
foreach ($folder in @("src", "css", "public", "image")) {
    Copy-Item -Recurse (Join-Path $Root $folder) (Join-Path $DistDir $folder)
}

cargo build --release --manifest-path (Join-Path $Root "src-tauri\Cargo.toml")

if (Test-Path $StagingTauri) { Remove-Item -Recurse -Force $StagingTauri }
New-Item -ItemType Directory -Force -Path $StagingTauri | Out-Null

Copy-Item (Join-Path $Root "src-tauri\target\release\suisaveeditor.exe") (Join-Path $StagingTauri "SuiSaveEditor-Tauri.exe")

$TauriZip = Join-Path $ReleaseDir "SuiSaveEditor-Tauri-win64.zip"
if (Test-Path $TauriZip) { Remove-Item -Force $TauriZip }
Compress-Archive -Path (Join-Path $StagingTauri "*") -DestinationPath $TauriZip -CompressionLevel Optimal
Remove-Item -Recurse -Force $StagingTauri
Write-Host "  Created: $TauriZip ($(([math]::Round((Get-Item $TauriZip).Length / 1MB, 2))) MB)" -ForegroundColor Green

Write-Host "`nDone! Upload both zips from release\ to your GitHub Release:" -ForegroundColor Yellow
Get-ChildItem $ReleaseDir -Filter "*.zip" | Select-Object Name, @{Name="MB";Expression={[math]::Round($_.Length / 1MB, 2)}} | Format-Table -AutoSize
