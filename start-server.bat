@echo off
echo Starting local web server to avoid CORS issues...
echo.
echo Checking for Python...
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python found! Starting server on port 8000...
    echo Open your browser to: http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else (
    echo Python not found. Checking for Node.js...
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Node.js found! Starting server on port 8000...
        echo Open your browser to: http://localhost:8000
        echo Press Ctrl+C to stop the server
        echo.
        npx http-server . -p 8000
    ) else (
        echo Neither Python nor Node.js found.
        echo Please install one of them to run a local server.
        echo.
        echo Python: https://www.python.org/downloads/
        echo Node.js: https://nodejs.org/
        pause
    )
)
