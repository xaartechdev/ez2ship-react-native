import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ENV } from '../../config/environment';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    // Here you could log to crash reporting service
    // crashlytics().recordError(error);
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.retry);
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={this.retry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ENV.DIMENSIONS.PADDING * 2,
    backgroundColor: ENV.COLORS.BACKGROUND,
  },
  title: {
    fontSize: ENV.FONT_SIZES.HEADING_MEDIUM,
    fontWeight: ENV.FONT_WEIGHTS.BOLD,
    color: ENV.COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: ENV.DIMENSIONS.MARGIN,
  },
  message: {
    fontSize: ENV.FONT_SIZES.MEDIUM,
    color: ENV.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: ENV.DIMENSIONS.MARGIN * 2,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: ENV.COLORS.PRIMARY,
    paddingHorizontal: ENV.DIMENSIONS.PADDING * 2,
    paddingVertical: ENV.DIMENSIONS.PADDING,
    borderRadius: ENV.DIMENSIONS.BORDER_RADIUS,
  },
  retryButtonText: {
    color: ENV.COLORS.TEXT_WHITE,
    fontSize: ENV.FONT_SIZES.LARGE,
    fontWeight: ENV.FONT_WEIGHTS.SEMI_BOLD,
  },
});

export default ErrorBoundary;