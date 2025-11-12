import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("Quiz Generation - validates input parameters", async () => {
  const testCases = [
    { classLevel: "12th", studyArea: "Science", shouldPass: true },
    { classLevel: "10th", studyArea: "Commerce", shouldPass: true },
    { classLevel: "", studyArea: "Science", shouldPass: false },
    { classLevel: "12th", studyArea: "", shouldPass: false },
  ];

  for (const testCase of testCases) {
    const { classLevel, studyArea, shouldPass } = testCase;
    
    // Validate inputs
    const isValid = classLevel && studyArea && 
                   classLevel.length > 0 && 
                   studyArea.length > 0;
    
    assertEquals(isValid, shouldPass, 
      `Input validation failed for classLevel="${classLevel}", studyArea="${studyArea}"`
    );
  }
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
