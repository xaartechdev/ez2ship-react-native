#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const SOURCE_LOGO = 'src/assets/images/LOGO-SVG.svg';
const APP_NAME = 'Ez2ship';

// iOS icon sizes and their corresponding filenames
const iosIconSizes = [
    { size: 20, name: 'icon-20.png' },
    { size: 29, name: 'icon-29.png' },
    { size: 32, name: 'icon-32.png' },
    { size: 40, name: 'icon-40.png' },
    { size: 58, name: 'icon-58.png' },
    { size: 60, name: 'icon-60.png' },
    { size: 76, name: 'icon-76.png' },
    { size: 80, name: 'icon-80.png' },
    { size: 87, name: 'icon-87.png' },
    { size: 120, name: 'icon-120.png' },
    { size: 152, name: 'icon-152.png' },
    { size: 167, name: 'icon-167.png' },
    { size: 180, name: 'icon-180.png' },
    { size: 1024, name: 'icon-1024.png' }
];

// Android icon sizes for different densities
const androidIconSizes = [
    { size: 48, density: 'mdpi' },
    { size: 72, density: 'hdpi' },
    { size: 96, density: 'xhdpi' },
    { size: 144, density: 'xxhdpi' },
    { size: 192, density: 'xxxhdpi' }
];

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dirPath}`);
    }
}

// Helper function to generate a single icon
async function generateIcon(sourcePath, outputPath, size) {
    try {
        await sharp(sourcePath)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
            })
            .png()
            .toFile(outputPath);
        
        console.log(`  ✅ Generated ${path.basename(outputPath)} (${size}x${size})`);
        return true;
    } catch (error) {
        console.error(`  ❌ Failed to generate ${path.basename(outputPath)}:`, error.message);
        return false;
    }
}

// Main function
async function generateAppIcons() {
    console.log('🚀 Generating app icons for EZ2SHIP...\n');

    // Check if source logo exists
    if (!fs.existsSync(SOURCE_LOGO)) {
        console.error(`❌ Source logo not found at ${SOURCE_LOGO}`);
        console.error('Please make sure the SVG logo file exists at this location.');
        process.exit(1);
    }

    let successCount = 0;
    let totalCount = 0;

    // Generate iOS app icons
    console.log('📱 Generating iOS app icons...');
    const iosIconsPath = `ios/${APP_NAME}/Images.xcassets/AppIcon.appiconset`;
    ensureDirectoryExists(iosIconsPath);

    for (const icon of iosIconSizes) {
        const outputPath = path.join(iosIconsPath, icon.name);
        totalCount++;
        if (await generateIcon(SOURCE_LOGO, outputPath, icon.size)) {
            successCount++;
        }
    }

    console.log('✅ iOS icons completed!\n');

    // Generate Android app icons
    console.log('🤖 Generating Android app icons...');
    
    for (const iconConfig of androidIconSizes) {
        const androidPath = `android/app/src/main/res/mipmap-${iconConfig.density}`;
        ensureDirectoryExists(androidPath);
        
        // Generate both ic_launcher.png and ic_launcher_round.png
        const launcherPath = path.join(androidPath, 'ic_launcher.png');
        const launcherRoundPath = path.join(androidPath, 'ic_launcher_round.png');
        
        totalCount += 2;
        if (await generateIcon(SOURCE_LOGO, launcherPath, iconConfig.size)) {
            successCount++;
        }
        if (await generateIcon(SOURCE_LOGO, launcherRoundPath, iconConfig.size)) {
            successCount++;
        }
        
        console.log(`  ✅ Generated icons for ${iconConfig.density} (${iconConfig.size}x${iconConfig.size})`);
    }

    console.log('✅ Android icons completed!\n');

    // Summary
    console.log('🎉 Icon generation completed!\n');
    console.log(`📊 Generated ${successCount}/${totalCount} icons successfully\n`);
    
    if (successCount === totalCount) {
        console.log('✅ All icons generated successfully!\n');
        console.log('📋 Next steps:');
        console.log('1. Clean and rebuild your React Native app');
        console.log('2. Test the new logo displays correctly in the app');
        console.log('3. Test app icons on both iOS and Android devices\n');
        console.log('🔧 Commands to rebuild:');
        console.log('  iOS: cd ios && pod install && cd .. && npx react-native run-ios');
        console.log('  Android: npx react-native run-android');
    } else {
        console.log('⚠️  Some icons failed to generate. Please check the errors above.');
        process.exit(1);
    }
}

// Run the generator
generateAppIcons().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});