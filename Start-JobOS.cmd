@echo off
setlocal enabledelayedexpansion
title JobOS — Autonomous Command Center

:: 1. Navigate to project root
cd /d "%~dp0"

echo ============================================================
echo   JobOS — Autonomous Command Center (Production Startup)
echo ============================================================
echo.

:: 2. Ensure logs directory exists
if not exist "logs" mkdir "logs"

:: 3. Verify core project files exist
if not exist "server.js" (
    echo [ERROR] server.js not found in "%~dp0"
    echo JobOS installation appears incomplete.
    pause
    exit /b 1
)

:: 4. Verify Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found on your system PATH.
    echo Please install Node.js v20 or newer from https://nodejs.org
    pause
    exit /b 1
)

:: 5. Verify dependencies exist
if not exist "node_modules" (
    echo Installing required dependencies...
    call npm.cmd install --no-audit --no-fund
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

:: 6. Verify and run production build
echo [1/4] Verifying production build...
call npm.cmd run build > logs\build.log 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Production build check failed.
    echo Your data has not been changed.
    echo Check logs\build.log for details.
    pause
    exit /b 1
)
echo       Build verified with zero errors.

:: 7. Check database state (NEVER WIPE EXISTING DATA)
echo [2/4] Checking production database...
if not exist "data" mkdir "data"
if not exist "data\backups" mkdir "data\backups"

if exist "data\jobos.db" (
    echo       Existing production database found. Preserving all user data.
) else (
    echo       No database found. Initializing clean production database...
    set NODE_ENV=production
    set JOBOS_SEED_DEMO=false
    node server/scripts/init-production.js > logs\init.log 2>&1
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to initialize clean production database.
        echo Check logs\init.log for details.
        pause
        exit /b 1
    )
    echo       Clean production database initialized successfully.
)

:: 8. Check if JobOS is already running on port 3000
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [3/4] Server is already running on port 3000. Verifying health...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-RestMethod -Uri 'http://localhost:3000/api/health' -TimeoutSec 3; if ($r.status -eq 'healthy') { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
    if !ERRORLEVEL! equ 0 (
        echo [4/4] JobOS is healthy and ready.
        set APP_URL=http://localhost:3000
        ping -n 1 codevampires.local >nul 2>&1
        if !ERRORLEVEL! equ 0 set APP_URL=http://codevampires.local:3000
        echo Opening !APP_URL! in your browser...
        start !APP_URL!
        echo.
        echo JobOS launched successfully.
        ping 127.0.0.1 -n 3 >nul
        exit /b 0
    )
)

:: 9. Start production server
echo [3/4] Starting JobOS production server...
set NODE_ENV=production
set PORT=3000

:: Start background node server redirecting stdout/stderr to startup.log
start "JobOS Production Server" /min cmd /c "node server.js > logs\startup.log 2>&1"

:: 10. Poll health endpoint until ready (up to 30 seconds)
echo [4/4] Waiting for server readiness at http://localhost:3000/api/health...
set READY=0
for /l %%i in (1,1,30) do (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-RestMethod -Uri 'http://localhost:3000/api/health' -TimeoutSec 2; if ($r.status -eq 'healthy') { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
    if !ERRORLEVEL! equ 0 (
        set READY=1
        goto :SERVER_READY
    )
    ping 127.0.0.1 -n 2 >nul
)

:SERVER_READY
if %READY% equ 1 (
    echo.
    echo ============================================================
    echo   JobOS is ready and running in PRODUCTION mode!
    echo ============================================================
    echo.
    set APP_URL=http://localhost:3000
    ping -n 1 codevampires.local >nul 2>&1
    if !ERRORLEVEL! equ 0 set APP_URL=http://codevampires.local:3000
    echo Opening !APP_URL! in your default browser...
    start !APP_URL!
    ping 127.0.0.1 -n 2 >nul
    exit /b 0
) else (
    echo.
    echo [ERROR] JobOS couldn't start within the expected time.
    echo Your data has not been changed.
    echo Check logs\startup.log for details.
    echo.
    pause
    exit /b 1
)
