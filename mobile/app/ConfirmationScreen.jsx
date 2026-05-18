import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parsing received parameters with safe robust fallbacks
  const bookingId = params.booking_id || 'BK-IS4X9M2';
  
  let confirmation = null;
  try {
    confirmation = params.confirmation ? JSON.parse(params.confirmation) : null;
  } catch (e) {
    console.error('Failed to parse confirmation', e);
  }

  let followUp = [];
  try {
    followUp = params.follow_up ? JSON.parse(params.follow_up) : [];
  } catch (e) {
    console.error('Failed to parse follow_up', e);
  }

  let stateChange = null;
  try {
    stateChange = params.state_change ? JSON.parse(params.state_change) : null;
  } catch (e) {
    console.error('Failed to parse state_change', e);
  }

  let trace = [];
  try {
    trace = params.trace ? JSON.parse(params.trace) : [];
  } catch (e) {
    console.error('Failed to parse trace', e);
  }

  // Extreme High Fidelity Fallbacks for skeleton/offline usage
  const finalConfirmation = confirmation || {
    user_confirmation_message: 'Shabash! Aapka booking confirm ho chuka hai. Sajid Ali aaj shaam 4:00 PM baje Rs. 2,000 – 4,500 ki cost estimate par AC repair ke liye tashreef layenge.',
    provider_name: 'Sajid Ali',
    datetime: 'Today, 4:00 PM',
    cost: 'Est. Rs. 2,000 – 4,500',
  };

  const finalFollowUp = followUp.length > 0 ? followUp : [
    {
      trigger_label: 'Booking Created',
      message_preview: 'Sajid Ali has accepted the booking request',
      channel: 'notifications-outline',
      time: 'Just now',
    },
    {
      trigger_label: 'ETA Alert',
      message_preview: 'Technician leaves location & starts journey',
      channel: 'phone-portrait-outline',
      time: 'In 3 hours',
    },
    {
      trigger_label: 'Arrival Confirmation',
      message_preview: 'Pin verification upon provider arrival',
      channel: 'logo-whatsapp',
      time: 'Today, 4:00 PM',
    },
  ];

  const finalStateChange = stateChange || {
    old_state: 'searching',
    new_state: 'confirmed_scheduled',
    timestamp: new Date().toISOString(),
  };

  const finalTrace = trace.length > 0 ? trace : [
    { agent: 'Intent Parser', duration: '1.2s', status: 'success' },
    { agent: 'Matcher', duration: '1.4s', status: 'success' },
    { agent: 'Ranking', duration: '1.1s', status: 'success' },
    { agent: 'Final assembly', duration: '0.8s', status: 'success' },
  ];

  // Interactive UI expansion state management
  const [showTrace, setShowTrace] = useState(false);
  const [showStateChange, setShowStateChange] = useState(false);

  // Animated values for drawing checkmark and background flash
  const bgFlashAnim = useRef(new Animated.Value(0)).current;
  const tickLeftScale = useRef(new Animated.Value(0)).current;
  const tickRightScale = useRef(new Animated.Value(0)).current;
  const scaleCard = useRef(new Animated.Value(0.9)).current;
  const fadeContent = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run introductory animation chain
    Animated.sequence([
      // 1. Flash background to light green (#ECFDF5) and back
      Animated.timing(bgFlashAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(bgFlashAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
      // 2. Draw animated checkmark strokes (Left segment then Right segment)
      Animated.parallel([
        Animated.timing(tickLeftScale, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleCard, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(tickRightScale, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      // 3. Fade in all details smoothly
      Animated.timing(fadeContent, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleTrace = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowTrace(!showTrace);
  };

  const toggleStateChange = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowStateChange(!showStateChange);
  };

  // Animate background color dynamically using interpolate
  const interpolatedBg = bgFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.surface, '#ECFDF5'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { backgroundColor: interpolatedBg }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Success Checkmark Header */}
          <View style={styles.successHeader}>
            <View style={styles.checkmarkOuterCircle}>
              {/* Checkmark custom drawing lines */}
              <View style={styles.tickContainer}>
                <Animated.View
                  style={[
                    styles.tickStrokeLeft,
                    { transform: [{ scaleX: tickLeftScale }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.tickStrokeRight,
                    { transform: [{ scaleX: tickRightScale }] },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.mainTitle}>Booking Confirmed! 🎉</Text>
          </View>

          {/* Monographs Pill Booking ID */}
          <Animated.View style={[styles.bookingIdCard, { transform: [{ scale: scaleCard }] }]}>
            <View style={styles.bookingIdPill}>
              <Text style={styles.bookingIdLabel}>ORDER ID</Text>
              <Text style={styles.bookingIdText}>{bookingId}</Text>
            </View>
          </Animated.View>

          {/* Fade in content */}
          <Animated.View style={{ opacity: fadeContent, flex: 1 }}>
            {/* Confirmation Message Card */}
            <View style={styles.confirmationCard}>
              <View style={styles.bulbHeader}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
                <Text style={styles.confirmHeading}>Order Confirmed</Text>
              </View>
              
              <Text style={styles.confirmationMsg}>
                {finalConfirmation.user_confirmation_message}
              </Text>

              {/* Bold Highlights Info Grid */}
              <View style={styles.highlightsGrid}>
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightLabel}>Provider</Text>
                  <Text style={styles.highlightVal}>{finalConfirmation.provider_name}</Text>
                </View>
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightLabel}>Schedule</Text>
                  <Text style={styles.highlightVal}>{finalConfirmation.datetime}</Text>
                </View>
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightLabel}>Total Cost</Text>
                  <Text style={[styles.highlightVal, { color: COLORS.success }]}>
                    {finalConfirmation.cost}
                  </Text>
                </View>
              </View>
            </View>

            {/* Follow-up Timeline */}
            <Text style={styles.sectionTitle}>Follow-Up Timeline</Text>
            <View style={styles.timelineCard}>
              {finalFollowUp.map((node, index) => {
                const isLast = index === finalFollowUp.length - 1;
                return (
                  <View key={index} style={styles.timelineNode}>
                    {/* Left Column Timeline Line */}
                    <View style={styles.timelineLeftColumn}>
                      <View style={styles.timelineDot}>
                        <Ionicons name={node.channel} size={14} color={COLORS.surface} />
                      </View>
                      {!isLast && <View style={styles.timelineVerticalLine} />}
                    </View>

                    {/* Right Column Node Details */}
                    <View style={styles.timelineRightColumn}>
                      <View style={styles.nodeHeader}>
                        <Text style={styles.nodeTrigger}>{node.trigger_label}</Text>
                        <Text style={styles.nodeTime}>{node.time}</Text>
                      </View>
                      <Text style={styles.nodeMessage}>{node.message_preview}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Action Row - Outlined buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.outlinedBtn}
                onPress={() => router.push({
                  pathname: '/TraceScreen',
                  params: {
                    booking_id: bookingId,
                    trace: JSON.stringify(finalTrace)
                  }
                })}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="analytics-outline"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.outlinedBtnText}>
                  View Agent Trace
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.outlinedBtn, showStateChange && styles.outlinedBtnActive]}
                onPress={toggleStateChange}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="git-compare-outline"
                  size={16}
                  color={showStateChange ? COLORS.surface : COLORS.primary}
                />
                <Text style={[styles.outlinedBtnText, showStateChange && styles.outlinedBtnTextActive]}>
                  View State Change
                </Text>
              </TouchableOpacity>
            </View>

            {/* Expandable Trace Table Panel */}
            {showTrace && (
              <View style={styles.expandablePanel}>
                <Text style={styles.panelTitle}>AI Agent Trace Log</Text>
                {finalTrace.map((t, i) => (
                  <View key={i} style={styles.traceRow}>
                    <View style={styles.traceLeft}>
                      <View style={styles.successDot} />
                      <Text style={styles.traceAgent}>{t.agent}</Text>
                    </View>
                    <View style={styles.traceRight}>
                      <Text style={styles.traceDuration}>{t.duration}</Text>
                      <Text style={styles.traceStatus}>{t.status.toUpperCase()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Expandable State Change Panel */}
            {showStateChange && (
              <View style={styles.expandablePanel}>
                <Text style={styles.panelTitle}>System State Transitions</Text>
                <View style={styles.stateTransitionCard}>
                  <View style={styles.stateStep}>
                    <Text style={styles.stateLabel}>Previous State</Text>
                    <Text style={styles.stateVal}>{finalStateChange.old_state.toUpperCase()}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.textSecondary} />
                  <View style={styles.stateStep}>
                    <Text style={styles.stateLabel}>New State</Text>
                    <Text style={[styles.stateVal, { color: COLORS.success }]}>
                      {finalStateChange.new_state.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.stateTimestamp}>
                  Logged at: {new Date(finalStateChange.timestamp).toLocaleString()}
                </Text>
              </View>
            )}

            {/* Outlined Back to Home Full Width Button */}
            <TouchableOpacity
              style={styles.backHomeBtn}
              onPress={() => router.replace('/')}
              activeOpacity={0.8}
            >
              <Text style={styles.backHomeBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmarkOuterCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tickContainer: {
    width: 44,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tickStrokeLeft: {
    position: 'absolute',
    left: 4,
    bottom: 6,
    width: 14,
    height: 4,
    backgroundColor: COLORS.success,
    borderRadius: 2,
    transformOrigin: 'left',
    transform: [{ rotate: '45deg' }],
  },
  tickStrokeRight: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    width: 28,
    height: 4,
    backgroundColor: COLORS.success,
    borderRadius: 2,
    transformOrigin: 'left',
    transform: [{ rotate: '-45deg' }],
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  bookingIdCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bookingIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingIdLabel: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  bookingIdText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  confirmationCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderPrimary,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 28,
  },
  bulbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  confirmHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  confirmationMsg: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  highlightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  highlightItem: {
    flex: 1,
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  highlightVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  timelineCard: {
    backgroundColor: COLORS.surface,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  timelineNode: {
    flexDirection: 'row',
    minHeight: 64,
  },
  timelineLeftColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 28,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineVerticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    zIndex: 1,
  },
  timelineRightColumn: {
    flex: 1,
    paddingBottom: 20,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nodeTrigger: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  nodeTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  nodeMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  outlinedBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  outlinedBtnActive: {
    backgroundColor: COLORS.primary,
  },
  outlinedBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  outlinedBtnTextActive: {
    color: COLORS.surface,
  },
  expandablePanel: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  traceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  traceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  traceAgent: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  traceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  traceDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  traceStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.success,
  },
  stateTransitionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  stateStep: {
    alignItems: 'center',
    flex: 1,
  },
  stateLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  stateVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  stateTimestamp: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  backHomeBtn: {
    height: 56,
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  backHomeBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
