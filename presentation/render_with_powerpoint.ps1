# Renders the deck with the locally installed Microsoft PowerPoint:
#   - exports every slide to PNG (for visual QA) into the folder given by -ImageDir
#   - saves a PDF copy next to the .pptx
# Usage: powershell -File render_with_powerpoint.ps1 [-ImageDir <path>] [-NoPdf]
param(
  [string]$Deck = (Join-Path $PSScriptRoot "HNX_Legal_Intelligence_Pitch.pptx"),
  [string]$ImageDir = (Join-Path $PSScriptRoot "renders"),
  [switch]$NoPdf
)
$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $ImageDir | Out-Null
Get-ChildItem $ImageDir -Filter "slide-*.png" -ErrorAction SilentlyContinue | Remove-Item -Force
$app = New-Object -ComObject PowerPoint.Application
try {
  # Open(FileName, ReadOnly, Untitled, WithWindow)
  $p = $app.Presentations.Open($Deck, -1, 0, 0)
  $n = $p.Slides.Count
  for ($i = 1; $i -le $n; $i++) {
    $p.Slides.Item($i).Export((Join-Path $ImageDir ("slide-{0:D2}.png" -f $i)), "PNG", 1600, 900)
  }
  if (-not $NoPdf) {
    $pdf = [System.IO.Path]::ChangeExtension($Deck, ".pdf")
    $p.SaveAs($pdf, 32)  # ppSaveAsPDF
    Write-Output "PDF: $pdf"
  }
  Write-Output "Slides exported: $n"
  $p.Close()
} finally {
  $app.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null
}
