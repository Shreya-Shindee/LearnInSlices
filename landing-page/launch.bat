@echo off
echo.
echo ====================================
echo   LearnInSlices Landing Page
echo ====================================
echo.
echo Starting local development server...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python to serve the site...
    echo Open your browser to: http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    cd /d "%~dp0"
    python -m http.server 8000
    goto :end
)

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Node.js to serve the site...
    echo Open your browser to: http://localhost:3000
    echo Press Ctrl+C to stop the server
    echo.
    cd /d "%~dp0"
    npx serve . -l 3000
    goto :end
)

REM Fallback message
echo.
echo No suitable server found!
echo Please install Python or Node.js to run the development server.
echo.
echo Alternatively, you can:
echo 1. Open index.html directly in your browser
echo 2. Use your preferred local server solution
echo.
pause

:end
