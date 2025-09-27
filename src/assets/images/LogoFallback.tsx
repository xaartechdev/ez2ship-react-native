import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LogoFallbackProps {
  width?: number;
  height?: number;
}

export const LogoFallback: React.FC<LogoFallbackProps> = ({ width = 120, height = 100 }) => {
  return (
    <View style={[styles.logoContainer, { width, height }]}>
      <View style={styles.logoContent}>
        <Text style={styles.logoText}>EZ</Text>
        <Text style={styles.logoSubtext}>2SHIP</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a2951',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoContent: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff9500',
    letterSpacing: 1,
    marginTop: -5,
  },
});