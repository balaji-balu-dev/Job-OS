$desktopDir = "C:\Users\balaj\Desktop\JobOS"
$projectDir = "c:\Users\balaj\Antigravity Projects\Job OS"
$iconPath = Join-Path $projectDir "favicon.ico"

# Create folder on Desktop
if (-not (Test-Path $desktopDir)) {
    New-Item -ItemType Directory -Path $desktopDir -Force | Out-Null
    Write-Host "Created folder: $desktopDir"
}

# 1. Create Windows Shortcuts (.lnk)
$wsh = New-Object -ComObject WScript.Shell

# Start JobOS Shortcut
$startLnk = $wsh.CreateShortcut((Join-Path $desktopDir "Start JobOS.lnk"))
$startLnk.TargetPath = Join-Path $projectDir "Start-JobOS.cmd"
$startLnk.WorkingDirectory = $projectDir
if (Test-Path $iconPath) {
    $startLnk.IconLocation = "$iconPath,0"
}
$startLnk.Description = "Start JobOS — Autonomous AI Career Command Center"
$startLnk.Save()

# Stop JobOS Shortcut
$stopLnk = $wsh.CreateShortcut((Join-Path $desktopDir "Stop JobOS.lnk"))
$stopLnk.TargetPath = Join-Path $projectDir "Stop-JobOS.cmd"
$stopLnk.WorkingDirectory = $projectDir
$stopLnk.IconLocation = "$env:SystemRoot\System32\shell32.dll,27"
$stopLnk.Description = "Safely stop JobOS and release port 3000"
$stopLnk.Save()

# 2. Create Internet Shortcut (.url)
$urlContent = @"
[InternetShortcut]
URL=http://codevampires.local:3000
IconFile=$iconPath
IconIndex=0
"@
Set-Content -Path (Join-Path $desktopDir "Open JobOS in Browser.url") -Value $urlContent -Encoding UTF8

# 3. Create Direct Command Wrappers (so clicking .cmd directly from desktop works 100%)
$startCmd = @"
@echo off
title Launching JobOS...
cd /d "$projectDir"
call "Start-JobOS.cmd"
"@
Set-Content -Path (Join-Path $desktopDir "Start-JobOS.cmd") -Value $startCmd -Encoding ASCII

$stopCmd = @"
@echo off
title Stopping JobOS...
cd /d "$projectDir"
call "Stop-JobOS.cmd"
"@
Set-Content -Path (Join-Path $desktopDir "Stop-JobOS.cmd") -Value $stopCmd -Encoding ASCII

$configCmd = @"
@echo off
title Configuring Local Domain (codevampires.local)...
cd /d "$projectDir"
call "Configure-Local-Domain.cmd"
"@
Set-Content -Path (Join-Path $desktopDir "Configure-Local-Domain.cmd") -Value $configCmd -Encoding ASCII

$pushCmd = @"
@echo off
title Pushing to GitHub...
cd /d "$projectDir"
call "Push-To-GitHub.cmd"
"@
Set-Content -Path (Join-Path $desktopDir "Push-To-GitHub.cmd") -Value $pushCmd -Encoding ASCII

$initCmd = @"
@echo off
title JobOS Production Initialization...
cd /d "$projectDir"
call "Initialize-JobOS-Production.cmd"
"@
Set-Content -Path (Join-Path $desktopDir "Initialize-JobOS-Production.cmd") -Value $initCmd -Encoding ASCII

# 4. Create README - Daily Usage Guide.txt
$readmeContent = @"
================================================================================
           JobOS — Autonomous AI Career Command Center (Daily Usage)
================================================================================

Welcome to JobOS! This folder contains all the daily usage shortcuts and tools
to run and manage your local JobOS installation.

--------------------------------------------------------------------------------
1. DAILY USAGE: HOW TO START JOBOS
--------------------------------------------------------------------------------
Double-click:
    ▶ Start JobOS (or Start-JobOS.cmd)

What happens automatically:
  1. Checks Node.js runtime and dependencies.
  2. Verifies production assets.
  3. Verifies production database (PRESERVES your data; NEVER wipes your database).
  4. Starts the local production server.
  5. Waits for health check (http://localhost:3000/api/health).
  6. Automatically opens your browser at:
     http://codevampires.local:3000 (or http://localhost:3000)

--------------------------------------------------------------------------------
2. HOW TO STOP JOBOS SAFELY
--------------------------------------------------------------------------------
Double-click:
    ■ Stop JobOS (or Stop-JobOS.cmd)

What happens:
  - Sends a graceful shutdown signal to JobOS.
  - Flushes SQLite WAL logs safely to disk.
  - Releases port 3000 cleanly without affecting other programs.

--------------------------------------------------------------------------------
3. LOCAL CUSTOM DOMAIN (codevampires.local)
--------------------------------------------------------------------------------
To use http://codevampires.local:3000 instead of http://localhost:3000:
Double-click:
    ⚙ Configure-Local-Domain.cmd (Click "Yes" when Windows asks for Administrator)

This adds 127.0.0.1 codevampires.local to your Windows hosts file safely.

--------------------------------------------------------------------------------
4. PUSHING CODE TO GITHUB
--------------------------------------------------------------------------------
Double-click:
    ☁ Push-To-GitHub.cmd

Pushes your latest clean code commits to:
https://github.com/balaji-balu-dev/Job-OS.git
(Your personal database, resumes, credentials, and backups are strictly excluded by .gitignore)

--------------------------------------------------------------------------------
5. FIRST-TIME OR CLEAN RE-INITIALIZATION
--------------------------------------------------------------------------------
Double-click:
    ⚠ Initialize-JobOS-Production.cmd

Use ONLY when you want a brand new, empty production database.
- If data/jobos.db already exists, it will REFUSE to overwrite it without an
  explicit typed confirmation ("RESET").
- Automatically creates a safety backup before any reset.
- Seeds only system-required records (7 specialized agents, 9 job portals, templates).
- Contains 0 demo jobs, 0 sample applications, and 0 placeholder profiles.

--------------------------------------------------------------------------------
6. DATA SAFETY & BACKUPS
--------------------------------------------------------------------------------
Project location:
    $projectDir

Database location:
    $projectDir\data\jobos.db

Backups location:
    $projectDir\data\backups\
    $projectDir\backups\

Your data is ALWAYS preserved across restarts, shutdowns, and application updates.
================================================================================
"@

Set-Content -Path (Join-Path $desktopDir "README - Daily Usage Guide.txt") -Value $readmeContent -Encoding UTF8

Write-Host "Successfully populated $desktopDir with daily usage files!"
