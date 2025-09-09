<#
Unlock/Clean workspace for Windows EPERM issues
- Stops Node/Next processes
- Attempts to unlock common locked files by taking ownership and fixing ACLs
- Cleans .next cache (if present)
- Cleans Prisma generated client cache under node_modules/.prisma (if present)
- Optionally removes a known locked Next SWC binary if present

Run from project root in an elevated PowerShell:
  powershell -ExecutionPolicy Bypass -File .\scripts\unlock-workspace.ps1
Then reinstall/generate:
  npm ci
  npx prisma generate
  npm run dev
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'

function Write-Step($msg) { Write-Host "[unlock] $msg" -ForegroundColor Cyan }
function Try-Action($msg, [ScriptBlock]$action) {
  Write-Step $msg
  try { & $action } catch { Write-Warning "[unlock] $msg failed: $_" }
}

# 1) Kill node/next processes
Try-Action "Killing node.exe" { taskkill /F /IM node.exe /T 2>$null | Out-Null }
Try-Action "Killing next.exe (if any)" { taskkill /F /IM next.exe /T 2>$null | Out-Null }

# 2) Attempt to unlock known locked files
$projectRoot = (Get-Location).Path
$swcNode = Join-Path $projectRoot "node_modules\@next\swc-win32-x64-msvc\next-swc.win32-x64-msvc.node"
$prismaDll = Join-Path $projectRoot "node_modules\.prisma\client\query_engine-windows.dll.node"
$nextTrace = Join-Path $projectRoot ".next\trace"

$targets = @($swcNode, $prismaDll, $nextTrace)
foreach ($t in $targets) {
  if (Test-Path $t) {
    Try-Action "Unlocking $t (attrib/takeown/icacls)" {
      attrib -R -S -H $t -ErrorAction SilentlyContinue | Out-Null
      takeown /f $t | Out-Null
      icacls $t /grant "$env:USERNAME:(F)" /T /C | Out-Null
    }
  }
}

# 3) Remove .next cache (safe)
$nextDir = Join-Path $projectRoot ".next"
if (Test-Path $nextDir) {
  Try-Action "Removing .next cache" {
    attrib -R -S -H (Join-Path $nextDir "*") -Recurse -ErrorAction SilentlyContinue | Out-Null
    Remove-Item $nextDir -Recurse -Force -ErrorAction SilentlyContinue
  }
} else { Write-Step ".next not found; skipping" }

# 4) Clean Prisma generated client cache
$prismaDir = Join-Path $projectRoot "node_modules\.prisma"
if (Test-Path $prismaDir) {
  Try-Action "Removing node_modules/.prisma client cache" {
    attrib -R -S -H (Join-Path $prismaDir "*") -Recurse -ErrorAction SilentlyContinue | Out-Null
    Remove-Item $prismaDir -Recurse -Force -ErrorAction SilentlyContinue
  }
} else { Write-Step "node_modules/.prisma not found; skipping" }

# 5) If the SWC binary is still present, try to remove it explicitly
if (Test-Path $swcNode) {
  Try-Action "Removing Next SWC binary" { Remove-Item $swcNode -Force -ErrorAction SilentlyContinue }
}

Write-Host "[unlock] Done. Now run: `n`  npm ci`n  npx prisma generate`n  npm run dev" -ForegroundColor Green
