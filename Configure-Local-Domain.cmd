@echo off
setlocal enabledelayedexpansion
title Configure codevampires.local Domain

cd /d "%~dp0"

echo ============================================================
echo   JobOS — Local Domain Setup (codevampires.local)
echo ============================================================
echo.

:: Check for Administrator privileges
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [NOTE] Administrator privileges required to update Windows hosts file.
    echo Requesting elevation prompt...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b 0
)

set HOSTS_FILE=%SystemRoot%\System32\drivers\etc\hosts

:: Check if entry already exists
findstr /i "codevampires.local" "%HOSTS_FILE%" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo codevampires.local is already configured in %HOSTS_FILE%!
) else (
    echo Adding 127.0.0.1 codevampires.local to %HOSTS_FILE%...
    echo.>>"%HOSTS_FILE%"
    echo # JobOS Local Development Domain>>"%HOSTS_FILE%"
    echo 127.0.0.1 codevampires.local>>"%HOSTS_FILE%"
    echo Successfully registered codevampires.local!
)

echo.
echo Verifying resolution:
ping -n 1 codevampires.local >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] codevampires.local resolves successfully to 127.0.0.1
) else (
    echo [NOTE] Domain added. DNS cache might take a few seconds to update.
)

echo.
echo You can now access JobOS at:
echo   http://codevampires.local:3000
echo.
pause
