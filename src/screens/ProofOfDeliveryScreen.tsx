import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { orderService } from '../services/orderService';

interface NavigationProps {
  navigation: any;
  route: any;
}

const ProofOfDeliveryScreen: React.FC<NavigationProps> = ({ navigation, route }) => {
  const [otpCode, setOtpCode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const { task, order } = route.params;

  const handleSendOTP = () => {
    Alert.alert('OTP Sent', 'A 6-digit verification code has been sent to the customer.');
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const isValid = await orderService.verifyOTP(task.id, otpCode);
      
      if (isValid) {
        setOtpVerified(true);
        Alert.alert('Success', 'Customer identity verified successfully!');
      } else {
        Alert.alert('Invalid OTP', 'The verification code is incorrect. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = () => {
    Alert.alert(
      'Upload Document',
      'Choose document type to upload:',
      [
        { text: 'Camera', onPress: () => console.log('Open camera') },
        { text: 'Gallery', onPress: () => console.log('Open gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCompleteDelivery = async () => {
    if (!otpVerified) {
      Alert.alert('Verification Required', 'Please verify customer OTP before completing delivery.');
      return;
    }

    try {
      setLoading(true);
      await orderService.completeDelivery(task.id, {
        otp_code: otpCode,
        delivery_notes: deliveryNotes,
      });

      Alert.alert(
        'Delivery Completed',
        'The delivery has been marked as completed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('MyTasks');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proof of Delivery</Text>
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>{task.order_id}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Customer Info */}
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order?.customer_name || 'Emily Davis'}</Text>
          <Text style={styles.orderText}>{task.order_id}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoText}>Sep 1, 2025, 11:57 PM</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>GPS Location</Text>
          </View>
          
          <Text style={styles.addressText}>
            {order?.delivery_address || '777 Retail Center, North Hills, CA 90215'}
          </Text>
        </View>

        {/* OTP Verification Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>#</Text>
            <Text style={styles.sectionTitle}>Customer OTP Verification</Text>
          </View>

          {!otpVerified ? (
            <>
              <View style={styles.otpInstructions}>
                <Text style={styles.instructionText}>
                  Ask the customer for their 6-digit delivery confirmation code.
                </Text>
              </View>

              <View style={styles.otpInputContainer}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="numeric"
                  maxLength={6}
                />
                <TouchableOpacity style={styles.sendOtpButton} onPress={handleSendOTP}>
                  <Text style={styles.sendOtpText}>Send OTP</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.verifyButton, otpCode.length !== 6 && styles.verifyButtonDisabled]}
                onPress={handleVerifyOTP}
                disabled={otpCode.length !== 6 || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.otpVerifiedContainer}>
              <Text style={styles.otpVerifiedIcon}>✓</Text>
              <View>
                <Text style={styles.otpVerifiedTitle}>OTP Verified Successfully</Text>
                <Text style={styles.otpVerifiedSubtext}>
                  Customer identity confirmed at Sep 1, 2025, 11:58 PM
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Proof of Delivery Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>��</Text>
            <Text style={styles.sectionTitle}>Proof of Delivery Documents</Text>
          </View>

          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocument}>
            <Text style={styles.uploadIcon}>⬆️</Text>
            <Text style={styles.uploadText}>Upload Document</Text>
          </TouchableOpacity>
          
          <Text style={styles.uploadDescription}>
            Upload delivery receipts, photos, or other proof of delivery documents
          </Text>
        </View>

        {/* Delivery Notes */}
        <View style={styles.section}>
          <Text style={styles.notesTitle}>Delivery Notes</Text>
          
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes about the delivery..."
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Complete Delivery Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.completeButton, !otpVerified && styles.completeButtonDisabled]}
          onPress={handleCompleteDelivery}
          disabled={!otpVerified || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.completeButtonIcon}>⬆️</Text>
              <Text style={styles.completeButtonText}>Complete Delivery</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  orderBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  orderBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  customerInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  orderText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  addressText: {
    fontSize: 16,
    color: '#000',
    marginTop: 8,
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  otpInstructions: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  otpInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  otpInput: {
    flex: 1,
    height: 48,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  sendOtpButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendOtpText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  otpVerifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  otpVerifiedIcon: {
    fontSize: 24,
    color: '#34C759',
    marginRight: 12,
  },
  otpVerifiedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 4,
  },
  otpVerifiedSubtext: {
    fontSize: 14,
    color: '#666',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  uploadDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  notesInput: {
    borderColor: '#E5E5E5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 120,
  },
  bottomButtonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  completeButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProofOfDeliveryScreen;
