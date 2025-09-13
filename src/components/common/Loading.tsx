import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { ENV } from '../../config/environment';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  overlay?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 'large',
  color = ENV.COLORS.PRIMARY,
  style,
  textStyle,
  overlay = false,
}) => {
  const containerStyle = [
    styles.container,
    overlay && styles.overlay,
    style,
  ];

  const messageStyle = [
    styles.message,
    textStyle,
  ];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={messageStyle}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: ENV.DIMENSIONS.PADDING,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  message: {
    marginTop: ENV.DIMENSIONS.MARGIN / 2,
    fontSize: ENV.FONT_SIZES.MEDIUM,
    color: ENV.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default Loading;