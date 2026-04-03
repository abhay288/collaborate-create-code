import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("Recommendations - validates category score calculation", () => {
  const responses = [
    { category: "logical", isCorrect: true },
    { category: "logical", isCorrect: false },
    { category: "logical", isCorrect: true },
    { category: "technical", isCorrect: true },
    { category: "technical", isCorrect: true },
  ];

  const categoryScores = responses.reduce((acc: any, response: any) => {
    if (!acc[response.category]) {
      acc[response.category] = { correct: 0, total: 0 };
    }
    acc[response.category].total++;
    if (response.isCorrect) {
      acc[response.category].correct++;
    }
    return acc;
  }, {});

  assertEquals(categoryScores.logical.correct, 2);
  assertEquals(categoryScores.logical.total, 3);
  assertEquals(categoryScores.technical.correct, 2);
  assertEquals(categoryScores.technical.total, 2);
  
  // Calculate percentages
  const logicalScore = (categoryScores.logical.correct / categoryScores.logical.total) * 100;
  const technicalScore = (categoryScores.technical.correct / categoryScores.technical.total) * 100;
  
  assertEquals(Math.round(logicalScore), 67);
  assertEquals(technicalScore, 100);
});

Deno.test("Recommendations - validates confidence score range", () => {
  const recommendations = [
    { career: "Software Engineer", confidence: 85 },
    { career: "Data Scientist", confidence: 92 },
    { career: "Product Manager", confidence: 78 },
  ];

  for (const rec of recommendations) {
    assertExists(rec.career);
    assertExists(rec.confidence);
    assertEquals(rec.confidence >= 0 && rec.confidence <= 100, true, 
      `Confidence ${rec.confidence} should be between 0-100`);
  }
});

Deno.test("Recommendations - ensures deterministic output for same input", () => {
  const profile = [
    { category: "technical", score: 85 },
    { category: "logical", score: 78 },
    { category: "quantitative", score: 72 },
  ];

  // Simulate recommendation generation twice with same input
  const generateRecs = (prof: typeof profile) => {
    return prof
      .sort((a, b) => b.score - a.score)
      .map(p => ({ category: p.category, score: p.score }));
  };

  const recs1 = generateRecs([...profile]);
  const recs2 = generateRecs([...profile]);

  assertEquals(JSON.stringify(recs1), JSON.stringify(recs2), 
    "Same input should produce same recommendations");
});

Deno.test("Recommendations - validates UUID format", () => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  const validUUIDs = [
    "123e4567-e89b-12d3-a456-426614174000",
    "550e8400-e29b-41d4-a716-446655440000",
  ];
  
  const invalidUUIDs = [
    "not-a-uuid",
    "123-456-789",
    "",
  ];

  for (const uuid of validUUIDs) {
    assertEquals(uuidRegex.test(uuid), true, `${uuid} should be valid UUID`);
  }
  
  for (const uuid of invalidUUIDs) {
    assertEquals(uuidRegex.test(uuid), false, `${uuid} should be invalid UUID`);
  }
});
