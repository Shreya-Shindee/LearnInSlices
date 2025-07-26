@echo off
REM LearnInSlices Development Setup Script for Windows

echo 🚀 Setting up LearnInSlices Development Environment...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if Node.js is installed  
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 16+ and try again
    pause
    exit /b 1
)

echo ✅ Python and Node.js detected

REM Create virtual environment for backend
echo 📦 Setting up Python virtual environment...
cd backend
if not exist venv (
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo ✅ Backend dependencies installed

REM Setup frontend
echo 📦 Setting up frontend dependencies...
cd ..\frontend
call npm install

echo ✅ Frontend dependencies installed

REM Go back to root
cd ..

echo 🎉 Development environment setup complete!
echo.
echo To start the application:
echo   Backend:  cd backend && venv\Scripts\activate.bat && python start.py
echo   Frontend: cd frontend && npm run dev
echo.
echo Don't forget to:
echo   1. Copy backend\.env.example to backend\.env and configure
echo   2. Set up your PostgreSQL database
echo   3. Add your OpenAI API key to the .env file
echo.
pause
