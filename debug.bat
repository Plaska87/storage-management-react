@echo off
echo Starting debug script...
pause

echo Current directory: %CD%
pause

echo Listing current directory:
dir
pause

echo Checking Node.js folder:
if exist "C:\Users\produkcja\nodejs" (
    echo Node.js folder exists
) else (
    echo Node.js folder does NOT exist
)
pause

echo Testing Node.js:
"C:\Users\produkcja\nodejs\node.exe" --version
pause

echo Script completed successfully!
pause
