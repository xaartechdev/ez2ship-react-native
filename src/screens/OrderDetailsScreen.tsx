import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {orderService} from '../services/orderService';

interface Task {
  id: number;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  type: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  scheduled_pickup: string;
  delivery_date: string | null;
  amount: string;
  distance: number;
  is_overdue: boolean;
  can_accept: boolean;
  can_reject: boolean;
  can_update_status: boolean;
  order_notes: string | null;
  payment_status: string;
  vehicle_type: string;
  histories: any[];
}

interface OrderDetailsScreenProps {
  route: any;
  navigation: any;
}

const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const {task: initialTask} = route.params;
  const [task, setTask] = useState<Task>(initialTask);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP and Proof of Delivery states
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'assigned':
        return '#FF9500';
      case 'in_progress':
      case 'picked_up':
      case 'in_transit':
        return '#007AFF';
      case 'arrived':
      case 'arrived_at_destination':
        return '#34C759';
      case 'completed':
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Start Trip';
      case 'assigned':
        return 'Start Trip';
      case 'in_progress':
      case 'picked_up':
        return 'In Transit';
      case 'in_transit':
        return 'In Transit';
      case 'arrived':
      case 'arrived_at_destination':
        return 'Arrived at Destination';
      case 'completed':
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getActionButtonText = () => {
    switch (task.status) {
      case 'pending':
      case 'assigned':
        return 'Start Trip';
      case 'in_progress':
      case 'picked_up':
      case 'in_transit':
        return 'Arrived at Destination';
      case 'arrived':
      case 'arrived_at_destination':
        return 'Mark as Delivered';
      default:
        return '';
    }
  };

  const getActionButtonColor = () => {
    switch (task.status) {
      case 'pending':
      case 'assigned':
        return '#007AFF';
      case 'in_progress':
      case 'picked_up':
      case 'in_transit':
        return '#34C759';
      case 'arrived':
      case 'arrived_at_destination':
        return '#4CAF50';
      case 'completed':
        return '#4CAF50';
      default:
        return '#8E8E93';
    }
  };

  const getActionButtonIcon = () => {
    switch (task.status) {
      case 'pending':
      case 'assigned':
        return '✈️';
      case 'in_progress':
      case 'picked_up':
      case 'in_transit':
        return '';
      case 'arrived':
      case 'arrived_at_destination':
        return '';
      case 'completed':
        return '';
      default:
        return '';
    }
  };

  const handleActionPress = async () => {
    try {
      setLoading(true);
      
      switch (task.status) {
        case 'pending':
        case 'assigned':
          // Start the trip - update status to in_transit
          await orderService.updateOrderStatus(task.id, {
            status: 'in_transit',
            notes: notes
          });
          setTask({...task, status: 'in_transit'});
          break;
        case 'in_progress':
        case 'picked_up':
        case 'in_transit':
          // Arrive at destination - update status to arrived_at_destination
          await orderService.updateOrderStatus(task.id, {
            status: 'arrived_at_destination',
            notes: notes
          });
          setTask({...task, status: 'arrived_at_destination'});
          break;
        case 'arrived':
        case 'arrived_at_destination':
          // Complete delivery - check if OTP is verified
          if (!otpVerified) {
            Alert.alert('Verification Required', 'Please verify customer OTP before completing delivery.');
            return;
          }
          
          await orderService.updateOrderStatus(task.id, {
            status: 'completed',
            notes: notes
          });
          setTask({...task, status: 'completed'});
          
          Alert.alert(
            'Delivery Completed',
            'The delivery has been marked as completed successfully!',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('MyTasks'),
              },
            ]
          );
          return;
        default:
          return;
      }
      
      Alert.alert('Success', `Order status updated successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleCallPress = () => {
    Alert.alert('Call Customer', 'Would you like to call the customer?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Call', onPress: () => console.log('Call customer')},
    ]);
  };

  const handleAlertPress = () => {
    Alert.alert('Alert Customer', 'Send notification to customer?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Send', onPress: () => console.log('Alert customer')},
    ]);
  };

  const handleReportIssue = () => {
    Alert.alert('Report Issue', 'What type of issue would you like to report?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delay', onPress: () => console.log('Report delay')},
      {text: 'Damage', onPress: () => console.log('Report damage')},
      {text: 'Other', onPress: () => console.log('Report other issue')},
    ]);
  };

  // OTP and Proof of Delivery functions
  const handleSendOTP = () => {
    Alert.alert('OTP Sent', 'A 6-digit verification code has been sent to the customer.');
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit verification code.');
      return;
    }

    try {
      setOtpLoading(true);
      // Simulate OTP verification - replace with actual API call
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any 6-digit code
      setOtpVerified(true);
      Alert.alert('Success', 'Customer identity verified successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleUploadProof = () => {
    Alert.alert(
      'Upload Proof of Delivery',
      'Choose how to upload proof:',
      [
        { text: 'Camera', onPress: () => {
          console.log('Open camera');
          setProofUploaded(true);
          Alert.alert('Success', 'Proof of delivery uploaded successfully!');
        }},
        { text: 'Gallery', onPress: () => {
          console.log('Open gallery');
          setProofUploaded(true);
          Alert.alert('Success', 'Proof of delivery uploaded successfully!');
        }},
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{task.order_id}</Text>
        <View style={[styles.statusBadge, {backgroundColor: getActionButtonColor()}]}>
          <Text style={styles.statusBadgeText}>{getActionButtonText()}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Show full order details for pending orders, simplified for others */}
        {(task.status === 'pending' || task.status === 'assigned') ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Customer</Text>
                <Text style={styles.detailValue}>{task.customer_name}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Vehicle Type</Text>
                <Text style={styles.detailValue}>{task.vehicle_type}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>{task?.distance?.toFixed(1)} miles</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>35 min</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.simplifiedDetails}>
            <Text style={styles.simplifiedDistance}>{task?.distance?.toFixed(1)} miles</Text>
            <Text style={styles.simplifiedDuration}>35 min</Text>
          </View>
        )}

        {/* Scheduled Time with Call/Alert buttons */}
        <View style={styles.scheduledContainer}>
          <View style={styles.scheduledInfo}>
            <Text style={styles.scheduledLabel}>Scheduled</Text>
            <Text style={styles.scheduledTime}>
              {new Date(task.scheduled_pickup).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.callButton} onPress={handleCallPress}>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.alertButton} onPress={handleAlertPress}>
              <Text style={styles.alertIcon}>⚠️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressesContainer}>
          <View style={styles.addressItem}>
            <View style={[styles.addressDot, {backgroundColor: '#4CAF50'}]} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Pickup Address</Text>
              <Text style={styles.addressText}>{task.pickup_address}</Text>
            </View>
          </View>
          <View style={styles.addressItem}>
            <View style={[styles.addressDot, {backgroundColor: '#FF5722'}]} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Delivery Address</Text>
              <Text style={styles.addressText}>{task.delivery_address}</Text>
            </View>
          </View>
        </View>

        {/* Trip Progress */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trip Progress</Text>
          
          <View style={styles.tripProgressContainer}>
            {/* Start Trip */}
            <View style={styles.progressStep}>
              <View style={styles.progressStepContent}>
                <View style={[
                  styles.progressIcon,
                  (task.status !== 'pending' && task.status !== 'assigned') ? styles.progressIconCompleted : styles.progressIconPending
                ]}>
                  <Text style={[
                    styles.progressIconText,
                    (task.status !== 'pending' && task.status !== 'assigned') && styles.progressIconTextCompleted
                  ]}>
                    {(task.status !== 'pending' && task.status !== 'assigned') ? '✓' : '🚛'}
                  </Text>
                </View>
                <View style={styles.progressLabelContainer}>
                  <Text style={[
                    styles.progressLabel,
                    (task.status !== 'pending' && task.status !== 'assigned') && styles.progressLabelCompleted
                  ]}>
                    Start Trip
                  </Text>
                </View>
              </View>
              <View style={[
                styles.progressConnector,
                (task.status !== 'pending' && task.status !== 'assigned') && styles.progressConnectorActive
              ]} />
            </View>

          {/* In Transit */}
          {(task.status === 'in_progress' || task.status === 'picked_up' || task.status === 'in_transit' || 
            task.status === 'arrived' || task.status === 'arrived_at_destination' || task.status === 'completed' || task.status === 'delivered') && (
            <View style={styles.progressStep}>
              <View style={[
                styles.progressIcon,
                (task.status === 'in_progress' || task.status === 'picked_up' || task.status === 'in_transit') && styles.progressIconCurrent,
                (task.status === 'arrived' || task.status === 'arrived_at_destination' || task.status === 'completed' || task.status === 'delivered') && styles.progressIconCompleted
              ]}>
                <Text style={[
                  styles.progressIconText,
                  (task.status === 'in_progress' || task.status === 'picked_up' || task.status === 'in_transit' || 
                   task.status === 'arrived' || task.status === 'arrived_at_destination' || task.status === 'completed' || task.status === 'delivered') && styles.progressIconTextCompleted
                ]}>
                  �
                </Text>
              </View>
              <Text style={[
                styles.progressLabel,
                (task.status === 'in_progress' || task.status === 'picked_up' || task.status === 'in_transit') && styles.progressLabelCurrent,
                (task.status === 'arrived' || task.status === 'arrived_at_destination' || task.status === 'completed' || task.status === 'delivered') && styles.progressLabelCompleted
              ]}>
                In Transit
              </Text>
              <View style={[
                styles.progressIndicator,
                (task.status === 'in_progress' || task.status === 'picked_up' || task.status === 'in_transit') && styles.progressIndicatorCurrent
              ]} />
            </View>
          )}

          {/* Arrived at Destination */}
          {(task.status === 'arrived' || task.status === 'arrived_at_destination' || task.status === 'completed' || task.status === 'delivered') && (
            <View style={styles.progressStep}>
              <View style={[
                styles.progressIcon,
                (task.status === 'arrived' || task.status === 'arrived_at_destination') && styles.progressIconCurrent,
                (task.status === 'completed' || task.status === 'delivered') && styles.progressIconCompleted
              ]}>
                <Text style={[
                  styles.progressIconText,
                  (task.status === 'arrived' || task.status === 'arrived_at_destination' || task.status === 'completed' || task.status === 'delivered') && styles.progressIconTextCompleted
                ]}>
                  📍
                </Text>
              </View>
              <Text style={[
                styles.progressLabel,
                (task.status === 'arrived' || task.status === 'arrived_at_destination') && styles.progressLabelCurrent,
                (task.status === 'completed' || task.status === 'delivered') && styles.progressLabelCompleted
              ]}>
                Arrived at Destination
              </Text>
              <View style={[
                styles.progressIndicator,
                (task.status === 'arrived' || task.status === 'arrived_at_destination') && styles.progressIndicatorCurrent
              ]} />
            </View>
          )}

          {/* Delivered */}
          {(task.status === 'completed' || task.status === 'delivered') && (
            <View style={styles.progressStep}>
              <View style={[styles.progressIcon, styles.progressIconCompleted]}>
                <Text style={[styles.progressIconText, styles.progressIconTextCompleted]}>✓</Text>
              </View>
              <Text style={[styles.progressLabel, styles.progressLabelCompleted]}>Delivered</Text>
              <View style={[styles.progressIndicator, styles.progressIndicatorCurrent]} />
            </View>
          )}
          </View>
        </View>

        {/* OTP Verification Section - Show after arrived at destination */}
        {(task.status === 'arrived' || task.status === 'arrived_at_destination') && (
          <View style={styles.deliverySection}>
            <View style={styles.deliverySectionHeader}>
              <Text style={styles.deliverySectionIcon}>#</Text>
              <Text style={styles.deliverySectionTitle}>Customer OTP Verification</Text>
            </View>
            
            <View style={styles.otpInstructionContainer}>
              <Text style={styles.otpInstructionText}>
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
                editable={!otpVerified}
              />
              {/* <TouchableOpacity
                style={styles.sendOtpButton}
                onPress={handleSendOTP}
              >
                <Text style={styles.sendOtpButtonText}>Send OTP</Text>
              </TouchableOpacity> */}
            </View>

            {/* <TouchableOpacity
              style={[
                styles.verifyOtpButton,
                otpVerified && styles.verifyOtpButtonVerified
              ]}
              onPress={handleVerifyOTP}
              disabled={otpVerified || otpLoading || otpCode.length !== 6}
            >
              {otpLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.verifyOtpButtonText}>
                  {otpVerified ? '✓ OTP Verified' : 'Verify OTP'}
                </Text>
              )}
            </TouchableOpacity> */}
          </View>
        )}

        {/* Proof of Delivery Section - Show after arrived at destination */}
        {(task.status === 'arrived' || task.status === 'arrived_at_destination') && (
          <View style={styles.deliverySection}>
            <View style={styles.deliverySectionHeader}>
              <Text style={styles.deliverySectionIcon}>📎</Text>
              <Text style={styles.deliverySectionTitle}>Proof of Delivery Documents</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.uploadButton,
                proofUploaded && styles.uploadButtonUploaded
              ]}
              onPress={handleUploadProof}
            >
              <Text style={styles.uploadButtonIcon}>
                {proofUploaded ? '✓' : '📤'}
              </Text>
              <Text style={styles.uploadButtonText}>
                {proofUploaded ? 'Document Uploaded' : 'Upload Document'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.uploadHelpText}>
              Upload delivery receipts, photos, or other proof of delivery documents
            </Text>

            {!otpVerified && (
              <TouchableOpacity
                style={styles.completeDeliveryButtonDisabled}
                disabled={true}
              >
                <Text style={styles.completeDeliveryButtonDisabledText}>
                  Complete Delivery
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Delivery Notes Section */}
        {(task.status === 'arrived' || task.status === 'arrived_at_destination') && (
          <View style={styles.deliverySection}>
            <Text style={styles.deliverySectionTitle}>Delivery Notes</Text>
            <TextInput
              style={styles.deliveryNotesInput}
              multiline
              placeholder="Add any notes about the delivery..."
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        )}

        {/* Notes */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            placeholder="Add any notes or observations..."
            value={notes}
            onChangeText={setNotes}
          />
          <TouchableOpacity style={styles.reportIssueButton} onPress={handleReportIssue}>
            <Text style={styles.reportIssueIcon}>⚠️</Text>
            <Text style={styles.reportIssueText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Button */}
      {(task.status !== 'completed' && task.status !== 'delivered' && task.status !== 'cancelled') && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: getActionButtonColor()}]}
            onPress={handleActionPress}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>{getActionButtonIcon()}</Text>
                <Text style={styles.actionButtonText}>{getActionButtonText()}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  simplifiedDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simplifiedDistance: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  simplifiedDuration: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  scheduledContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduledInfo: {
    flex: 1,
  },
  scheduledLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scheduledTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 20,
  },
  alertIcon: {
    fontSize: 20,
  },
  addressesContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  notesContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  reportIssueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  reportIssueIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  reportIssueText: {
    fontSize: 16,
    color: '#856404',
    fontWeight: '500',
  },
  bottomContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 54,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tripProgressContainer: {
    paddingVertical: 0,
  },
  progressStep: {
    marginBottom: 20,
  },
  progressStepContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginRight: 12,
  },
  progressIconPending: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  progressIconCurrent: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  progressIconCompleted: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  progressIconText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  progressIconTextCompleted: {
    color: 'white',
  },
  progressLabelContainer: {
    flex: 1,
    position: 'relative',
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  progressLabelCurrent: {
    color: '#007AFF',
    fontWeight: '600',
  },
  progressLabelCompleted: {
    color: '#28a745',
    fontWeight: '600',
  },
  currentIndicator: {
    position: 'absolute',
    right: 0,
    top: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  progressConnector: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
  },
  progressConnectorActive: {
    backgroundColor: '#28a745',
  },
  progressIndicator: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
    width: '80%',
  },
  progressIndicatorCurrent: {
    backgroundColor: '#007AFF',
  },
  // Delivery section styles
  deliverySection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliverySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deliverySectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  deliverySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  otpInstructionContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  otpInstructionText: {
    fontSize: 14,
    color: '#1565C0',
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  otpInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
    textAlign: 'center',
    letterSpacing: 2,
  },
  sendOtpButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  sendOtpButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  verifyOtpButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 1,
  },
  verifyOtpButtonVerified: {
    backgroundColor: '#4CAF50',
  },
  verifyOtpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    marginBottom: 12,
  },
  uploadButtonUploaded: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderStyle: 'solid',
  },
  uploadButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  uploadHelpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  completeDeliveryButtonDisabled: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.6,
  },
  completeDeliveryButtonDisabledText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  deliveryNotesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default OrderDetailsScreen;