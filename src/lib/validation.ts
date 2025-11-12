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
    // Validate and sanitize college name - must be non-empty string
    const rawName = data?.name || data?.college_name;
    let collegeName = 'Unknown College';
    
    if (typeof rawName === 'string' && rawName.trim().length > 0) {
      collegeName = rawName.trim();
    }
    
    // Validate and sanitize state
    let state = 'Unknown';
    if (typeof data?.state === 'string' && data.state.trim().length > 0) {
      state = data.state.trim();
    }
    
    // Validate and sanitize district
    let district = null;
    if (typeof data?.district === 'string' && data.district.trim().length > 0) {
      district = data.district.trim();
    }
    
    // Validate and sanitize location
    let location = null;
    if (typeof data?.location === 'string' && data.location.trim().length > 0) {
      location = data.location.trim();
    }
    
    // Validate and sanitize college_type
    let collegeType = null;
    if (typeof data?.college_type === 'string' && data.college_type.trim().length > 0) {
      collegeType = data.college_type.trim();
    }
    
    return {
      id: data?.id || null,
      name: collegeName,
      state: state,
      district: district,
      location: location,
      college_type: collegeType,
      courses_offered: Array.isArray(data?.courses_offered) ? data.courses_offered : [],
      rating: typeof data?.rating === 'number' ? data.rating : null,
      fees: typeof data?.fees === 'number' ? data.fees : null,
      latitude: typeof data?.latitude === 'number' ? data.latitude : null,
      longitude: typeof data?.longitude === 'number' ? data.longitude : null,
      naac_grade: typeof data?.naac_grade === 'string' ? data.naac_grade.trim() : null,
      established_year: typeof data?.established_year === 'number' ? data.established_year : null,
      affiliation: typeof data?.affiliation === 'string' && data.affiliation.trim().length > 0 ? data.affiliation.trim() : null,
      website: typeof data?.website === 'string' && data.website.trim().length > 0 ? data.website.trim() : null,
      admission_link: typeof data?.admission_link === 'string' && data.admission_link.trim().length > 0 ? data.admission_link.trim() : null,
      contact_info: typeof data?.contact_info === 'string' && data.contact_info.trim().length > 0 ? data.contact_info.trim() : null,
      description: typeof data?.description === 'string' && data.description.trim().length > 0 ? data.description.trim() : null,
      eligibility_criteria: typeof data?.eligibility_criteria === 'string' && data.eligibility_criteria.trim().length > 0 ? data.eligibility_criteria.trim() : null,
      is_active: typeof data?.is_active === 'boolean' ? data.is_active : true
    };
  } catch (error) {
    console.error('Error parsing college data:', error, data);
    return null;
  }
}

// Safe string access with lowercase
export function safeStringToLower(value: any): string {
  if (typeof value === 'string' && value.length > 0) {
    return value.toLowerCase();
  }
  return '';
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
