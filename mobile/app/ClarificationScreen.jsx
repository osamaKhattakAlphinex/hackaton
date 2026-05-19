import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ClarificationScreen() {
  const router = useRouter();
  const { clarificationPrompt, message } = useLocalSearchParams();
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = () => {
    if (!response.trim()) {
      setError('Baraye meherbani wazahat likhein.');
      return;
    }

    setError(null);
    // Combine original message with the clarification response and go back to search
    const updatedMessage = `${message || ''} (Clarification: ${response})`;
    
    router.push({
      pathname: '/ProcessingScreen',
      params: {
        message: updatedMessage,
        userId: 'user_123',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgContainer}>
        <View style={styles.glowIndigo} />
        <View style={styles.glowCyan} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            {/* Custom Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Need Details</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Prompt Area */}
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color={COLORS.primary} />
              </View>

              <Text style={styles.promptHeading}>Help Us Understand</Text>
              <Text style={styles.promptSub}>
                Ghar ka kam behtar tareeqay se karne ke liye, thori mazeed tafseelat darkaar hain.
              </Text>

              {/* Box displaying system clarification request */}
              <View style={styles.promptCard}>
                <Text style={styles.promptText}>
                  {clarificationPrompt || 'Aapko kis qism ki service chahiye? Wazahat karein.'}
                </Text>
              </View>

              {/* TextInput for response */}
              <TextInput
                style={[styles.textInput, error && styles.textInputError]}
                multiline
                numberOfLines={3}
                placeholder="Apna jawab yahan likhein (e.g. AC cabinet repair karwana hai...)"
                placeholderTextColor={COLORS.textSecondary}
                value={response}
                onChangeText={(text) => {
                  setResponse(text);
                  if (error) setError(null);
                }}
                textAlignVertical="top"
              />

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.submitBtnText}>Submit Details</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  content: {
    alignItems: 'center',
    paddingTop: 32,
    marginBottom: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.borderPrimary,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  promptHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  promptSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  promptCard: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderColor: COLORS.borderPrimary,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  promptText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  textInput: {
    width: '100%',
    minHeight: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.2,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  textInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingLeft: 4,
  },
  footer: {
    paddingBottom: 24,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  submitBtnText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
