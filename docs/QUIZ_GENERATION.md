# Profile-Based Quiz Generation System

## Overview

The quiz generation system dynamically creates personalized aptitude assessments based on comprehensive user profiles. It uses AI for generation with automatic fallback to a verified question bank.

## Architecture

### 1. User Profile Input

Quiz generation accepts a complete user profile:

```typescript
interface UserProfile {
  userId: string;                    // Required: User identifier
  class_level: string;               // Required: '10th' | '12th' | 'UG' | 'PG' | 'Diploma'
  study_area: string;                // Required: 'Science' | 'Commerce' | 'Arts' | 'All'
  interests?: string[];              // Optional: User interests (e.g., ['Coding', 'Math'])
  location?: {                       // Optional: User location
    state?: string;
    district?: string;
  };
  past_scores?: Array<{              // Optional: Historical performance
    category: string;
    score: number;
  }>;
}
```

### 2. Profile Validation

**Server-side validation** ensures data integrity:

- **Required fields**: `userId`, `class_level`, `study_area`
- **Valid values**: Class levels and study areas must match predefined enums
- **Type checking**: All fields validated for correct types
- **Structured errors**: Returns error codes with specific field information

**Error Response Format**:
```json
{
  "error": "User ID is required",
  "code": "ERR_MISSING_PROFILE_FIELD",
  "field": "userId"
}
```

**Error Codes**:
- `ERR_MISSING_PROFILE_FIELD`: Required field missing
- `ERR_INVALID_PROFILE_DATA`: Invalid data format or value
- `ERR_AI_GENERATION_FAILED`: AI generation error
- `ERR_NO_QUESTIONS_AVAILABLE`: No questions found/generated
- `ERR_DATABASE_ERROR`: Database operation failed

### 3. AI Generation Pipeline

#### Step 1: Profile-Aware Prompt Engineering

The system builds context-rich prompts using:
- Education level and study area
- User interests (if provided)
- Geographic location (if provided)
- Past performance data (if available)

```typescript
const systemPrompt = `Generate aptitude questions for:
- Education Level: ${profile.class_level}
- Study Area: ${profile.study_area}
- Interests: ${profile.interests?.join(', ')}
- Location: ${profile.location?.state}
- Past performance: ${profile.past_scores?.map(s => `${s.category}: ${s.score}%`)}
...`;
```

#### Step 2: Question Generation

- **Model**: `google/gemini-2.5-flash`
- **Temperature**: 0.3 (deterministic) or 0.8 (random)
- **Categories**: logical, analytical, creative, technical, quantitative, verbal, interpersonal
- **Output**: 20 questions with 4 options each (points: 1-5)

#### Step 3: Response Validation

Each generated question is validated:
```typescript
// Structure validation
- question_text: non-empty string
- category: valid category name
- options: array of exactly 4 options
- Each option: { text: string, points: 1-5 }
- target_class_levels: array
- target_study_areas: array
```

### 4. Deterministic Seeding (Debug Mode)

For reproducible testing and debugging:

```typescript
// Client call with seed
await supabase.functions.invoke('generate-quiz-questions', {
  body: { 
    profile: userProfile,
    seed: 12345  // Same seed = same quiz
  }
});
```

**Implementation**:
- Uses Linear Congruential Generator (LCG) algorithm
- Seed controls both question selection and shuffling
- Lower temperature (0.3) for more consistent AI output
- Enables regression testing and issue reproduction

### 5. Fallback Mechanism

**Automatic Fallback Flow**:
```
AI Generation → Validation → Success ✓
       ↓ (on failure)
Question Bank Fallback → Success ✓
       ↓ (on failure)
Structured Error Response
```

**Fallback Triggers**:
- AI API rate limit (429)
- AI API credits exhausted (402)
- Invalid AI response format
- Network errors
- Timeout errors

**Fallback Source**:
- Uses existing verified questions from database
- Filtered by user's class_level and study_area
- Ensures users always get a functional quiz

### 6. Question Shuffling

**Two-Stage Shuffle**:
1. **Questions**: Shuffled after generation/retrieval
2. **Options**: Each question's options shuffled independently

**Shuffle Types**:
- **Random**: Different order each time (no seed)
- **Deterministic**: Same order with same seed (debug mode)

## Usage Examples

### Basic Usage (Frontend)

```typescript
// In Quiz.tsx
const { data: profile } = await supabase
  .from('profiles')
  .select('class_level, study_area, interests, preferred_state, preferred_district')
  .eq('id', user.id)
  .single();

const userProfile = {
  userId: user.id,
  class_level: profile.class_level,
  study_area: profile.study_area,
  interests: profile.interests || [],
  location: {
    state: profile.preferred_state,
    district: profile.preferred_district
  },
  past_scores: [] // Fetch from quiz_sessions if needed
};

const { data, error } = await supabase.functions.invoke(
  'generate-quiz-questions',
  { body: { profile: userProfile } }
);
```

