import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { ENV } from '../../config/environment';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: ENV.DIMENSIONS.BORDER_RADIUS,
      paddingHorizontal: ENV.DIMENSIONS.PADDING,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.height = 36;
        baseStyle.paddingHorizontal = 12;
        break;
      case 'large':
        baseStyle.height = 56;
        baseStyle.paddingHorizontal = 24;
        break;
      default:
        baseStyle.height = ENV.DIMENSIONS.BUTTON_HEIGHT;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = disabled ? '#ccc' : ENV.COLORS.PRIMARY;
        break;
      case 'secondary':
        baseStyle.backgroundColor = disabled ? '#f5f5f5' : ENV.COLORS.SECONDARY;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = disabled ? '#ccc' : ENV.COLORS.PRIMARY;
        break;
      case 'danger':
        baseStyle.backgroundColor = disabled ? '#ccc' : ENV.COLORS.DANGER;
        break;
      case 'success':
        baseStyle.backgroundColor = disabled ? '#ccc' : ENV.COLORS.SUCCESS;
        break;
      case 'warning':
        baseStyle.backgroundColor = disabled ? '#ccc' : ENV.COLORS.WARNING;
        break;
    }

    // Full width
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: ENV.FONT_WEIGHTS.SEMI_BOLD,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseTextStyle.fontSize = ENV.FONT_SIZES.SMALL;
        break;
      case 'large':
        baseTextStyle.fontSize = ENV.FONT_SIZES.EXTRA_LARGE;
        break;
      default:
        baseTextStyle.fontSize = ENV.FONT_SIZES.LARGE;
    }

    // Variant text colors
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
      case 'success':
        baseTextStyle.color = ENV.COLORS.TEXT_WHITE;
        break;
      case 'outline':
        baseTextStyle.color = disabled ? '#ccc' : ENV.COLORS.PRIMARY;
        break;
      case 'warning':
        baseTextStyle.color = ENV.COLORS.TEXT_PRIMARY;
        break;
    }

    return baseTextStyle;
  };

  const buttonStyle = [getButtonStyle(), style];
  const titleStyle = [getTextStyle(), textStyle];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? ENV.COLORS.PRIMARY : ENV.COLORS.WHITE}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <>{icon}</>
          )}
          <Text style={titleStyle}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <>{icon}</>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;