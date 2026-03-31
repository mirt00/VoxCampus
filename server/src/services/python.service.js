const axios = require("axios");

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

const rankPost = async (votes, ageHours, gravity = 1.8) => {
  const { data } = await axios.post(`${PYTHON_URL}/rank`, { votes, age_hours: ageHours, gravity });
  return data.score;
};

const checkDuplicate = async (newText, existingPosts) => {
  const { data } = await axios.post(`${PYTHON_URL}/duplicate-check`, {
    new_text: newText,
    existing_posts: existingPosts,
  });
  return data; // { is_duplicate, score, matched_post_id }
};

const checkEscalation = async (submittedAt, categoryWeight, thresholdHours = 48) => {
  const { data } = await axios.post(`${PYTHON_URL}/escalate-check`, {
    submitted_at: submittedAt,
    category_weight: categoryWeight,
    threshold_hours: thresholdHours,
  });
  return data; // { should_escalate, deadline_hours, hours_elapsed }
};

const checkModeration = async (title, body) => {
  const { data } = await axios.post(`${PYTHON_URL}/moderate`, { title, body }, { timeout: 5000 });
  return data;
};

module.exports = { rankPost, checkDuplicate, checkEscalation, checkModeration };
