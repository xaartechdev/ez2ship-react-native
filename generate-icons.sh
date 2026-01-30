#!/bin/bash

# EZ2SHIP Logo Icon Generation Script
# This script helps generate all the required icon sizes for iOS and Android
# Requires ImageMagick to be installed: https://imagemagick.org/

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed. Please install it first:"
    echo "   Windows: Download from https://imagemagick.org/script/download.php#windows"
    echo "   macOS: brew install imagemagick"
    echo "   Linux: sudo apt-get install imagemagick"
    exit 1
fi

# Check if source logo exists
SOURCE_LOGO="src/assets/images/ez2ship-logo.png"
if [ ! -f "$SOURCE_LOGO" ]; then
    echo "❌ Source logo not found at $SOURCE_LOGO"
    echo "Please place the EZ2SHIP logo PNG file at this location first."
    exit 1
fi

echo "🚀 Generating app icons for EZ2SHIP..."

# Create iOS app icons
echo "📱 Generating iOS app icons..."
IOS_ICONS_PATH="ios/Ez2ship/Images.xcassets/AppIcon.appiconset"

# iOS icon sizes
convert "$SOURCE_LOGO" -resize 20x20 "$IOS_ICONS_PATH/icon-20.png"
convert "$SOURCE_LOGO" -resize 29x29 "$IOS_ICONS_PATH/icon-29.png"
convert "$SOURCE_LOGO" -resize 32x32 "$IOS_ICONS_PATH/icon-32.png"
convert "$SOURCE_LOGO" -resize 40x40 "$IOS_ICONS_PATH/icon-40.png"
convert "$SOURCE_LOGO" -resize 58x58 "$IOS_ICONS_PATH/icon-58.png"
convert "$SOURCE_LOGO" -resize 60x60 "$IOS_ICONS_PATH/icon-60.png"
convert "$SOURCE_LOGO" -resize 76x76 "$IOS_ICONS_PATH/icon-76.png"
convert "$SOURCE_LOGO" -resize 80x80 "$IOS_ICONS_PATH/icon-80.png"
convert "$SOURCE_LOGO" -resize 87x87 "$IOS_ICONS_PATH/icon-87.png"
convert "$SOURCE_LOGO" -resize 120x120 "$IOS_ICONS_PATH/icon-120.png"
convert "$SOURCE_LOGO" -resize 152x152 "$IOS_ICONS_PATH/icon-152.png"
convert "$SOURCE_LOGO" -resize 167x167 "$IOS_ICONS_PATH/icon-167.png"
convert "$SOURCE_LOGO" -resize 180x180 "$IOS_ICONS_PATH/icon-180.png"
convert "$SOURCE_LOGO" -resize 1024x1024 "$IOS_ICONS_PATH/icon-1024.png"

echo "✅ iOS icons generated!"

# Create Android app icons
echo "🤖 Generating Android app icons..."

# Android icon sizes
convert "$SOURCE_LOGO" -resize 48x48 "android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 48x48 "android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"

convert "$SOURCE_LOGO" -resize 72x72 "android/app/src/main/res/mipmap-hdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 72x72 "android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"

convert "$SOURCE_LOGO" -resize 96x96 "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 96x96 "android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"

convert "$SOURCE_LOGO" -resize 144x144 "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 144x144 "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"

convert "$SOURCE_LOGO" -resize 192x192 "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 192x192 "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"

echo "✅ Android icons generated!"

echo ""
echo "🎉 All app icons have been generated successfully!"
echo ""
echo "Next steps:"
echo "1. Clean and rebuild your React Native app"
echo "2. Test the new logo displays correctly in the app"
echo "3. Test app icons on both iOS and Android devices"
echo ""
echo "Commands to rebuild:"
echo "  iOS: cd ios && pod install && cd .. && npx react-native run-ios"
echo "  Android: npx react-native run-android"