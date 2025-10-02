import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { ENV } from '../../config/environment';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  maxLength?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  maxLength,
  style,
  inputStyle,
  labelStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const containerStyle = [
    styles.container,
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
    disabled && styles.inputContainerDisabled,
  ];

  const textInputStyle = [
    styles.textInput,
    leftIcon ? styles.textInputWithLeftIcon : undefined,
    rightIcon ? styles.textInputWithRightIcon : undefined,
    multiline ? styles.textInputMultiline : undefined,
    inputStyle,
  ].filter(Boolean);

  const currentLabelStyle = [
    styles.label,
    labelStyle,
  ];

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={currentLabelStyle}>{label}</Text>
      )}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={textInputStyle}
          placeholder={placeholder}
          placeholderTextColor={ENV.COLORS.TEXT_MUTED}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: ENV.DIMENSIONS.MARGIN / 2,
  },
  label: {
    fontSize: ENV.FONT_SIZES.MEDIUM,
    fontWeight: ENV.FONT_WEIGHTS.MEDIUM,
    color: ENV.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ENV.COLORS.INPUT_BACKGROUND,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: ENV.DIMENSIONS.BORDER_RADIUS,
    minHeight: ENV.DIMENSIONS.INPUT_HEIGHT,
  },
  inputContainerFocused: {
    borderColor: ENV.COLORS.PRIMARY,
    backgroundColor: ENV.COLORS.WHITE,
  },
  inputContainerError: {
    borderColor: ENV.COLORS.DANGER,
  },
  inputContainerDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  textInput: {
    flex: 1,
    fontSize: ENV.FONT_SIZES.MEDIUM,
    color: ENV.COLORS.TEXT_PRIMARY,
    paddingHorizontal: ENV.DIMENSIONS.PADDING,
    paddingVertical: 12,
  },
  textInputWithLeftIcon: {
    paddingLeft: 8,
  },
  textInputWithRightIcon: {
    paddingRight: 8,
  },
  textInputMultiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  leftIconContainer: {
    paddingLeft: ENV.DIMENSIONS.PADDING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    paddingRight: ENV.DIMENSIONS.PADDING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: ENV.FONT_SIZES.SMALL,
    color: ENV.COLORS.DANGER,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;