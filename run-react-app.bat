@echo off
title Storage Management React App Launcher

REM Set up Node.js environment properly
set NODE_PATH=C:\Users\produkcja\nodejs
set PATH=%NODE_PATH%;%PATH%

echo ========================================
echo   Storage Management React App Launcher
echo ========================================
echo.

echo Setting up Node.js environment...
echo Node.js path: %NODE_PATH%
echo.

REM Change to project directory first
cd /d "C:\Users\produkcja\Videos\storeage house menagement\storage-management-react"
if errorlevel 1 (
    echo ERROR: Could not change to project directory!
    echo Make sure the path exists.
    goto :end
)

echo Current directory: %CD%
echo.

REM Check Node.js installation
echo Checking Node.js installation...
"%NODE_PATH%\node.exe" --version
if errorlevel 1 (
    echo ERROR: Node.js not found or not working!
    echo Please check if Node.js is properly extracted to: %NODE_PATH%
    goto :end
)

echo Node.js version:
"%NODE_PATH%\node.exe" --version

echo NPM version:
"%NODE_PATH%\npm.cmd" --version
echo.

REM Check for package.json
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Make sure you're in the correct React project directory.
    goto :end
)

echo ✓ package.json found
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take several minutes, please wait...
    echo.
    "%NODE_PATH%\npm.cmd" install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        echo Check your internet connection and try again.
        goto :end
    )
    echo.
    echo ✓ Dependencies installed successfully!
) else (
    echo ✓ Dependencies already installed
)

echo.
echo Starting development server...
echo.
echo The app will open in your browser at: http://localhost:3000
echo Press Ctrl+C to stop the server when you're done.
echo.

REM Start the development server with proper environment
"%NODE_PATH%\npm.cmd" run dev

echo.
echo Development server stopped.

:end
echo.
echo ========================================
echo Press any key to exit...
pause
