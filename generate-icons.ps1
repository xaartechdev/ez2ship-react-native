# EZ2SHIP Logo Icon Generation Script (PowerShell)
# This script helps generate all the required icon sizes for iOS and Android
# Requires ImageMagick to be installed: https://imagemagick.org/

param(
    [string]$SourceLogo = "src\assets\images\LOGO-SVG.svg"
)

# Function to check if ImageMagick is installed
function Test-ImageMagick {
    try {
        $null = Get-Command "magick" -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Check if ImageMagick is installed
if (-not (Test-ImageMagick)) {
    Write-Host "❌ ImageMagick is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   1. Go to https://imagemagick.org/script/download.php#windows" -ForegroundColor Yellow
    Write-Host "   2. Download 'ImageMagick-7.x.x-x-Q16-HDRI-x64-dll.exe'" -ForegroundColor Yellow
    Write-Host "   3. Run the installer and make sure to check 'Install development headers and libraries for C and C++'" -ForegroundColor Yellow
    Write-Host "   4. Add ImageMagick to your PATH environment variable" -ForegroundColor Yellow
    Write-Host "   5. Restart PowerShell and run this script again" -ForegroundColor Yellow
    Write-Host "" 
    Write-Host "Alternative installation methods:" -ForegroundColor Cyan
    Write-Host "   - Using Chocolatey: choco install imagemagick" -ForegroundColor Yellow  
    Write-Host "   - Using Scoop: scoop install imagemagick" -ForegroundColor Yellow
    Write-Host "   - Using winget: winget install ImageMagick.ImageMagick" -ForegroundColor Yellow
    
    # Try to open the download page
    try {
        Start-Process "https://imagemagick.org/script/download.php#windows"
        Write-Host "✅ Opening ImageMagick download page in your browser..." -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Please manually visit: https://imagemagick.org/script/download.php#windows" -ForegroundColor Yellow
    }
    
    exit 1
}

# Check if source logo exists
if (-not (Test-Path $SourceLogo)) {
    Write-Host "❌ Source logo not found at $SourceLogo" -ForegroundColor Red
    Write-Host "Please place the EZ2SHIP logo PNG file at this location first." -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Generating app icons for EZ2SHIP..." -ForegroundColor Green

# Create iOS app icons
Write-Host "📱 Generating iOS app icons..." -ForegroundColor Blue
$iOSIconsPath = "ios\Ez2ship\Images.xcassets\AppIcon.appiconset"

# iOS icon sizes
$iOSSizes = @(
    @{Size=20; Name="icon-20.png"},
    @{Size=29; Name="icon-29.png"},
    @{Size=32; Name="icon-32.png"},
    @{Size=40; Name="icon-40.png"},
    @{Size=58; Name="icon-58.png"},
    @{Size=60; Name="icon-60.png"},
    @{Size=76; Name="icon-76.png"},
    @{Size=80; Name="icon-80.png"},
    @{Size=87; Name="icon-87.png"},
    @{Size=120; Name="icon-120.png"},
    @{Size=152; Name="icon-152.png"},
    @{Size=167; Name="icon-167.png"},
    @{Size=180; Name="icon-180.png"},
    @{Size=1024; Name="icon-1024.png"}
)

foreach ($icon in $iOSSizes) {
    $outputPath = Join-Path $iOSIconsPath $icon.Name
    & magick $SourceLogo -resize "$($icon.Size)x$($icon.Size)" $outputPath
    Write-Host "  ✓ Generated $($icon.Name) ($($icon.Size)x$($icon.Size))" -ForegroundColor Green
}

Write-Host "✅ iOS icons generated!" -ForegroundColor Green

# Create Android app icons
Write-Host "🤖 Generating Android app icons..." -ForegroundColor Blue

$androidSizes = @(
    @{Size=48; Density="mdpi"},
    @{Size=72; Density="hdpi"},
    @{Size=96; Density="xhdpi"},
    @{Size=144; Density="xxhdpi"},
    @{Size=192; Density="xxxhdpi"}
)

foreach ($size in $androidSizes) {
    $basePath = "android\app\src\main\res\mipmap-$($size.Density)"
    $launcherPath = Join-Path $basePath "ic_launcher.png"
    $launcherRoundPath = Join-Path $basePath "ic_launcher_round.png"
    
    & magick $SourceLogo -resize "$($size.Size)x$($size.Size)" $launcherPath
    & magick $SourceLogo -resize "$($size.Size)x$($size.Size)" $launcherRoundPath
    
    Write-Host "  ✓ Generated icons for $($size.Density) ($($size.Size)x$($size.Size))" -ForegroundColor Green
}

Write-Host "✅ Android icons generated!" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 All app icons have been generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Clean and rebuild your React Native app"
Write-Host "2. Test the new logo displays correctly in the app"
Write-Host "3. Test app icons on both iOS and Android devices"
Write-Host ""
Write-Host "Commands to rebuild:" -ForegroundColor Cyan
Write-Host "  iOS: cd ios; pod install; cd ..; npx react-native run-ios"
Write-Host "  Android: npx react-native run-android"