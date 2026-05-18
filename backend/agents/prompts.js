const fs = require('fs');
const path = require('path');

const loadPrompt = (filename) => {
  try {
    return fs.readFileSync(path.join(__dirname, '../prompts', filename), 'utf8');
  } catch (err) {
    console.error(`Failed to load system prompt: ${filename}`, err);
    return '';
  }
};

module.exports = {
  ag1: loadPrompt('ag1_intent.txt'),
  ag2: loadPrompt('ag2_matcher.txt'),
  ag3: loadPrompt('ag3_ranking.txt'),
  ag4: loadPrompt('ag4_booking.txt'),
  ag5: loadPrompt('ag5_followup.txt'),
  ag6: loadPrompt('ag6_clarify.txt'),
};
