#!/bin/bash
# Geolocation Fix Script for React Native
# Run this script to fix geolocation issues

echo "🔧 Starting Geolocation Fix Process..."

# Step 1: Stop any running Metro processes
echo "1. Stopping Metro processes..."
pkill -f "react-native" || echo "No Metro processes found"

# Step 2: Clean Metro cache
echo "2. Cleaning Metro cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null

# Step 3: Clean Android build
echo "3. Cleaning Android build..."
cd android
./gradlew clean
cd ..

# Step 4: Clean node modules (optional, uncomment if needed)
# echo "4. Cleaning node modules..."
# rm -rf node_modules
# npm install

# Step 5: Rebuild and run
echo "5. Rebuilding and running app..."
npx react-native run-android --reset-cache

echo "✅ Rebuild complete! Check the logs for geolocation module availability."