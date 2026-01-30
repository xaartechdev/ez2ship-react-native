# Logo Update Instructions

## Required Actions

### 1. Main Logo File
- Save the new EZ2SHIP logo PNG file as: `src/assets/images/ez2ship-logo.png`
- The Logo component has been updated to use this PNG file instead of the old SVG

### 2. iOS App Icons
Replace all the following files in `ios/Ez2ship/Images.xcassets/AppIcon.appiconset/` with the new logo at the specified sizes:

- icon-20.png (20x20)
- icon-29.png (29x29)
- icon-40.png (40x40)
- icon-58.png (58x58)
- icon-60.png (60x60)
- icon-76.png (76x76)
- icon-80.png (80x80)
- icon-87.png (87x87)
- icon-120.png (120x120)
- icon-152.png (152x152)
- icon-167.png (167x167)
- icon-180.png (180x180)
- icon-1024.png (1024x1024)

### 3. Android App Icons
Replace all the following files with the new logo at the specified sizes:

#### mipmap-mdpi (Medium Density - 48dp)
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png` (48x48)

#### mipmap-hdpi (High Density - 72dp)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png` (72x72)

#### mipmap-xhdpi (Extra High Density - 96dp)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png` (96x96)

#### mipmap-xxhdpi (Extra Extra High Density - 144dp)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png` (144x144)

#### mipmap-xxxhdpi (Extra Extra Extra High Density - 192dp)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png` (192x192)

## What Has Been Updated

### Code Changes Made:
1. ✅ Updated `src/assets/images/Logo.tsx` to use PNG image instead of SVG
2. ✅ The Logo component now imports and displays the new PNG file
3. ✅ Added proper error handling and fallback to LogoFallback component
4. ✅ Uses proper React Native Image component with resizeMode="contain"

### Where the Logo is Used:
- Login Screen (`src/screens/LoginScreen.tsx`)
- App Loading Screen (`src/screens/AppLoadingScreen.tsx`)  
- Reset Password Screen (`src/screens/ResetPasswordScreen.tsx`)

## Next Steps:
1. **IMPORTANT**: Replace the placeholder file `src/assets/images/ez2ship-logo.png.placeholder` with the actual PNG logo file named `ez2ship-logo.png`
2. Generate and replace all iOS app icon sizes
3. Generate and replace all Android app icon sizes
4. Test the app to ensure the new logo displays correctly
5. Build and test on both iOS and Android devices

## Tools for Icon Generation:
You can use online tools or apps like:
- App Icon Generator (online)
- ImageOptim or TinyPNG for optimization
- Photoshop, Sketch, or Figma for manual resizing

The logo should maintain its aspect ratio and look good at small sizes for app icons.