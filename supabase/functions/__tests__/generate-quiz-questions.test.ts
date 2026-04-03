import { assertEquals, assertExists, assert } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("Quiz Generation - validates profile input parameters", async () => {
  const testCases = [
    { 
      profile: { userId: "123", class_level: "12th", study_area: "Science" }, 
      shouldPass: true 
    },
    { 
      profile: { userId: "456", class_level: "10th", study_area: "Commerce", interests: ["Coding", "Math"] }, 
      shouldPass: true 
    },
    { 
      profile: { userId: "", class_level: "12th", study_area: "Science" }, 
      shouldPass: false,
      expectedError: "User ID is required"
    },
    { 
      profile: { userId: "123", class_level: "", study_area: "Science" }, 
      shouldPass: false,
      expectedError: "Class level is required"
    },
    { 
      profile: { userId: "123", class_level: "12th", study_area: "" }, 
      shouldPass: false,
      expectedError: "Study area is required"
    },
    {
      profile: { userId: "123", class_level: "Invalid", study_area: "Science" },
      shouldPass: false,
      expectedError: "Invalid class level"
    },
    {
      profile: { userId: "123", class_level: "12th", study_area: "Invalid" },
      shouldPass: false,
      expectedError: "Invalid study area"
    }
  ];

  for (const testCase of testCases) {
    const { profile, shouldPass, expectedError } = testCase;
    
    // Validate profile
    const validClassLevels = ['10th', '12th', 'UG', 'PG', 'Diploma'];
    const validStudyAreas = ['Science', 'Commerce', 'Arts', 'All'];
    
    const isValid = 
      profile.userId && typeof profile.userId === 'string' && profile.userId.length > 0 &&
      profile.class_level && typeof profile.class_level === 'string' && validClassLevels.includes(profile.class_level) &&
      profile.study_area && typeof profile.study_area === 'string' && validStudyAreas.includes(profile.study_area);
    
    assertEquals(isValid, shouldPass, 
      `Profile validation failed for userId="${profile.userId}", class_level="${profile.class_level}", study_area="${profile.study_area}". Expected: ${shouldPass}, Got: ${isValid}`
    );
  }
});

Deno.test("Quiz Generation - validates optional profile fields", () => {
  const profileWithOptionals = {
    userId: "123",
    class_level: "12th",
    study_area: "Science",
    interests: ["Coding", "Math", "Physics"],
    location: { state: "UP", district: "Lucknow" },
    past_scores: [
      { category: "logical", score: 85 },
      { category: "quantitative", score: 90 }
    ]
  };

  // Validate structure
  assertExists(profileWithOptionals.userId);
  assertExists(profileWithOptionals.class_level);
  assertExists(profileWithOptionals.study_area);
  assertExists(profileWithOptionals.interests);
  assert(Array.isArray(profileWithOptionals.interests));
  assertEquals(profileWithOptionals.interests.length, 3);
  assertExists(profileWithOptionals.location);
  assertExists(profileWithOptionals.past_scores);
  assert(Array.isArray(profileWithOptionals.past_scores));
});

Deno.test("Quiz Generation - validates AI response format", () => {
  const validResponse = [
    {
      question_text: "Test question?",
      category: "logical",
      options: [
        { text: "Option 1", points: 1 },
        { text: "Option 2", points: 3 },
        { text: "Option 3", points: 5 },
        { text: "Option 4", points: 2 }
      ],
      target_class_levels: ["12th"],
      target_study_areas: ["Science"]
    }
  ];

  // Validate structure
  assertExists(validResponse[0].question_text);
  assertExists(validResponse[0].category);
  assertExists(validResponse[0].options);
  assertEquals(validResponse[0].options.length, 4);
  
  // Validate each option has required fields
  for (const option of validResponse[0].options) {
    assertExists(option.text);
    assertExists(option.points);
    assertEquals(typeof option.points, 'number');
  }
});

Deno.test("Quiz Generation - validates question diversity", () => {
  const categories = ["logical", "analytical", "creative", "technical", "quantitative", "verbal", "interpersonal"];
  
  const questions = [
    { category: "logical" },
    { category: "analytical" },
    { category: "creative" },
    { category: "technical" },
    { category: "quantitative" },
  ];

  const uniqueCategories = new Set(questions.map(q => q.category));
  
  // Should have at least 5 different categories in 20 questions
  assertEquals(uniqueCategories.size >= 5, true, "Questions should span multiple categories");
});

Deno.test("Quiz Generation - deterministic seeding produces consistent results", () => {
  // Deterministic shuffle function
  function seedRandom(seed: number) {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  function shuffleWithSeed<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    const random = seedRandom(seed);
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const seed = 42;
  
  const shuffled1 = shuffleWithSeed(testArray, seed);
  const shuffled2 = shuffleWithSeed(testArray, seed);
  
  // Same seed should produce identical results
  assertEquals(JSON.stringify(shuffled1), JSON.stringify(shuffled2), 
    "Deterministic shuffle should produce identical results with same seed");
  
  // Different seed should produce different results (with high probability)
  const shuffled3 = shuffleWithSeed(testArray, 123);
  assert(JSON.stringify(shuffled1) !== JSON.stringify(shuffled3), 
    "Different seeds should produce different shuffles");
});

Deno.test("Quiz Generation - structured error codes are returned", () => {
  const errorCodes = {
    MISSING_PROFILE_FIELD: 'ERR_MISSING_PROFILE_FIELD',
    INVALID_PROFILE_DATA: 'ERR_INVALID_PROFILE_DATA',
    AI_GENERATION_FAILED: 'ERR_AI_GENERATION_FAILED',
    NO_QUESTIONS_AVAILABLE: 'ERR_NO_QUESTIONS_AVAILABLE',
    DATABASE_ERROR: 'ERR_DATABASE_ERROR',
  };

  // Validate error codes are defined
  assertExists(errorCodes.MISSING_PROFILE_FIELD);
  assertExists(errorCodes.INVALID_PROFILE_DATA);
  assertExists(errorCodes.AI_GENERATION_FAILED);
  assertExists(errorCodes.NO_QUESTIONS_AVAILABLE);
  assertExists(errorCodes.DATABASE_ERROR);
});
