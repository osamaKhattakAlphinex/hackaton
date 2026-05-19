import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../constants/theme';

// Quick route to processing pipeline screen

const LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'roman_urdu', label: 'Roman Urdu' },
  { id: 'urdu', label: 'اردو' },
];

const QUICK_SERVICES = [
  { id: 'ac', label: 'AC Service 🌡️', template: 'Mujhe AC servicing aur cleaning ke liye technician chahiye.' },
  { id: 'plumber', label: 'Plumber 🔧', template: 'Bathroom ka pipe leak ho raha hai, plumber ki zaroorat hai.' },
  { id: 'electrician', label: 'Electrician ⚡', template: 'Ghar ke main switch board me short circuit ka masla hai.' },
  { id: 'cleaner', label: 'Cleaner 🧹', template: 'Ghar ki mukammal safai (deep cleaning) ke liye cleaner chahiye.' },
  { id: 'painter', label: 'Painter 🎨', template: 'Ghar ke aik kamray ko paint karwana hai, quotes chahiye.' },
  { id: 'more', label: 'More... →', template: '' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [activeLang, setActiveLang] = useState('english');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const textInputRef = useRef(null);

  const handleLangChange = (langId) => {
    setActiveLang(langId);
  };

  const handleQuickServicePress = (service) => {
    if (service.id === 'more') {
      setMessage('Mujhe home service chahiye...');
    } else {
      setMessage(service.template);
    }
    setErrorMsg(null);
  };

  const handleMicPress = () => {
    // Premium feedback: toggle template for mic mock
    setMessage('Bolo... "AC clean karwana hai"');
    setErrorMsg(null);
  };

  const handleSend = () => {
    if (!message.trim()) {
      setErrorMsg('Aapne koi service request nahi likhi hai.');
      return;
    }

    setErrorMsg(null);
    router.push({
      pathname: '/ProcessingScreen',
      params: {
        message: message,
        userId: 'user_123',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <View style={styles.bgContainer}>
        <View style={styles.glowIndigo} />
        <View style={styles.glowCyan} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Custom Header */}
            <View style={styles.header}>
              <Text style={styles.logoText}>HireFast PK</Text>
              <TouchableOpacity
                style={styles.historyBtn}
                activeOpacity={0.7}
                accessibilityLabel="View History"
              >
                <Ionicons name="time-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Hero Section */}
            <View style={styles.hero}>
              <Text style={styles.greeting}>Assalam o Alaikum 👋</Text>
              <Text style={styles.subtext}>Kaunsi service chahiye aaj?</Text>
            </View>

            {/* Language Badges Row */}
            <View style={styles.langRow}>
              {LANGUAGES.map((lang) => {
                const isActive = activeLang === lang.id;
                return (
                  <TouchableOpacity
                    key={lang.id}
                    style={[
                      styles.langBadge,
                      isActive ? styles.langBadgeActive : styles.langBadgeInactive,
                    ]}
                    onPress={() => handleLangChange(lang.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.langText,
                        isActive ? styles.langTextActive : styles.langTextInactive,
                        lang.id === 'urdu' && styles.urduFont,
                      ]}
                    >
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Main Request Input Card */}
            <View style={[styles.inputCard, isFocused && styles.inputCardFocused]}>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                multiline
                numberOfLines={4}
                maxLength={300}
                placeholder="Type your request in any language..."
                placeholderTextColor={COLORS.textSecondary}
                value={message}
                onChangeText={(val) => {
                  setMessage(val);
                  if (errorMsg) setErrorMsg(null);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                textAlignVertical="top"
              />

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.micButton}
                  onPress={handleMicPress}
                  activeOpacity={0.7}
                >
                  <Ionicons name="mic" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.charCount}>{message.length}/300</Text>
              </View>
            </View>

            {/* Error Banner */}
            {errorMsg && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Quick Services Grid */}
            <Text style={styles.gridHeading}>Popular Services</Text>
            <View style={styles.gridContainer}>
              {QUICK_SERVICES.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.gridItem}
                  onPress={() => handleQuickServicePress(service)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.gridText}>{service.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Send Button */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.sendButtonTextLoading}>Finding the best...</Text>
                  </View>
                ) : (
                  <Text style={styles.sendButtonText}>Search Providers</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
    top: -120,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(99, 102, 241, 0.16)',
  },
  glowCyan: {
    position: 'absolute',
    bottom: 60,
    right: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  historyBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  langRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 8,
  },
  langBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: SIZES.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  langBadgeInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
  },
  langTextActive: {
    color: COLORS.textPrimary,
  },
  langTextInactive: {
    color: COLORS.textSecondary,
  },
  urduFont: {
    fontSize: 15,
  },
  inputCard: {
    marginHorizontal: 24,
    backgroundColor: COLORS.cardBackground,
    borderColor: COLORS.glassBorder,
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 14,
    minHeight: 140,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  inputCardFocused: {
    borderColor: 'rgba(99, 102, 241, 0.6)',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  gridHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  gridItem: {
    width: '48%',
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1.2,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: 24,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  sendButtonDisabled: {
    opacity: 0.8,
  },
  sendButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sendButtonTextLoading: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
