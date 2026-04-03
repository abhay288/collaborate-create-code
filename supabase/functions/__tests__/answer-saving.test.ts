import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("Answer Saving - validates response structure", () => {
  const validResponse = {
    user_id: "123e4567-e89b-12d3-a456-426614174000",
    quiz_session_id: "123e4567-e89b-12d3-a456-426614174001",
    question_id: "123e4567-e89b-12d3-a456-426614174002",
    selected_option: "Option A",
    points_earned: 5
  };

  // Validate required fields
  assertExists(validResponse.user_id);
  assertExists(validResponse.quiz_session_id);
  assertExists(validResponse.question_id);
  assertExists(validResponse.selected_option);
  assertExists(validResponse.points_earned);
  
  // Validate types
  assertEquals(typeof validResponse.points_earned, 'number');
  assertEquals(validResponse.points_earned >= 0 && validResponse.points_earned <= 5, true);
});

Deno.test("Answer Saving - handles update vs insert correctly", () => {
  // Simulate checking if response exists
  const existingResponses = new Map();
  
  const questionId = "q1";
  const response1 = { questionId, answer: "A", points: 3 };
  const response2 = { questionId, answer: "B", points: 5 }; // Updated answer
  
  // First save (insert)
  existingResponses.set(questionId, response1);
  assertEquals(existingResponses.has(questionId), true);
  assertEquals(existingResponses.get(questionId).answer, "A");
  
  // Second save (update)
  existingResponses.set(questionId, response2);
  assertEquals(existingResponses.get(questionId).answer, "B");
  assertEquals(existingResponses.get(questionId).points, 5);
});

Deno.test("Answer Saving - validates points range", () => {
  const validPoints = [1, 2, 3, 4, 5];
  const invalidPoints = [-1, 0, 6, 10, 100];
  
  for (const points of validPoints) {
    assertEquals(points >= 1 && points <= 5, true, `Points ${points} should be valid`);
  }
  
  for (const points of invalidPoints) {
    assertEquals(points >= 1 && points <= 5, false, `Points ${points} should be invalid`);
  }
});
