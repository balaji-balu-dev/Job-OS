@echo off
setlocal enabledelayedexpansion
title JobOS — Fresh Production Initialization

cd /d "%~dp0"

echo ============================================================
echo   JobOS — Fresh Production Environment Initialization
echo ============================================================
echo.

if not exist "data" mkdir "data"
if not exist "data\backups" mkdir "data\backups"

:: 1. Check if database already exists
if exist "data\jobos.db" (
    echo [IMPORTANT] A production database already exists at data\jobos.db.
    echo Initialization will NOT silently overwrite it.
    echo.
    echo If you want to perform a DESTRUCTIVE reset and wipe existing data:
    echo   1. An automatic safety backup will be created first in data\backups\
    echo   2. All jobs, applications, and custom notes will be removed
    echo   3. System records (7 agents, portals, default templates) will be restored
    echo.
    set /p CONFIRM="Type RESET to confirm destructive reinitialization (or press Enter to cancel): "
    if /i not "!CONFIRM!"=="RESET" (
        echo.
        echo [CANCELLED] Initialization cancelled. Your database is completely unchanged.
        pause
        exit /b 0
    )

    :: Create safety backup first
    echo.
    echo [1/3] Creating mandatory pre-reset safety backup...
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set LDT=%%I
    set TIMESTAMP=!LDT:~0,4!-!LDT:~4,2!-!LDT:~6,2!-!LDT:~8,2!-!LDT:~10,2!
    set BACKUP_FILE=data\backups\jobos-pre-init-!TIMESTAMP!.db
    copy /y "data\jobos.db" "!BACKUP_FILE!" >nul
    if not exist "!BACKUP_FILE!" (
        echo [ERROR] Failed to create safety backup. Aborting reset.
        pause
        exit /b 1
    )
    echo       Safety backup verified: !BACKUP_FILE!

    :: Remove old DB and WAL files safely
    echo [2/3] Removing old database files...
    del /f /q "data\jobos.db" 2>nul
    del /f /q "data\jobos.db-wal" 2>nul
    del /f /q "data\jobos.db-shm" 2>nul
)

:: 2. Initialize pristine clean production database
echo [3/3] Initializing clean production database...
set NODE_ENV=production
set JOBOS_SEED_DEMO=false
node server/scripts/init-production.js

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Production database initialization failed.
    pause
    exit /b 1
)

echo ============================================================
echo   Clean JobOS Production Database Initialized Successfully!
echo ============================================================
echo.
echo You can now start JobOS by double-clicking Start-JobOS.cmd
echo.
pause
