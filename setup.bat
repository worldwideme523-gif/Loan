@echo off
REM LoanCrypto Platform - Setup Script for Windows
REM This script helps set up and test the project

setlocal enabledelayedexpansion

echo ======================================
echo LoanCrypto Platform - Setup Script
echo ======================================
echo.

REM Check if both Backend and Frontend directories exist
if not exist "Backend" (
    echo [ERROR] Backend directory not found
    pause
    exit /b 1
)

if not exist "Frontend" (
    echo [ERROR] Frontend directory not found
    pause
    exit /b 1
)

:menu
cls
echo.
echo ======================================
echo LoanCrypto Platform - Setup Menu
echo ======================================
echo.
echo Select an action:
echo 1) Install dependencies
echo 2) Start Backend server
echo 3) Start Frontend server
echo 4) Seed testimonials
echo 5) Check API endpoints
echo 6) View integration guide
echo 0) Exit
echo.

set /p choice="Enter your choice (0-6): "

if "%choice%"=="1" goto install_deps
if "%choice%"=="2" goto start_backend
if "%choice%"=="3" goto start_frontend
if "%choice%"=="4" goto seed_testimonials
if "%choice%"=="5" goto check_endpoints
if "%choice%"=="6" goto view_guide
if "%choice%"=="0" goto exit_script

echo [ERROR] Invalid choice
timeout /t 2 >nul
goto menu

:install_deps
echo.
echo [STEP] Installing Backend dependencies...
cd Backend
call npm install
cd ..

echo.
echo [STEP] Installing Frontend dependencies...
cd Frontend
call npm install
cd ..

echo.
echo [SUCCESS] Dependencies installed successfully!
timeout /t 3 >nul
goto menu

:start_backend
echo.
echo [STEP] Starting Backend server on http://localhost:5000...
echo.
cd Backend
call npm run dev

:start_frontend
echo.
echo [STEP] Starting Frontend server on http://localhost:5174...
echo.
cd Frontend
call npm run dev

:seed_testimonials
echo.
echo [STEP] Seeding testimonials...
echo [WARNING] Make sure your backend is running on http://localhost:5000
echo.
timeout /t 2 >nul

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/testimonials/seed' -Method POST -ContentType 'application/json' -ErrorAction Stop; Write-Host '[SUCCESS] Testimonials seeded successfully!' -ForegroundColor Green; Write-Host $response.Content } catch { Write-Host '[ERROR] Failed to seed testimonials' -ForegroundColor Red; Write-Host $_.Exception.Message }"

echo.
timeout /t 3 >nul
goto menu

:check_endpoints
cls
echo.
echo [STEP] Checking API endpoints...
echo [WARNING] Make sure your backend is running on http://localhost:5000
echo.

echo [STEP] Testing GET /api/testimonials...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/testimonials' -ErrorAction Stop; Write-Host '[SUCCESS] Testimonials endpoint is working!' -ForegroundColor Green } catch { Write-Host '[ERROR] Testimonials endpoint failed' -ForegroundColor Red }"

echo.
echo [STEP] Testing GET /api/crypto/prices...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/crypto/prices' -ErrorAction Stop; Write-Host '[SUCCESS] Crypto endpoint is working!' -ForegroundColor Green } catch { Write-Host '[ERROR] Crypto endpoint failed' -ForegroundColor Red }"

echo.
timeout /t 5 >nul
goto menu

:view_guide
echo.
echo [STEP] Opening integration guide...
if exist "INTEGRATION_GUIDE.md" (
    start notepad.exe INTEGRATION_GUIDE.md
) else (
    echo [ERROR] INTEGRATION_GUIDE.md not found
)

timeout /t 2 >nul
goto menu

:exit_script
echo.
echo Goodbye!
exit /b 0
