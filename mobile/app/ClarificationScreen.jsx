import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
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
    borderBottomColor: '#F3F4F6',
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
    flex: 1,
    alignItems: 'center',
    paddingTop: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
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
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 16,
    borderColor: COLORS.borderPrimary,
    borderWidth: 1,
    marginBottom: 20,
  },
  promptText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  textInput: {
    width: '100%',
    minHeight: 100,
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderWidth: 1,
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
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
