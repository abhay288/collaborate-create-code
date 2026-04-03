# Quick Test Commands Reference

## Run All Tests

```bash
# Run complete test suite
deno test --allow-all supabase/functions/__tests__/

# Run with verbose output
deno test --allow-all --reporter=pretty supabase/functions/__tests__/
```

## Run Specific Tests

```bash
# Error reproduction tests
deno test supabase/functions/__tests__/error-reproduction.test.ts

# Quiz generation tests
deno test supabase/functions/__tests__/generate-quiz-questions.test.ts

# Recommendation tests
deno test supabase/functions/__tests__/recommendations.test.ts

# Answer saving tests
deno test supabase/functions/__tests__/answer-saving.test.ts
```

## View Edge Function Logs

```bash
# Generate quiz questions logs
supabase functions logs generate-quiz-questions --limit 50

# Career recommendations logs (with errors)
supabase functions logs generate-career-recommendations | grep ERROR

# Real-time tail logs
supabase functions logs --tail
```

## Test Specific Profile

```bash
# Test 12th Science profile
curl -X POST "$(supabase status | grep 'API URL' | awk '{print $3}')/functions/v1/generate-quiz-questions" \
  -H "Authorization: Bearer $(supabase status | grep 'anon key' | awk '{print $3}')" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "userId": "test-12th-science-001",
      "class_level": "12th",
      "study_area": "Science",
      "interests": ["Computer Science", "Math"]
    }
  }'
```

## Database Checks

```sql
-- Check for colleges with null names
SELECT COUNT(*) 
FROM colleges 
WHERE name IS NULL OR college_name IS NULL;

-- Check user profiles with invalid study areas
SELECT id, study_area 
FROM profiles 
WHERE study_area NOT IN ('Science', 'Commerce', 'Arts', 'All');

-- View quiz session errors
SELECT id, user_id, completed, score, category_scores
FROM quiz_sessions
WHERE score IS NULL AND completed = true;
```

## Deploy & Test Flow

```bash
# 1. Deploy edge functions (automatic with Lovable)
# Functions auto-deploy on code save

# 2. Run tests
deno test --allow-all supabase/functions/__tests__/

# 3. Check logs
supabase functions logs --tail

# 4. Test in browser
# Navigate to /quiz and complete a quiz

# 5. Verify in database
# Check quiz_sessions, quiz_responses, career_recommendations tables
```

## Common Test Scenarios

### Scenario 1: New User Takes Quiz

```bash
# Expected flow:
# 1. User profile validated ✓
# 2. Quiz questions generated (AI or fallback) ✓
# 3. Answers saved progressively ✓
# 4. Quiz submitted successfully ✓
# 5. Recommendations generated ✓

# Check logs:
supabase functions logs generate-quiz-questions --limit 10
supabase functions logs generate-career-recommendations --limit 10
```

### Scenario 2: Error - Invalid Profile

```bash
# Expected:
# - Validation fails with ERR_INVALID_PROFILE_DATA
# - User shown friendly error message
# - Redirected to profile completion

# Test with invalid study area
curl -X POST "$API_URL/functions/v1/generate-quiz-questions" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{"profile": {"userId": "test", "class_level": "UG", "study_area": "InvalidArea"}}'

# Should return 400 with error code
```

### Scenario 3: AI Generation Fails → Fallback

```bash
# Expected:
# - AI generation attempted
# - AI fails (rate limit / error)
# - Fallback to question bank triggered
# - Questions returned successfully

# Check logs for fallback trigger:
supabase functions logs generate-quiz-questions | grep -A 5 "Falling back"
```

## Performance Testing

```bash
# Time quiz generation
time curl -X POST "$API_URL/functions/v1/generate-quiz-questions" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d @test-profiles/ug-cs.json

# Expected: < 5 seconds for AI generation
# Expected: < 1 second for fallback
```

## Debugging Checklist

When a test fails:

1. **Check logs first**
   ```bash
   supabase functions logs [function-name] --limit 50
   ```

2. **Verify profile data**
   ```sql
   SELECT * FROM profiles WHERE id = 'user-id';
   ```

3. **Check database state**
   ```sql
   -- Questions available?
   SELECT COUNT(*) FROM quiz_questions;
   
   -- Sessions in progress?
   SELECT * FROM quiz_sessions WHERE completed = false;
   ```

4. **Run relevant test**
   ```bash
   deno test supabase/functions/__tests__/error-reproduction.test.ts
   ```

5. **Review error codes**
   - `ERR_MISSING_PROFILE_FIELD`: Required field missing
   - `ERR_INVALID_PROFILE_DATA`: Invalid data format/value
   - `ERR_AI_GENERATION_FAILED`: AI service error
   - `ERR_NO_QUESTIONS_AVAILABLE`: No questions found/generated
   - `ERR_DATABASE_ERROR`: Database operation failed
