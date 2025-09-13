import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProofOfDeliveryScreenProps {
  route?: {
    params?: {
      orderId: string;
    };
  };
  navigation?: any;
}

const ProofOfDeliveryScreen: React.FC<ProofOfDeliveryScreenProps> = ({ route, navigation }) => {
  const { orderId = '' } = route?.params || {};
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const orderData = {
    'ORD-2024-001': {
      customer: 'Sarah Johnson',
      address: '456 Customer Ave, Downtown, CA 90211',
    },
    'ORD-2024-002': {
      customer: 'Mike Chen',
      address: '321 Office Plaza, Business District, CA 90213',
    },
    'ORD-2024-003': {
      customer: 'Emily Davis',
      address: '777 Retail Center, North Hills, CA 90215',
    },
  };

  const order = orderData[orderId as keyof typeof orderData];

  const handleSendOTP = () => {
    Alert.alert('OTP Sent', 'A 6-digit verification code has been sent to the customer.');
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP code.');
      return;
    }
    
    setOtpVerified(true);
    Alert.alert('OTP Verified', 'Customer identity confirmed successfully.');
  };

  const handleUploadDocument = () => {
    Alert.alert('Upload Document', 'Document upload functionality would be implemented here.');
  };

  const handleCompleteDelivery = () => {
    if (!otpVerified) {
      Alert.alert('Verification Required', 'Please verify the customer OTP before completing delivery.');
      return;
    }

    Alert.alert(
      'Delivery Completed',
      'The delivery has been marked as completed successfully.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MyTasks'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proof of Delivery</Text>
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>{orderId}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Information */}
        <View style={styles.customerInfo}>
          <View style={styles.customerHeader}>
            <View>
              <Text style={styles.customerName}>{order.customer}</Text>
              <Text style={styles.customerOrderId}>{orderId}</Text>
            </View>
            <View style={styles.deliveryInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🕐</Text>
                <Text style={styles.infoText}>Sep 1, 2025, 11:57 PM</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText}>GPS Location</Text>
              </View>
            </View>
          </View>
          <Text style={styles.customerAddress}>{order.address}</Text>
        </View>

        {/* OTP Verification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}># Customer OTP Verification</Text>
          
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
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
                <TouchableOpacity style={styles.sendOtpButton} onPress={handleSendOTP}>
                  <Text style={styles.sendOtpText}>Send OTP</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOTP}>
                <Text style={styles.verifyButtonText}>Verify OTP</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.verifiedContainer}>
              <Text style={styles.verifiedIcon}>✅</Text>
              <View style={styles.verifiedInfo}>
                <Text style={styles.verifiedTitle}>OTP Verified Successfully</Text>
                <Text style={styles.verifiedText}>
                  Customer identity confirmed at Sep 1, 2025, 11:58 PM
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Proof of Delivery Documents */}
        <View style={styles.section}>
          <View style={styles.documentsHeader}>
            <Text style={styles.documentsIcon}>📎</Text>
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
          <Text style={styles.sectionTitle}>Delivery Notes</Text>
          
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

        {/* Complete Delivery Button */}
        <TouchableOpacity 
          style={[
            styles.completeButton,
            !otpVerified && styles.disabledButton
          ]} 
          onPress={handleCompleteDelivery}
          disabled={!otpVerified}
        >
          <Text style={styles.completeButtonText}>⬆️ Complete Delivery</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  orderBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  orderBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  customerInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  customerHeader: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  customerOrderId: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
  },
  customerAddress: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  otpInstructions: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#1976D2',
    lineHeight: 22,
  },
  otpInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginRight: 12,
  },
  sendOtpButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sendOtpText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#7dc8f7',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  verifiedContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  verifiedIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  verifiedInfo: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  verifiedText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  documentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  uploadButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    borderRadius: 12,
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
    color: '#6c757d',
    fontWeight: '600',
  },
  uploadDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 100,
  },
  completeButton: {
    backgroundColor: '#34C759',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProofOfDeliveryScreen;