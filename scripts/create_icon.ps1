Add-Type -AssemblyName System.Drawing

$size = 64
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Background gradient
$p1 = New-Object System.Drawing.Point 0, 0
$p2 = New-Object System.Drawing.Point $size, $size
$c1 = [System.Drawing.Color]::FromArgb(79, 70, 229)
$c2 = [System.Drawing.Color]::FromArgb(124, 58, 237)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $p1, $p2, $c1, $c2

$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$r = 16
$path.AddArc(2, 2, $r, $r, 180, 90)
$path.AddArc($size - 2 - $r, 2, $r, $r, 270, 90)
$path.AddArc($size - 2 - $r, $size - 2 - $r, $r, $r, 0, 90)
$path.AddArc(2, $size - 2 - $r, $r, $r, 90, 90)
$path.CloseFigure()

$g.FillPath($brush, $path)

# Subtle border
$penColor = [System.Drawing.Color]::FromArgb(70, 255, 255, 255)
$pen = New-Object System.Drawing.Pen $penColor, 2
$g.DrawPath($pen, $path)

# Symbol text
$font = [System.Drawing.Font]::new('Segoe UI', [float]26, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$rect = New-Object System.Drawing.RectangleF 6, 8, 44, 48
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString('J', $font, $textBrush, $rect, $sf)

# Sparkle accent
$sparkColor = [System.Drawing.Color]::FromArgb(56, 189, 248)
$sparkBrush = New-Object System.Drawing.SolidBrush $sparkColor
$g.FillEllipse($sparkBrush, 43, 14, 8, 8)

$g.Flush()

$iconPath = Join-Path $PSScriptRoot "..\favicon.ico"
$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream $iconPath, ([System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$bmp.Dispose()
Write-Host "Created $iconPath"
