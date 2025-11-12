import { z } from 'zod';

// UUID validation schema
export const uuidSchema = z.string().uuid({ message: "Invalid UUID format" });

// Quiz response validation
export const quizResponseSchema = z.object({
  user_id: uuidSchema,
  quiz_session_id: uuidSchema,
  question_id: uuidSchema,
  selected_option: z.string().min(1, "Selected option cannot be empty").max(500),
  points_earned: z.number().int().min(1).max(5, "Points must be between 1 and 5")
});

// Quiz session validation
export const quizSessionSchema = z.object({
  user_id: uuidSchema,
  completed: z.boolean(),
  score: z.number().int().min(0).max(100).optional(),
  category_scores: z.record(z.any()).optional()
});

// Career recommendation validation
export const careerRecommendationSchema = z.object({
  career: z.string().min(1).max(200),
  confidence: z.number().int().min(0).max(100),
  reason: z.string().min(1).max(1000)
});

// College data validation
export const collegeSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(1).max(500),
  state: z.string().min(1).max(100),
  district: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  college_type: z.string().max(100).optional(),
  courses_offered: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  fees: z.number().int().min(0).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

// Profile data validation
export const profileSchema = z.object({
  id: uuidSchema,
  full_name: z.string().max(200).optional(),
  class_level: z.enum(['10th', '12th', 'UG', 'PG', 'Diploma']).optional(),
  study_area: z.enum(['Science', 'Commerce', 'Arts', 'All']).optional(),
  age: z.number().int().min(10).max(100).optional(),
  preferred_state: z.string().max(100).optional(),
  preferred_district: z.string().max(100).optional()
});

// Validation helper functions
export function validateUUID(value: string): boolean {
  try {
    uuidSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}

export function validateQuizResponse(data: unknown): boolean {
  try {
    quizResponseSchema.parse(data);
    return true;
  } catch (error) {
    console.error('Quiz response validation failed:', error);
    return false;
  }
}

export function validateCollege(data: unknown): boolean {
  try {
    collegeSchema.parse(data);
    return true;
  } catch (error) {
    console.error('College validation failed:', error);
    return false;
  }
}

// Safe data parsing with defaults
export function safeParseCollege(data: any) {
  try {
    return {
      id: data?.id || null,
      name: data?.name || data?.college_name || 'Unknown College',
      state: data?.state || 'Unknown',
      district: data?.district || null,
      location: data?.location || null,
      college_type: data?.college_type || null,
      courses_offered: Array.isArray(data?.courses_offered) ? data.courses_offered : [],
      rating: typeof data?.rating === 'number' ? data.rating : null,
      fees: typeof data?.fees === 'number' ? data.fees : null,
      latitude: typeof data?.latitude === 'number' ? data.latitude : null,
      longitude: typeof data?.longitude === 'number' ? data.longitude : null
    };
  } catch (error) {
    console.error('Error parsing college data:', error);
    return null;
  }
}

// Sanitize string input
export function sanitizeString(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

// Validate and sanitize array
export function sanitizeArray<T>(input: unknown, validator?: (item: T) => boolean): T[] {
  if (!Array.isArray(input)) return [];
  if (!validator) return input;
  return input.filter(validator);
}
