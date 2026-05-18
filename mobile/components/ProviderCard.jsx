import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ProviderCard({
  provider = {},
  isSelected = false,
  onPress = () => {},
  showScore = true,
}) {
  const {
    name = 'Unnamed Provider',
    trust_score = 0,
    rating = 0.0,
    total_jobs = 0,
    price_range_pkr = 'N/A',
    confirmed_slot = 'N/A',
    confirmed_date = 'N/A',
    service_matched = 'Service Matched',
    area = 'Karachi',
    verified = false,
  } = provider;

  // Determine meter color based on trust score
  const getMeterColor = (score) => {
    if (score >= 80) return COLORS.success || '#059669';
    if (score >= 60) return COLORS.warning || '#D97706';
    return COLORS.error || '#DC2626';
  };

  const meterColor = getMeterColor(trust_score);

  // Construct accessibilityLabel dynamically to provide a seamless voiceover audit for visually impaired users
  const accessibilityLabel = `Provider ${name}. ${
    verified ? 'Verified provider.' : ''
  } ${service_matched} in ${area}. ${rating} star rating from ${total_jobs} jobs. ${
    showScore ? `Trust score is ${trust_score} percent.` : ''
  } Price estimate is ${price_range_pkr}. Scheduled for ${confirmed_date} at ${confirmed_slot}. ${
    isSelected ? 'Currently selected.' : 'Double tap to select.'
  }`;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      {/* Top Section: Name + Verified Shield Badge */}
      <View style={styles.headerRow}>
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{name}</Text>
          {verified && (
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={COLORS.success || '#059669'}
              style={styles.shieldIcon}
              accessibilityLabel="Verified Professional Badge"
            />
          )}
        </View>

        {/* Selected checkmark indicator */}
        {isSelected && (
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Meta Stats Row: Rating | Jobs Done | Location */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.statText}>{rating.toFixed(1)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="build" size={14} color={COLORS.textSecondary || '#6B7280'} />
          <Text style={styles.statText}>{total_jobs} Jobs</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary || '#6B7280'} />
          <Text style={styles.statText} numberOfLines={1}>{area}</Text>
        </View>
      </View>

      {/* Chip/Pill Details (Service Matched + Confirmed Slot) */}
      <View style={styles.chipsRow}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{service_matched}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText} numberOfLines={1}>
            {confirmed_date}, {confirmed_slot}
          </Text>
        </View>
      </View>

      {/* Trust Score Horizontal Bar Meter (Optional) */}
      {showScore && (
        <View style={styles.trustSection}>
          <View style={styles.trustHeader}>
            <Text style={styles.trustLabel}>Trust Score</Text>
            <Text style={[styles.trustValue, { color: meterColor }]}>{trust_score}%</Text>
          </View>
          {/* Outer bar track */}
          <View style={styles.meterTrack}>
            {/* Dynamic width progress indicator bar */}
            <View
              style={[
                styles.meterFill,
                {
                  width: `${Math.min(Math.max(trust_score, 0), 100)}%`,
                  backgroundColor: meterColor,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Pricing section (Always shown in bold green) */}
      <View style={styles.footerRow}>
        <Text style={styles.priceLabel}>Estimate Price</Text>
        <Text style={styles.priceValue}>{price_range_pkr}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderColor: 'transparent',
    borderWidth: 2,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: COLORS.primary || '#4F46E5',
    backgroundColor: '#EEF2FF', // Soft brand-matching light indigo background
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary || '#1E1B4B',
  },
  shieldIcon: {
    marginTop: 1,
  },
  checkmarkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary || '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary || '#6B7280',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary || '#6B7280',
  },
  trustSection: {
    marginBottom: 14,
  },
  trustHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  trustLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary || '#6B7280',
  },
  trustValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  meterTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary || '#6B7280',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.success || '#059669',
  },
});
