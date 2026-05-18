@echo off
echo ==============================================
echo   WAVE MUSIC PLAYER - Starting Servers
echo ==============================================

:: Check if Python is installed
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not added to PATH.
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b
)

:: Install dependencies silently
echo Installing/Updating dependencies...
pip install -r requirements.txt -q

:: Start the YouTube Music Backend on port 8000
echo Starting YouTube Music Backend (port 8000)...
start /B python server.py

:: Start a simple HTTP server for the frontend on port 8080
echo Starting Frontend Server (port 8080)...
start /B python -m http.server 8080

:: Wait for servers to start
timeout /t 3 /nobreak >nul

:: Open the app in browser
echo Opening Wave Music Player...
start http://localhost:8080

echo.
echo ==============================================
echo   Backend: http://localhost:8000
echo   Frontend: http://localhost:8080
echo ==============================================
echo Keep this window open while using Wave.
pause
