const prompts = require('./prompts');
const { callClaude } = require('./callClaude');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Followup = require('../models/Followup');

// --- Helper: Programmatic Trust Score calculation ---
const calculateTrustScore = (rating, totalJobs, cancellationRate, avgResponseTime) => {
  const ratingTerm = (rating / 5) * 40;
  const jobsTerm = Math.min(totalJobs / 200, 1) * 30;
  const cancelTerm = (1 - cancellationRate) * 20;
  const responseTerm = (1 - (avgResponseTime / 60)) * 10;
  return parseFloat((ratingTerm + jobsTerm + cancelTerm + responseTerm).toFixed(1));
};

const handleServiceRequest = async (message, userId = 'user_123') => {
  // Step 1: Initialize trace array and datetime variables
  const trace = [];
  const now = new Date();
  const datetime = now.toISOString().slice(0, 16).replace("T", " ");
  const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  try {
    // Step 2: Load and run Agent 1
    // Load ag1 system prompt from file: prompts.ag1
    // Inject: user_message, current_datetime, day_of_week
    const ag1Input = {
      user_message: message,
      current_datetime: datetime,
      day_of_week: dayOfWeek,
      raw_text: message,
      userId: userId
    };

    const ag1Result = await callClaude(
      prompts.ag1,
      JSON.stringify(ag1Input),
      'ag1'
    );

    trace.push(ag1Result);

    if (!ag1Result || !ag1Result.success) {
      return { type: "error", message: "Intent parsing failed", trace };
    }

    const intent = ag1Result.output;
    if (!intent) {
      return { type: "error", message: "Intent parsing failed: empty response", trace };
    }

    // Step 3: Route based on confidence
    // If intent.confidence === "low": run Agent 6, return { type: "needs_clarification", ... }
    if (intent.confidence === "low" || (typeof intent.confidence === 'number' && intent.confidence < 0.5)) {
      const ag6Input = {
        user_message: message,
        raw_text: message,
        userId: userId
      };

      const ag6Result = await callClaude(
        prompts.ag6,
        JSON.stringify(ag6Input),
        'ag6'
      );

      trace.push(ag6Result);

      const clarificationPrompt = ag6Result.output && ag6Result.output.clarification_prompt
        ? ag6Result.output.clarification_prompt
        : "Aapko kis qism ki service chahiye? Baraye meherbani wazahat karein.";

      return {
        type: "needs_clarification",
        clarification: clarificationPrompt,
        clarification_prompt: clarificationPrompt,
        trace
      };
    }

    // Step 4: Run Agent 2
    // Fetch all active providers from MongoDB: Provider.find({ active: true }).lean()
    const activeProviders = await Provider.find({ active: true }).lean();

    // Extract dynamic metadata from the user request
    const service_type = intent.intent || "AC Repair";
    
    // Smart location extraction
    let location = "Karachi";
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("islamabad")) {
      location = "Islamabad";
    } else if (lowerMsg.includes("lahore")) {
      location = "Lahore";
    } else if (lowerMsg.includes("rawalpindi")) {
      location = "Rawalpindi";
    } else if (lowerMsg.includes("clifton")) {
      location = "Clifton, Karachi";
    } else if (lowerMsg.includes("gulshan")) {
      location = "Gulshan-e-Iqbal, Karachi";
    } else if (lowerMsg.includes("dha")) {
      location = "DHA, Karachi";
    }

    // Smart time_normalized extraction
    let time_normalized = "Today, 4:00 PM";
    if (lowerMsg.includes("urgent") || lowerMsg.includes("jaldi") || lowerMsg.includes("abhe") || lowerMsg.includes("now") || lowerMsg.includes("emergency")) {
      time_normalized = "Immediate";
    }

    // Smart urgency extraction
    let urgency = "medium";
    if (lowerMsg.includes("urgent") || lowerMsg.includes("jaldi") || lowerMsg.includes("abhe") || lowerMsg.includes("emergency") || lowerMsg.includes("fori")) {
      urgency = "high";
    }

    // Inject: service_type, location, time_normalized, day_of_week, urgency, providers_json
    const ag2Input = {
      service_type,
      location,
      time_normalized,
      day_of_week: dayOfWeek,
      urgency,
      providers_json: JSON.stringify(activeProviders),
      // Also match the prompt structure if needed
      service: service_type,
      radius_km: 5.0
    };

    const ag2Result = await callClaude(
      prompts.ag2,
      JSON.stringify(ag2Input),
      'ag2'
    );

    trace.push(ag2Result);

    const matchedCandidates = ag2Result.output && ag2Result.output.matched_candidates
      ? ag2Result.output.matched_candidates
      : [];

    if (!ag2Result.success || matchedCandidates.length === 0) {
      return { type: "no_providers_found", trace };
    }

    // Step 5: Run Agent 3
    // Inject: matched_providers_json, time_normalized, location, urgency
    const ag3Input = {
      matched_providers_json: JSON.stringify(matchedCandidates),
      time_normalized,
      location,
      urgency,
      // And standard ag3 format
      candidates: matchedCandidates.map(c => c.provider_id || c.id),
      sorting_metrics: ["trust_score", "completed_jobs", "response_speed"]
    };

    const ag3Result = await callClaude(
      prompts.ag3,
      JSON.stringify(ag3Input),
      'ag3'
    );

    trace.push(ag3Result);

    const rankedList = ag3Result.output && ag3Result.output.ranked_list
      ? ag3Result.output.ranked_list
      : matchedCandidates.map((c, idx) => ({
          provider_id: c.provider_id || c.id,
          name: c.name,
          trust_score: 90 - idx * 5,
          ranking_index: idx + 1
        }));

    const matchedProviderIds = matchedCandidates.map(c => String(c.provider_id || c.id || c));
    const matchedDbProviders = activeProviders.filter(p => matchedProviderIds.includes(String(p._id)));

    const matched_providers = matchedDbProviders.map(p => {
      const scoring = rankedList.find(r => String(r.provider_id) === String(p._id)) || {};
      const computedScore = calculateTrustScore(p.rating, p.total_jobs_completed, p.cancellation_rate, p.avg_response_time_minutes);
      return {
        id: p._id,
        name: p.name,
        trust_score: computedScore,
        rating: p.rating,
        jobs: p.total_jobs_completed,
        response_time: `${p.avg_response_time_minutes} mins`,
        service: p.service_types[0] || service_type,
        location: p.base_location.area || p.city,
        datetime: time_normalized,
        cost: p.price_range_pkr ? `Est. Rs. ${p.price_range_pkr.min} – ${p.price_range_pkr.max}` : 'Est. Rs. 2,000 – 4,500',
        trust_pts: scoring.trust_pts || 85,
        slot_pts: scoring.slot_pts || 90,
        price_pts: scoring.price_pts || 85,
        total_pts: scoring.total_pts || 260,
        why_not_selected: scoring.why_not_selected || p.why_not_selected,
      };
    });

    const topRanked = rankedList.sort((a, b) => (a.ranking_index || 99) - (b.ranking_index || 99))[0];
    const topProviderId = topRanked ? String(topRanked.provider_id) : null;
    const bestCandidate = matched_providers.find(p => String(p.id) === topProviderId) || matched_providers[0];

    const decision = {
      provider_id: bestCandidate ? bestCandidate.id : 'PRV001',
      decision_explanation: bestCandidate
        ? `${bestCandidate.name} ko unke behtareen ${bestCandidate.trust_score}% Trust Score aur behtareen response time ki wajah se select kiya gaya hai.`
        : 'Sajid Ali ko select kiya gaya hai.',
    };

    // Return the required structure
    return {
      type: "awaiting_confirmation",
      intent: service_type,
      matched_providers,
      decision,
      trace
    };

  } catch (err) {
    console.error('Pipeline Execution failure:', err);
    throw err;
  }
};

