import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Colored agents mapping
const AGENTS = [
  { id: 1, name: 'AG1 - Intent Parser', color: '#4F46E5', desc: 'Parses Roman Urdu / English intent' },
  { id: 2, name: 'AG2 - Matcher', color: '#06B6D4', desc: 'Finds available neighborhood candidates' },
  { id: 3, name: 'AG3 - Ranking', color: '#059669', desc: 'Evaluates trust ratings and matches' },
  { id: 4, name: 'AG4 - Constraint Checker', color: '#D97706', desc: 'Validates schedule conflicts & slots' },
  { id: 5, name: 'AG5 - Proposal Assembler', color: '#8B5CF6', desc: 'Drafts pricing and proposal outlines' },
  { id: 6, name: 'AG6 - Final Validator', color: '#DC2626', desc: 'Applies cryptographic token signature' },
];

export default function TraceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const bookingId = params.booking_id || 'BK-IS4X9M2';

  // State Management for individual accordion collapses
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleAccordion = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedCard === index) {
      setExpandedCard(null);
    } else {
      setExpandedCard(index);
    }
  };

  // Default steps trace mock fallback for high fidelity offline demonstration
  const defaultStepsTrace = [
    {
      id: 1,
      name: 'Intent Parser',
      duration: '1.2s',
      status: 'success',
      tokens: 420,
      input: {
        raw_text: 'Mujhe AC servicing aur cleaning ke liye technician chahiye.',
        userId: 'user_123',
        language_detected: 'roman_urdu',
      },
      output: {
        intent: 'AC Repair',
        category: 'home_appliances',
        confidence: 0.98,
        slots_preferred: ['Today, 4:00 PM'],
      },
    },
    {
      id: 2,
      name: 'Matcher',
      duration: '1.4s',
      status: 'success',
      tokens: 850,
      input: {
        service: 'AC Repair',
        location: 'Gulshan-e-Iqbal, Karachi',
        radius_km: 5.0,
      },
      output: {
        candidates_found: 8,
        matched_candidates: [
          { provider_id: 101, name: 'Sajid Ali', distance_km: 1.2 },
          { provider_id: 102, name: 'Kamran Khan', distance_km: 2.5 },
        ],
      },
    },
    {
      id: 3,
      name: 'Ranking',
      duration: '1.1s',
      status: 'success',
      tokens: 1200,
      input: {
        candidates: [101, 102],
        sorting_metrics: ['trust_score', 'completed_jobs', 'response_speed'],
      },
      output: {
        ranked_list: [
          { provider_id: 101, trust_score: 92, rating: 4.8, ranking_index: 1 },
          { provider_id: 102, trust_score: 78, rating: 4.5, ranking_index: 2 },
        ],
      },
    },
    {
      id: 4,
      name: 'Constraint Checker',
      duration: '0.5s',
      status: 'success',
      tokens: 310,
      input: {
        preferred_slot: 'Today, 4:00 PM',
        provider_id: 101,
        calendar_sync: 'active',
      },
      output: {
        slot_is_available: true,
        calendar_conflicts: 0,
        confirmed_time: 'Today, 4:00 PM',
      },
    },
    {
      id: 5,
      name: 'Proposal Assembler',
      duration: '0.6s',
      status: 'success',
      tokens: 620,
      input: {
        provider_id: 101,
        intent: 'AC Repair',
        base_estimate: 'Rs. 2,000 - 4,500',
      },
      output: {
        proposal_id: 'PROP-89210',
        pricing_transparency: 'guaranteed',
        final_estimate: 'Rs. 2,000 - 4,500',
      },
    },
    {
      id: 6,
      name: 'Final Validator',
      duration: '0.4s',
      status: 'success',
      tokens: 250,
      input: {
        proposal_id: 'PROP-89210',
        validator_role: 'system_signer',
      },
      output: {
        validated: true,
        cryptographic_token: 'sha256-4f9a88e99bc12fd38aa90bc1fc6bf7',
        booking_id: 'BK-IS4X9M2',
      },
    },
  ];

  const [stepsTrace, setStepsTrace] = useState(defaultStepsTrace);
  const [loadingTrace, setLoadingTrace] = useState(true);

  useEffect(() => {
    const fetchTrace = async () => {
      try {
        setLoadingTrace(true);
        const data = await api.getTrace(bookingId);
        if (data && data.agent_trace) {
          const mappedTrace = data.agent_trace.map((t, idx) => {
            const agentConf = AGENTS.find(a => `ag${a.id}` === String(t.agent).toLowerCase()) || AGENTS[idx] || { name: t.agent, color: '#4F46E5', desc: 'Agent execution step' };
            return {
              id: agentConf.id || idx + 1,
              name: agentConf.name || t.agent,
              duration: t.duration_ms ? `${(t.duration_ms / 1000).toFixed(1)}s` : '0.8s',
              status: t.success ? 'success' : 'failed',
              tokens: t.tokens_used || 350,
              input: {
                agent_role: agentConf.desc,
                run_index: idx + 1,
                timestamp: data.created_at || new Date().toISOString()
              },
              output: t.output || {}
            };
          });
          setStepsTrace(mappedTrace);
        }
      } catch (err) {
        console.warn("Failed to fetch real trace from backend. Using high-fidelity mock fallback:", err.message);
      } finally {
        setLoadingTrace(false);
      }
    };

    fetchTrace();
  }, [bookingId]);

  // Pure JavaScript Manual JSON Syntax Highlighter
  const SyntaxHighlightedJson = ({ data }) => {
    const jsonString = JSON.stringify(data, null, 2);
    
    // Custom Tokenizer
    const tokenizeJson = (str) => {
      const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[{}[\]:,]|\s+)/g;
      return str.match(regex) || [str];
    };

    const tokens = tokenizeJson(jsonString);

    const getStyleForToken = (token) => {
      if (token.startsWith('"') && token.endsWith(':')) {
        return styles.jsonKey;
      }
      if (token.startsWith('"')) {
        return styles.jsonString;
      }
      if (/^(true|false|null)$/.test(token)) {
        return styles.jsonBoolean;
      }
      if (/^-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?$/.test(token)) {
        return styles.jsonNumber;
      }
      return styles.jsonStandard;
    };

    return (
      <Text style={styles.jsonBlock}>
        {tokens.map((token, i) => (
          <Text key={i} style={getStyleForToken(token)}>
            {token}
          </Text>
        ))}
      </Text>
    );
  };

  const totalDuration = stepsTrace.reduce((acc, step) => {
    const val = parseFloat(step.duration);
    return acc + (isNaN(val) ? 0 : val);
  }, 0).toFixed(1);

  const totalTokens = stepsTrace.reduce((acc, step) => {
    return acc + (step.tokens || 0);
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgContainer}>
        <View style={styles.glowIndigo} />
        <View style={styles.glowCyan} />
      </View>
      {/* Header section (Dark #1E1B4B) */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agent Trace Log</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.headerDetails}>
          <Text style={styles.headerSub}>Booking ID: {bookingId}</Text>
          <View style={styles.durationBadge}>
            <Text style={styles.durationBadgeText}>Completed in {totalDuration}s</Text>
          </View>
        </View>
      </View>

      {/* Accordion Steps list */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.accordionContainer}>
          {stepsTrace.map((step, index) => {
            const isExpanded = expandedCard === index;
            const agentConf = AGENTS[index];
            return (
              <View key={step.id} style={styles.card}>
                {/* Header card toggle */}
                <TouchableOpacity
                  style={[styles.cardHeader, isExpanded && styles.cardHeaderExpanded]}
                  onPress={() => toggleAccordion(index)}
                  activeOpacity={0.8}
                >
                  {/* Left Circle Number Badge */}
                  <View style={[styles.agentCircle, { backgroundColor: agentConf.color }]}>
                    <Text style={styles.agentCircleText}>AG{step.id}</Text>
                  </View>

                  {/* Agent Details */}
                  <View style={styles.agentMeta}>
                    <Text style={styles.agentName}>{step.name}</Text>
                    <Text style={styles.agentDesc} numberOfLines={1}>{agentConf.desc}</Text>
                  </View>

                  {/* Duration + Status */}
                  <View style={styles.agentStatus}>
                    <Text style={styles.agentDuration}>{step.duration}</Text>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.success} style={styles.statusIcon} />
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#94A3B8"
                    />
                  </View>
                </TouchableOpacity>

                {/* Expanded accordion body */}
                {isExpanded && (
                  <View style={styles.cardBody}>
                    {/* Tokens Badge */}
                    <View style={styles.tokensCardRow}>
                      <Ionicons name="hardware-chip-outline" size={16} color="#94A3B8" />
                      <Text style={styles.tokensText}>Tokens Utilized: {step.tokens} tokens</Text>
                    </View>

                    {/* JSON Inputs */}
                    <Text style={styles.jsonLabel}>INPUT JSON</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.jsonScroll}>
                      <SyntaxHighlightedJson data={step.input} />
                    </ScrollView>

                    {/* JSON Outputs */}
                    <Text style={styles.jsonLabel}>OUTPUT JSON</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.jsonScroll}>
                      <SyntaxHighlightedJson data={step.output} />
                    </ScrollView>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Summary Card Table */}
        <Text style={styles.summaryTitle}>Audit Summary Table</Text>
        <View style={styles.summaryCard}>
          <View style={styles.table}>
            {/* Header row */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableCol, styles.tableHeaderCell, { flex: 2, textAlign: 'left' }]}>Agent</Text>
              <Text style={[styles.tableCol, styles.tableHeaderCell]}>Duration</Text>
              <Text style={[styles.tableCol, styles.tableHeaderCell]}>Tokens</Text>
              <Text style={[styles.tableCol, styles.tableHeaderCell, { textAlign: 'right' }]}>Status</Text>
            </View>

            {/* Rows list */}
            {stepsTrace.map((step) => (
              <View key={step.id} style={styles.tableRow}>
                <Text style={[styles.tableCol, styles.tableCell, { flex: 2, textAlign: 'left', fontWeight: '600' }]} numberOfLines={1}>
                  AG{step.id} - {step.name}
                </Text>
                <Text style={[styles.tableCol, styles.tableCell]}>{step.duration}</Text>
                <Text style={[styles.tableCol, styles.tableCell]}>{step.tokens}</Text>
                <Text style={[styles.tableCol, styles.tableCell, { color: COLORS.success, fontWeight: '700', textAlign: 'right' }]}>
                  OK
                </Text>
              </View>
            ))}

            <View style={styles.tableTotalRow}>
              <Text style={[styles.tableCol, styles.tableTotalCell, { flex: 2, textAlign: 'left' }]}>TOTAL PIPELINE</Text>
              <Text style={[styles.tableCol, styles.tableTotalCell]}>{totalDuration}s</Text>
              <Text style={[styles.tableCol, styles.tableTotalCell]}>{totalTokens.toLocaleString()}</Text>
              <Text style={[styles.tableCol, styles.tableTotalCell, { textAlign: 'right' }]}>SUCCESS</Text>
            </View>
          </View>
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
  header: {
    backgroundColor: 'rgba(30, 27, 75, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 20,
    paddingTop: 12,
  },
  headerTop: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  headerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  headerSub: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  durationBadge: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.borderPrimary,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  durationBadgeText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  accordionContainer: {
    gap: 12,
    marginBottom: 28,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderColor: COLORS.glassBorder,
    borderWidth: 1.2,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  cardHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  agentCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentCircleText: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 12,
  },
  agentMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  agentName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  agentDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  agentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  agentDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusIcon: {
    marginRight: 2,
  },
  cardBody: {
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
    padding: 16,
  },
  tokensCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tokensText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  jsonLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  jsonScroll: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  jsonBlock: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
  },
  jsonKey: {
    color: '#93C5FD',
  },
  jsonString: {
    color: '#86EFAC',
  },
  jsonBoolean: {
    color: '#F9A8D4',
  },
  jsonNumber: {
    color: '#FCD34D',
  },
  jsonStandard: {
    color: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    borderColor: COLORS.glassBorder,
    borderWidth: 1.2,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  table: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableTotalRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  tableCol: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  tableHeaderCell: {
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tableCell: {
    color: COLORS.textPrimary,
  },
  tableTotalCell: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 12,
  },
});
