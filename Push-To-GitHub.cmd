@echo off
title Push JobOS to GitHub
cd /d "%~dp0"

echo ============================================================
echo   JobOS — Push to GitHub (balaji-balu-dev/Job-OS)
echo ============================================================
echo.
echo Pushing production code to:
echo   https://github.com/balaji-balu-dev/Job-OS.git
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Code successfully pushed to GitHub!
) else (
    echo.
    echo [NOTE] If prompted by GitHub, sign in via the browser window.
)

echo.
pause
