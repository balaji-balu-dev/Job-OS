const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const desktopDir = path.join(process.env.USERPROFILE || 'C:\\Users\\balaj', 'Desktop', 'JobOS');
const projectDir = path.resolve(__dirname, '..');
const iconPath = path.join(projectDir, 'favicon.ico');

console.log(`Setting up JobOS Desktop folder at: ${desktopDir}`);

// Ensure target folder exists
if (!fs.existsSync(desktopDir)) {
  fs.mkdirSync(desktopDir, { recursive: true });
}

// 1. Create Wrapper Batch Scripts
const scripts = [
  {
    name: 'Start-JobOS.cmd',
    title: 'Launching JobOS...',
    target: 'Start-JobOS.cmd'
  },
  {
    name: 'Stop-JobOS.cmd',
    title: 'Stopping JobOS...',
    target: 'Stop-JobOS.cmd'
  },
  {
    name: 'Configure-Local-Domain.cmd',
    title: 'Configuring Local Domain (codevampires.local)...',
    target: 'Configure-Local-Domain.cmd'
  },
  {
    name: 'Push-To-GitHub.cmd',
    title: 'Pushing to GitHub...',
    target: 'Push-To-GitHub.cmd'
  },
  {
    name: 'Initialize-JobOS-Production.cmd',
    title: 'JobOS Production Initialization...',
    target: 'Initialize-JobOS-Production.cmd'
  }
];

for (const s of scripts) {
  const content = `@echo off\r\ntitle ${s.title}\r\ncd /d "${projectDir}"\r\ncall "${s.target}"\r\n`;
  fs.writeFileSync(path.join(desktopDir, s.name), content, 'utf8');
}

// 2. Create Internet Shortcut
const urlShortcut = `[InternetShortcut]\r\nURL=http://codevampires.local:3000\r\nIconFile=${iconPath}\r\nIconIndex=0\r\n`;
fs.writeFileSync(path.join(desktopDir, 'Open JobOS in Browser.url'), urlShortcut, 'utf8');

// 3. Create Windows Shortcuts (.lnk) via PowerShell
const createShortcutsPs = `
$wsh = New-Object -ComObject WScript.Shell

# Start JobOS Shortcut
$s1 = $wsh.CreateShortcut("${path.join(desktopDir, 'Start JobOS.lnk').replace(/\\/g, '\\\\')}")
$s1.TargetPath = "${path.join(projectDir, 'Start-JobOS.cmd').replace(/\\/g, '\\\\')}"
$s1.WorkingDirectory = "${projectDir.replace(/\\/g, '\\\\')}"
if (Test-Path "${iconPath.replace(/\\/g, '\\\\')}") {
    $s1.IconLocation = "${iconPath.replace(/\\/g, '\\\\')},0"
}
$s1.Description = "Start JobOS Career Command Center"
$s1.Save()

# Stop JobOS Shortcut
$s2 = $wsh.CreateShortcut("${path.join(desktopDir, 'Stop JobOS.lnk').replace(/\\/g, '\\\\')}")
$s2.TargetPath = "${path.join(projectDir, 'Stop-JobOS.cmd').replace(/\\/g, '\\\\')}"
$s2.WorkingDirectory = "${projectDir.replace(/\\/g, '\\\\')}"
$s2.IconLocation = "$env:SystemRoot\\\\System32\\\\shell32.dll,27"
$s2.Description = "Safely stop JobOS"
$s2.Save()
`;

try {
  execSync(`powershell -NoProfile -Command "${createShortcutsPs.replace(/\n/g, '; ')}"`, { stdio: 'inherit' });
} catch (err) {
  console.warn('Warning creating .lnk shortcuts:', err.message);
}

// 4. Create README - Daily Usage Guide.txt
const readme = `================================================================================
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
    ${projectDir}

Database location:
    ${projectDir}\\data\\jobos.db

Backups location:
    ${projectDir}\\data\\backups\\
    ${projectDir}\\backups\\

Your data is ALWAYS preserved across restarts, shutdowns, and application updates.
================================================================================
`;

fs.writeFileSync(path.join(desktopDir, 'README - Daily Usage Guide.txt'), readme, 'utf8');

console.log('Successfully created all daily usage files in Desktop\\JobOS!');
