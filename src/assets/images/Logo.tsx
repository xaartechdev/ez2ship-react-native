import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LogoFallback } from './LogoFallback';

interface LogoProps {
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ width = 120, height = 100 }) => {
  try {
    return (
      <View style={[styles.logoContainer, { width, height }]}>
        <Image
          source={require('./ez2ship-logo.png')}
          style={[styles.logoImage, { width, height }]}
          resizeMode="contain"
          onError={() => {
            console.warn('Failed to load logo image, falling back to LogoFallback');
          }}
        />
      </View>
    );
  } catch (error) {
    // Fallback to text-based logo if image fails to load
    return <LogoFallback width={width} height={height} />;
  }
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
});