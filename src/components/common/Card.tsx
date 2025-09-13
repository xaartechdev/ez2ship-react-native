import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { ENV } from '../../config/environment';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  elevation?: number;
  padding?: number;
  margin?: number;
  borderRadius?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  disabled = false,
  elevation = ENV.DIMENSIONS.CARD_ELEVATION,
  padding = ENV.DIMENSIONS.PADDING,
  margin = 0,
  borderRadius = ENV.DIMENSIONS.BORDER_RADIUS,
}) => {
  const cardStyle: ViewStyle = {
    backgroundColor: ENV.COLORS.CARD_BACKGROUND,
    borderRadius,
    padding,
    margin,
    shadowColor: ENV.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.1,
    shadowRadius: elevation * 2,
    elevation,
  };

  const containerStyle = [cardStyle, style];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

export default Card;