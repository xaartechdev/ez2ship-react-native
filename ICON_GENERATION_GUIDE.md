# App Icon Generation Guide

This guide explains how to generate app icons for the EZ2SHIP mobile application from your SVG logo.

## Overview

The app uses a custom JavaScript script powered by Sharp (Node.js image processing library) to generate all required icon sizes for both iOS and Android platforms from the SVG logo file.

## Generated Icons

### iOS Icons (14 sizes)
- **AppIcon.appiconset**: Located in `ios/Ez2ship/Images.xcassets/AppIcon.appiconset/`
- Sizes: 20px, 29px, 32px, 40px, 58px, 60px, 76px, 80px, 87px, 120px, 152px, 167px, 180px, 1024px

### Android Icons (5 densities)
- **Launcher Icons**: Located in `android/app/src/main/res/mipmap-{density}/`
- Densities: mdpi (48px), hdpi (72px), xhdpi (96px), xxhdpi (144px), xxxhdpi (192px)
- Includes both `ic_launcher.png` and `ic_launcher_round.png` variants

## How to Generate Icons

### Prerequisites
- Node.js (already installed in your project)
- Sharp library (installed as dev dependency)

### Steps

1. **Place your logo**: Ensure your SVG logo file is located at:
   ```
   src/assets/images/LOGO-SVG.svg
   ```

2. **Run the generator**: Use one of these commands:
   ```bash
   # Using npm script (recommended)
   npm run generate-icons
   
   # Or directly with node
   node generate-icons.js
   ```

3. **Verify generation**: The script will create icons in the appropriate directories and show a success summary.

4. **Rebuild your app**:
   ```bash
   # For iOS
   cd ios && pod install && cd .. && npx react-native run-ios
   
   # For Android
   npx react-native run-android
   ```

## Current Logo

The current logo (`LOGO-SVG.svg`) features:
- **Company**: EZ2SHIP logistics/shipping company
- **Colors**: Navy blue (#010056, #072643), Gold (#e8b23f, #e58e00), White (#fff)
- **Format**: Vector SVG for crisp scaling at all sizes
- **Background**: Transparent, suitable for all app icon contexts

## Icon Generation Features

- **Automatic scaling**: Maintains aspect ratio and quality
- **Transparent background**: Icons work on any background color
- **Platform optimization**: Generates correct formats for iOS and Android
- **Batch processing**: All 24 icons generated in seconds
- **Error handling**: Clear feedback if generation fails

## Troubleshooting

### If icons don't appear:
1. Clean and rebuild the project
2. Check that files were generated in correct directories
3. Restart Metro bundler: `npx react-native start --reset-cache`

### If generation fails:
1. Verify the SVG file exists and is valid
2. Check Node.js and Sharp installation: `npm list sharp`
3. Ensure write permissions for target directories

## Future Updates

To update the app icon with a new logo:
1. Replace `src/assets/images/LOGO-SVG.svg` with your new logo
2. Run `npm run generate-icons`
3. Rebuild and test on both platforms

---

*Generated on: ${new Date().toLocaleDateString()}*
*Script: generate-icons.js*
*Total icons generated: 24 (14 iOS + 10 Android)*