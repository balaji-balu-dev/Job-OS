@echo off
setlocal enabledelayedexpansion
title Stop JobOS — Safe Shutdown

cd /d "%~dp0"

echo ============================================================
echo   JobOS — Safe Shutdown
echo ============================================================
echo.

:: 1. Check if server is running on port 3000
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo JobOS production server is not currently running.
    echo Port 3000 is free.
    ping 127.0.0.1 -n 2 >nul
    exit /b 0
)

echo Requesting graceful shutdown via JobOS API...

:: 2. Attempt clean API shutdown so SQLite closes safely
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-RestMethod -Uri 'http://localhost:3000/api/shutdown' -Method Post -TimeoutSec 2 | Out-Null } catch {}" >nul 2>&1

:: Wait up to 3 seconds for graceful exit
ping 127.0.0.1 -n 3 >nul

:: 3. Check if still running on port 3000
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Terminating process listening on port 3000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        set JOBOS_PID=%%a
        if defined JOBOS_PID (
            echo Stopping JobOS process PID !JOBOS_PID!...
            taskkill /PID !JOBOS_PID! /F >nul 2>&1
        )
    )
    ping 127.0.0.1 -n 2 >nul
)

:: 4. Verify port 3000 is released
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [WARNING] Port 3000 could not be verified as released.
    pause
    exit /b 1
) else (
    echo Port 3000 released successfully.
    echo.
    echo JobOS stopped safely.
    ping 127.0.0.1 -n 2 >nul
    exit /b 0
)
