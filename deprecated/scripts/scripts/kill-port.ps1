param(
  [Parameter(Mandatory=$true)][int]$Port
)

Write-Host "Killing processes listening on port $Port..."
$lines = netstat -ano | Select-String ":$Port"
if (-not $lines) {
  Write-Host "No process found on port $Port"
  exit 0
}
$pids = $lines -replace '.*\s(\d+)$', '$1' | Sort-Object -Unique
foreach ($pid in $pids) {
  try {
    Write-Host "Stopping PID $pid"
    Stop-Process -Id $pid -Force -ErrorAction Stop
  } catch {
    Write-Warning "Failed to stop PID ${pid}: $_"
  }
}
Write-Host "Done."
