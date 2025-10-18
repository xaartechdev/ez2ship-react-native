@echo off
REM Geolocation Fix Script for React Native (Windows)
REM Run this script to fix geolocation issues

echo 🔧 Starting Geolocation Fix Process...

REM Step 1: Stop any running Metro processes
echo 1. Stopping Metro processes...
taskkill /F /IM node.exe /T 2>nul || echo No Metro processes found

REM Step 2: Clean Metro cache
echo 2. Cleaning Metro cache...
npx react-native start --reset-cache
timeout /t 3 >nul
taskkill /F /IM node.exe /T 2>nul

REM Step 3: Clean Android build
echo 3. Cleaning Android build...
cd android
gradlew.bat clean
cd ..

REM Step 4: Clean node modules (optional, uncomment if needed)
REM echo 4. Cleaning node modules...
REM rmdir /s /q node_modules
REM npm install

REM Step 5: Rebuild and run
echo 5. Rebuilding and running app...
npx react-native run-android --reset-cache

echo ✅ Rebuild complete! Check the logs for geolocation module availability.
pause