const executeBooking = async (decision, intent, userId = 'user_123') => {
  const trace = [];
  try {
    const provider = await Provider.findById(decision.provider_id);
    if (!provider) {
      throw new Error(`Provider ${decision.provider_id} not found in system databases`);
    }

    const bookingId = `BK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const priceEst = provider.price_range_pkr ? provider.price_range_pkr.min : 2000;
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    
    const slotsForDay = provider.available_slots && provider.available_slots[dayOfWeek] ? provider.available_slots[dayOfWeek] : [];
    const slotToPull = slotsForDay.includes('4:00 PM') ? '4:00 PM' : (slotsForDay[0] || '4:00 PM');
    const confirmedTime = slotToPull || 'Today, 4:00 PM';

    // Step 1: Run Agent 4
    // Inject all booking fields
    const ag4Input = {
      booking_id: bookingId,
      user_id: userId,
      provider_id: provider._id,
      provider_name: provider.name,
      service: intent || provider.service_types[0] || 'AC Repair',
      location: `${provider.base_location.area}, ${provider.city}`,
      scheduled_datetime: confirmedTime,
      estimated_duration_hours: 2,
      estimated_price_pkr: priceEst,
      payment_method: 'cash_on_delivery',
      status: 'confirmed',
      preferred_slot: confirmedTime,
      calendar_sync: "active"
    };

    const ag4Result = await callClaude(prompts.ag4, JSON.stringify(ag4Input), 'ag4');
    trace.push(ag4Result);

    const actualConfirmedTime = ag4Result.output && ag4Result.output.confirmed_time
      ? ag4Result.output.confirmed_time
      : confirmedTime;

    // Save booking to MongoDB (Booking.create)
    const newBooking = await Booking.create({
      booking_id: bookingId,
      user_id: userId,
      provider_id: provider._id,
      provider_name: provider.name,
      service: intent || provider.service_types[0] || 'AC Repair',
      location: `${provider.base_location.area}, ${provider.city}`,
      scheduled_datetime: actualConfirmedTime,
      estimated_duration_hours: 2,
      estimated_price_pkr: priceEst,
      payment_method: 'cash_on_delivery',
      status: 'confirmed',
      confirmation_messages: {
        english: `Awesome! Your booking with ${provider.name} is confirmed for ${actualConfirmedTime}. Estimated cost is Rs. ${priceEst}.`,
        roman_urdu: `Shabash! Aapki booking ${provider.name} ke sath confirmed ho chuki hai. Estimated cost Rs. ${priceEst} hai.`
      },
      system_state_change: {
        before: 'searching_provider',
        after: 'provider_confirmed_scheduled'
      },
      simulated_actions: [
        'SMS Notification Sent to Provider & Customer',
        'WhatsApp Notification Confirmed via Twilio Sandbox',
        'Technician Scheduled in Active Dispatch Roster'
      ],
      agent_trace: trace
    });

    // Remove booked slot from provider (Provider.updateOne with $pull)
    const pullUpdate = {};
    pullUpdate[`available_slots.${dayOfWeek}`] = slotToPull;
    await Provider.updateOne({ _id: provider._id }, { $pull: pullUpdate });

    // Step 2: Run Agent 5
    // Check if first booking
    const count = await Booking.countDocuments({ user_id: userId });
    const is_first_booking = count <= 1;

    // Inject: booking_json, scheduled_datetime, language_detected, is_first_booking
    const ag5Input = {
      booking_json: JSON.stringify(newBooking),
      scheduled_datetime: actualConfirmedTime,
      language_detected: 'roman_urdu',
      is_first_booking
    };

    const ag5Result = await callClaude(prompts.ag5, JSON.stringify(ag5Input), 'ag5');
    trace.push(ag5Result);

    // Save the finalized trace to the booking document
    await Booking.updateOne({ booking_id: bookingId }, { $set: { agent_trace: trace } });

    // Determine follow-ups
    let followUps = [];
    if (ag5Result.output && ag5Result.output.follow_ups) {
      followUps = ag5Result.output.follow_ups.map(f => ({
        booking_id: bookingId,
        user_id: userId,
        ...f
      }));
    } else {
      followUps = [
        {
          booking_id: bookingId,
          user_id: userId,
          step: 1,
          trigger_label: 'Booking Confirmed',
          trigger_datetime: 'Just now',
          type: 'status_update',
          channel: 'notifications-outline',
          message: `${provider.name} has accepted the booking request and started preparation.`
        },
        {
          booking_id: bookingId,
          user_id: userId,
          step: 2,
          trigger_label: 'Technician Leaves Location',
          trigger_datetime: 'In 3 hours',
          type: 'dispatch_alert',
          channel: 'phone-portrait-outline',
          message: `Technician leaves base coordinates & starts travel to ${provider.city}.`
        },
        {
          booking_id: bookingId,
          user_id: userId,
          step: 3,
          trigger_label: 'Arrival Verification PIN',
          trigger_datetime: actualConfirmedTime,
          type: 'final_verification',
          channel: 'logo-whatsapp',
          message: 'Provide arrival PIN to verification agent upon provider doorstep arrival.'
        }
      ];
    }

    // Save follow-ups to MongoDB (Followup.insertMany)
    await Followup.insertMany(followUps);

    // Step 3: Return confirmation
    return {
      type: "booking_confirmed",
      booking_id: bookingId,
      confirmation: newBooking.confirmation_messages,
      state_change: newBooking.system_state_change,
      follow_up: followUps,
      trace
    };

  } catch (err) {
    console.error('Execute Booking error:', err);
    throw err;
  }
};

module.exports = {
  handleServiceRequest,
  executeBooking,
};
