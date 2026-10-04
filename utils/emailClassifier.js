const TIER_1 = {
  "Placement Drive": [
    "placement drive",
    "placement drives",
  ],

  "Campus Recruitment": [
    "campus recruitment",
    "campus recruitments",
    "campus hiring",
    "campus placement",
  ],

  "Job Opportunity": [
    "job opportunity",
    "job opportunities",
    "job opening",
    "job openings",
    "job vacancy",
    "job vacancies",
    "placement opportunity",
    "placement opportunities",
    "recruitment opportunity",
    "recruitment opportunities",
  ],

  "Placement Registration": [
    "placement registration",
    "register for placement",
    "registration for placement",
  ],
};

const TIER_2 = {
  Internship: [
    "internship",
    "internships",
  ],

  "Company Visit": [
    "company visit",
    "company is visiting",
    "company visit to campus",
  ],

  Interview: [
    "interview",
    "interview schedule",
    "interview invitation",
  ],

  Assessment: [
    "assessment",
    "online assessment",
    "aptitude test",
    "coding test",
  ],
};

function normalizeText(value = "") {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function calculateScores(text, categories, weight) {
  const scores = {};

  for (const [subCategory, keywords] of Object.entries(categories)) {
    scores[subCategory] = 0;

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        scores[subCategory] += weight;
      }
    }
  }

  return scores;
}

function getBestMatch(scores) {
  let bestCategory = null;
  let bestScore = 0;

  for (const [category, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestCategory = category;
      bestScore = score;
    }
  }

  return {
    category: bestCategory,
    score: bestScore,
  };
}

function classifyEmail(email) {
  const subject = normalizeText(email.subject);
  const body = normalizeText(email.body);

  // Subject is stronger than body.
  const tier1SubjectScores = calculateScores(subject, TIER_1, 3);
  const tier2SubjectScores = calculateScores(subject, TIER_2, 3);

  const tier1BodyScores = calculateScores(body, TIER_1, 1);
  const tier2BodyScores = calculateScores(body, TIER_2, 1);

  const tier1Scores = {};
  const tier2Scores = {};

  for (const category of Object.keys(TIER_1)) {
    tier1Scores[category] =
      tier1SubjectScores[category] + tier1BodyScores[category];
  }

  for (const category of Object.keys(TIER_2)) {
    tier2Scores[category] =
      tier2SubjectScores[category] + tier2BodyScores[category];
  }

  const bestTier1 = getBestMatch(tier1Scores);
  const bestTier2 = getBestMatch(tier2Scores);

  // Compare the strongest Tier 1 and Tier 2 signals.
  if (bestTier1.score > bestTier2.score && bestTier1.score > 0) {
    return {
      category: "Tier 1",
      subCategory: bestTier1.category,
    };
  }

  if (bestTier2.score > bestTier1.score && bestTier2.score > 0) {
    return {
      category: "Tier 2",
      subCategory: bestTier2.category,
    };
  }

  return {
    category: "Other",
    subCategory: null,
  };
}

module.exports = {
  classifyEmail,
};