### Debug Mode Usage

```typescript
// Generate deterministic quiz for testing
const { data } = await supabase.functions.invoke(
  'generate-quiz-questions',
  { 
    body: { 
      profile: userProfile,
      seed: 42 // Always generates same quiz
    } 
  }
);
```

### Error Handling

```typescript
const { data, error } = await supabase.functions.invoke(
  'generate-quiz-questions',
  { body: { profile: userProfile } }
);

if (error) {
  const errorCode = error.code;
  
  switch (errorCode) {
    case 'ERR_MISSING_PROFILE_FIELD':
      // Redirect to profile completion
      navigate('/profile');
      break;
    case 'ERR_INVALID_PROFILE_DATA':
      // Show validation error
      toast.error(error.message);
      break;
    case 'ERR_NO_QUESTIONS_AVAILABLE':
      // Show maintenance message
      toast.error('Quiz temporarily unavailable');
      break;
    default:
      // Generic error
      toast.error('Failed to load quiz');
  }
}
```

## Response Format

### Successful Response

```json
{
  "success": true,
  "questions": [
    {
      "id": "uuid",
      "question_text": "Question text here",
      "category": "logical",
      "options": [
        { "text": "Option 1", "points": 1 },
        { "text": "Option 2", "points": 5 },
        { "text": "Option 3", "points": 3 },
        { "text": "Option 4", "points": 2 }
      ],
      "target_class_levels": ["12th"],
      "target_study_areas": ["Science"]
    }
  ],
  "count": 20,
  "source": "ai_generated" | "fallback_bank",
  "deterministic": true | false,
  "profile": {
    "class_level": "12th",
    "study_area": "Science",
    "has_interests": true,
    "has_location": true,
    "has_past_scores": false
  }
}
```

### Error Response

```json
{
  "error": "Class level is required",
  "code": "ERR_MISSING_PROFILE_FIELD",
  "field": "class_level"
}
```

## Testing

### Unit Tests

Run tests with:
```bash
deno test supabase/functions/__tests__/generate-quiz-questions.test.ts
```

**Test Coverage**:
- ✓ Profile validation (required fields)
- ✓ Profile validation (optional fields)
- ✓ Invalid profile data handling
- ✓ AI response format validation
- ✓ Question diversity validation
- ✓ Deterministic seeding consistency
- ✓ Structured error code validation

### Integration Testing

1. **Test AI Generation**:
   ```bash
   # Call edge function directly
   curl -X POST https://your-project.supabase.co/functions/v1/generate-quiz-questions \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"profile": {"userId": "123", "class_level": "12th", "study_area": "Science"}}'
   ```

2. **Test Fallback Mechanism**:
   - Temporarily disable AI API key
   - Verify fallback to question bank
   - Check structured error responses

3. **Test Deterministic Seeding**:
   - Generate quiz with seed=42 twice
   - Verify identical question order
   - Verify identical option order

## Monitoring & Debugging

### Logs to Monitor

1. **Profile Validation Logs**:
   ```
   Validated profile: { userId: "...", class_level: "12th", study_area: "Science" }
   Profile validation failed: { code: "ERR_MISSING_PROFILE_FIELD", field: "userId" }
   ```

2. **Generation Logs**:
   ```
   Generating questions for profile: 12th - Science (seed: 42)
   AI generated 20 questions successfully
   Falling back to verified question bank...
   Successfully retrieved questions from fallback bank
   ```

3. **Database Logs**:
   ```
   Inserting 20 AI-generated questions into database...
   Successfully generated and inserted 20 questions
   Returning 20 questions from database (fallback)
   ```

### Debug Checklist

- [ ] Profile validation passes
- [ ] AI generation successful or fallback triggered
- [ ] Questions meet validation criteria
- [ ] Shuffling works (random or deterministic)
- [ ] Database insertion successful
- [ ] Error codes returned correctly
- [ ] User receives functional quiz

## Performance Considerations

1. **Caching**: Consider caching generated questions for identical profiles
2. **Batch Processing**: Pre-generate questions for common profiles
3. **Rate Limiting**: Monitor AI API usage to avoid 429 errors
4. **Fallback Optimization**: Keep question bank well-stocked and indexed

## Future Enhancements

- [ ] Machine learning model for adaptive difficulty
- [ ] Real-time question generation based on user performance
- [ ] Multi-language support
- [ ] Question quality scoring and feedback loop
- [ ] Advanced analytics on question effectiveness
