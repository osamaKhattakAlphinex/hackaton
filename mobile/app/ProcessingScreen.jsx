import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Import the real API service
import * as api from '../services/api';


export default function ProcessingScreen() {
  const router = useRouter();
  const { message, userId } = useLocalSearchParams();

  // Step state tracking
  // States: 'pending' | 'active' | 'done'
  const [stepStates, setStepStates] = useState(['pending', 'pending', 'pending', 'pending']);
  const [stepDurations, setStepDurations] = useState(['', '', '', '']);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorData, setErrorData] = useState(null);
  const [successFlash, setSuccessFlash] = useState(false);

  // Animated values
  const logoPulse = useRef(new Animated.Value(1)).current;
  const logoGlow = useRef(new Animated.Value(0.3)).current;
  
  // Step entrance animations
  const stepFadeAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  const stepSlideAnims = useRef([
    new Animated.Value(20),
    new Animated.Value(20),
    new Animated.Value(20),
    new Animated.Value(20),
  ]).current;

  // Active step icon pulse
  const activeIconPulse = useRef(new Animated.Value(0.4)).current;
  const successFlashAnim = useRef(new Animated.Value(0)).current;

  // Logo wordmark pulsing loop
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(logoPulse, {
            toValue: 1.08,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(logoPulse, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(logoGlow, {
            toValue: 0.8,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(logoGlow, {
            toValue: 0.3,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  // Icon pulsing loop for active steps
  useEffect(() => {
    let pulseLoop;
    if (loading) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(activeIconPulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(activeIconPulse, {
            toValue: 0.4,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
    }
    return () => {
      if (pulseLoop) pulseLoop.stop();
    };
  }, [loading, currentStep]);

  // Handle Mount and simulated flow trigger
  useEffect(() => {
    startSearchFlow();
  }, [message]);

  const startSearchFlow = async () => {
    setLoading(true);
    setErrorData(null);
    setSuccessFlash(false);
    setCurrentStep(0);
    setStepStates(['active', 'pending', 'pending', 'pending']);
    setStepDurations(['', '', '', '']);

    // Animate first step entrance
    animateStepEntrance(0);

    // Call API and run simultaneous visual step progression
    const apiPromise = api.sendServiceRequest(message, userId || 'user_123');

    // Interval to advance step indicator visually
    // Step 1: 0s -> 1.2s
    // Step 2: 1.2s -> 2.6s
    // Step 3: 2.6s -> 3.7s
    // Step 4: 3.7s -> 4.5s
    const stepIntervals = [
      { next: 1, duration: 1200, label: '1.2s' },
      { next: 2, duration: 1400, label: '1.4s' },
      { next: 3, duration: 1100, label: '1.1s' },
      { next: 4, duration: 800, label: '0.8s' },
    ];

    let currentVisualStep = 0;

    const runVisualProgression = (index) => {
      if (index >= stepIntervals.length) return;
      
      setTimeout(() => {
        setStepStates((prev) => {
          const updated = [...prev];
          updated[index] = 'done';
          if (index + 1 < updated.length) {
            updated[index + 1] = 'active';
          }
          return updated;
        });
        
        setStepDurations((prev) => {
          const updated = [...prev];
          updated[index] = stepIntervals[index].label;
          return updated;
        });

        if (index + 1 < stepIntervals.length) {
          setCurrentStep(index + 1);
          animateStepEntrance(index + 1);
          runVisualProgression(index + 1);
        }
      }, stepIntervals[index].duration);
    };

    runVisualProgression(0);

    try {
      const response = await apiPromise;

      if (response.type === 'error') {
        setErrorData(response.message);
        setLoading(false);
        setStepStates(['pending', 'pending', 'pending', 'pending']);
      } else {
        // Complete remaining steps if any lagging
        setStepStates(['done', 'done', 'done', 'done']);
        setStepDurations(['1.2s', '1.4s', '1.1s', '0.8s']);
        setCurrentStep(3);

        // Flash Success
        setSuccessFlash(true);
        Animated.sequence([
          Animated.timing(successFlashAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(successFlashAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Route redirection depending on API outcome
          if (response.type === 'needs_clarification') {
            router.push({
              pathname: '/ClarificationScreen',
              params: {
                clarificationPrompt: response.clarificationPrompt || response.clarification || response.clarification_prompt || 'Aapko kis qism ki service chahiye? Wazahat karein.',
                message: message,
              },
            });
          } else {
            router.push({
              pathname: '/ResultsScreen',
              params: {
                intent: response.intent,
                matched_providers: JSON.stringify(response.matched_providers),
                decision: JSON.stringify(response.decision),
              },
            });
          }
        });
      }
    } catch (err) {
      setErrorData(err.message || 'Kuch ghalat ho gaya. Dobara koshish karein.');
      setLoading(false);
    }
  };

  const animateStepEntrance = (index) => {
    Animated.parallel([
      Animated.timing(stepFadeAnims[index], {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(stepSlideAnims[index], {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Flash layer */}
      {successFlash && (
        <Animated.View style={[styles.flashOverlay, { opacity: successFlashAnim }]} />
      )}

      <View style={styles.bgContainer}>
        <View style={styles.glowIndigo} />
        <View style={styles.glowCyan} />
      </View>

      {/* Header section with back button disabled on load */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, loading && styles.backBtnDisabled]}
          onPress={() => !loading && router.back()}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={loading ? '#475569' : '#FFFFFF'}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HireFast PK AI</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pulsing Wordmark Logo Section */}
      <View style={styles.logoContainer}>
        <Animated.View
          style={[
            styles.logoGlowCircle,
            {
              transform: [{ scale: logoPulse }],
              opacity: logoGlow,
            },
          ]}
        />
        <Animated.Text style={[styles.logoText, { transform: [{ scale: logoPulse }] }]}>
          HireFast PK
        </Animated.Text>
      </View>

      {/* Heading Text */}
      <View style={styles.textHeadingSection}>
        <Text style={styles.statusTitle}>
          {loading ? 'AI is working...' : 'Processing Complete'}
        </Text>
        <Text style={styles.statusSub}>
          {loading
            ? 'Your request is being processed'
            : 'Matching providers found'}
        </Text>
      </View>

      {/* Steps List */}
      <View style={styles.stepsContainer}>
        {/* Step 1 */}
        <Animated.View
          style={[
            styles.stepCard,
            { opacity: stepFadeAnims[0], transform: [{ translateY: stepSlideAnims[0] }] },
          ]}
        >
          <View style={styles.stepIconLeft}>
            {stepStates[0] === 'done' ? (
              <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
            ) : stepStates[0] === 'active' ? (
              <Animated.View style={[styles.stepIconActive, { opacity: activeIconPulse }]} />
            ) : (
              <View style={styles.stepIconPending} />
            )}
          </View>
          <View style={styles.stepCenter}>
            <Text style={styles.stepTitle}>Understanding request</Text>
            <Text style={styles.stepDetail}>Agent 1 - Intent Parser</Text>
          </View>
          <View style={styles.stepRight}>
            {stepStates[0] === 'done' && (
              <Text style={styles.durationBadge}>{stepDurations[0]}</Text>
            )}
          </View>
        </Animated.View>

        {/* Step 2 */}
        <Animated.View
          style={[
            styles.stepCard,
            { opacity: stepFadeAnims[1], transform: [{ translateY: stepSlideAnims[1] }] },
          ]}
        >
          <View style={styles.stepIconLeft}>
            {stepStates[1] === 'done' ? (
              <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
            ) : stepStates[1] === 'active' ? (
              <Animated.View style={[styles.stepIconActive, { opacity: activeIconPulse }]} />
            ) : (
              <View style={styles.stepIconPending} />
            )}
          </View>
          <View style={styles.stepCenter}>
            <Text style={styles.stepTitle}>Searching database</Text>
            <Text style={styles.stepDetail}>Agent 2 - Matcher</Text>
          </View>
          <View style={styles.stepRight}>
            {stepStates[1] === 'done' && (
              <Text style={styles.durationBadge}>{stepDurations[1]}</Text>
            )}
          </View>
        </Animated.View>

        {/* Step 3 */}
        <Animated.View
          style={[
            styles.stepCard,
            { opacity: stepFadeAnims[2], transform: [{ translateY: stepSlideAnims[2] }] },
          ]}
        >
          <View style={styles.stepIconLeft}>
            {stepStates[2] === 'done' ? (
              <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
            ) : stepStates[2] === 'active' ? (
              <Animated.View style={[styles.stepIconActive, { opacity: activeIconPulse }]} />
            ) : (
              <View style={styles.stepIconPending} />
            )}
          </View>
          <View style={styles.stepCenter}>
            <Text style={styles.stepTitle}>Scoring & ranking matches</Text>
            <Text style={styles.stepDetail}>Agent 3 - Ranking</Text>
          </View>
          <View style={styles.stepRight}>
            {stepStates[2] === 'done' && (
              <Text style={styles.durationBadge}>{stepDurations[2]}</Text>
            )}
          </View>
        </Animated.View>

        {/* Step 4 */}
        <Animated.View
          style={[
            styles.stepCard,
            { opacity: stepFadeAnims[3], transform: [{ translateY: stepSlideAnims[3] }] },
          ]}
        >
          <View style={styles.stepIconLeft}>
            {stepStates[3] === 'done' ? (
              <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
            ) : stepStates[3] === 'active' ? (
              <Animated.View style={[styles.stepIconActive, { opacity: activeIconPulse }]} />
            ) : (
              <View style={styles.stepIconPending} />
            )}
          </View>
          <View style={styles.stepCenter}>
            <Text style={styles.stepTitle}>Preparing recommendation</Text>
            <Text style={styles.stepDetail}>Final assembly</Text>
          </View>
          <View style={styles.stepRight}>
            {stepStates[3] === 'done' && (
              <Text style={styles.durationBadge}>{stepDurations[3]}</Text>
            )}
          </View>
        </Animated.View>
      </View>

      {/* Error and Retry layout */}
      {errorData && (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={32} color={COLORS.error} />
          <Text style={styles.errorText}>{errorData}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={startSearchFlow}>
            <Text style={styles.retryBtnText}>Retry Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cancel Request bottom button */}
      <View style={styles.cancelContainer}>
        {loading && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Cancel Request</Text>
          </TouchableOpacity>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBackground,
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.darkBackground,
    zIndex: -1,
    overflow: 'hidden',
  },
  glowIndigo: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(99, 102, 241, 0.14)',
  },
  glowCyan: {
    position: 'absolute',
    bottom: 100,
    right: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 99,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnDisabled: {
    opacity: 0.3,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  placeholder: {
    width: 44,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    height: 100,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.accent,
    zIndex: 2,
    textShadowColor: 'rgba(34, 211, 238, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  logoGlowCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    zIndex: 1,
  },
  textHeadingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statusSub: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  stepsContainer: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderColor: COLORS.glassBorder,
    borderWidth: 1.2,
    borderRadius: 20,
    padding: 16,
  },
  stepIconLeft: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepIconPending: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  stepIconActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  stepCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  stepDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  stepRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  durationBadge: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.borderPrimary,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  errorCard: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1.2,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: COLORS.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  retryBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  cancelContainer: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '600',
  },
});
