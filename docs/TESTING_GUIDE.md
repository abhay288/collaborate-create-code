# Testing Guide - Error Reproduction & Verification

## Overview

This guide provides step-by-step instructions for reproducing errors, running tests, and verifying fixes in the AVSAR platform.

## Setup Test Environment

### 1. Create Test User Profiles

Run this SQL in Supabase SQL Editor to create test profiles:

```sql
-- Create test users (if auth allows, or manually create via dashboard)
-- Note: You need to create actual auth users first in Supabase Auth dashboard

-- Insert test profiles
INSERT INTO public.profiles (id, full_name, class_level, study_area, interests, preferred_state, preferred_district)
VALUES 
  -- Test user IDs (replace with actual auth user IDs after creating users)
  ('test-10th-science-001', 'Test Student 10th Science', '10th', 'Science', ARRAY['Mathematics', 'Physics', 'Coding'], 'Uttar Pradesh', 'Lucknow'),
  ('test-12th-science-001', 'Test Student 12th Science', '12th', 'Science', ARRAY['Computer Science', 'Biology', 'Research'], 'Karnataka', 'Bangalore'),
  ('test-ug-cs-001', 'Test Student UG CS', 'UG', 'Science', ARRAY['AI/ML', 'Web Development', 'Data Science'], 'Telangana', 'Hyderabad'),
  ('test-12th-commerce-001', 'Test Student 12th Commerce', '12th', 'Commerce', ARRAY['Investment', 'Marketing', 'Entrepreneurship'], 'Delhi', 'New Delhi'),
  ('test-ug-commerce-001', 'Test Student UG Commerce', 'UG', 'Commerce', ARRAY['Finance', 'Consulting', 'Analytics'], 'Gujarat', 'Ahmedabad');

-- Insert test quiz sessions with past scores
INSERT INTO public.quiz_sessions (id, user_id, completed, score, category_scores)
VALUES 
  ('test-session-12th-science', 'test-12th-science-001', true, 85, 
   '{"logical": {"total": 17, "max": 20}, "quantitative": {"total": 18, "max": 20}, "technical": {"total": 17, "max": 20}}'::jsonb),
  ('test-session-ug-cs', 'test-ug-cs-001', true, 92,
   '{"technical": {"total": 18, "max": 20}, "logical": {"total": 17, "max": 20}, "analytical": {"total": 17, "max": 20}}'::jsonb);
```

### 2. Run Unit Tests

```bash
# Run all tests
deno test supabase/functions/__tests__/

# Run specific test file
deno test supabase/functions/__tests__/error-reproduction.test.ts

# Run tests with detailed output
deno test --allow-all supabase/functions/__tests__/error-reproduction.test.ts -- --verbose
```

## Error Reproduction Steps

### Error 1: Invalid Study Area (ERR_INVALID_PROFILE_DATA)

**Current Status**: ✅ Reproduced in tests

**Steps to Reproduce**:
1. Create a profile with `study_area: "Other"` (not in ['Science', 'Commerce', 'Arts', 'All'])
2. Navigate to `/quiz` page
3. System attempts to generate quiz

**Expected Behavior**:
- Should return 400 error with structured error code
- Error message: "Invalid study area. Must be one of: Science, Commerce, Arts, All"
- Field: `study_area`

**Current Logs** (from edge function):
```
2025-11-12T17:03:32Z ERROR Profile validation failed: {
  code: "ERR_INVALID_PROFILE_DATA",
  message: "Invalid study area. Must be one of: Science, Commerce, Arts, All",
  field: "study_area"
}
```

**Test Case**:
```typescript
// Run: deno test supabase/functions/__tests__/error-reproduction.test.ts
// Look for: "ERROR REPRODUCTION: Invalid study area"
```

**Fix Required**:
- Option 1: Update profile form to only allow valid study areas
- Option 2: Extend valid study areas list to include common variations
- Option 3: Add mapping for "Other" → "All"

---

### Error 2: College Name Undefined (TypeError)

**Current Status**: ✅ Reproduced in tests

**Steps to Reproduce**:
1. Ensure colleges table has records with `name: null` or `name: undefined`
2. Navigate to `/colleges` page
3. System attempts to filter/sort colleges
4. Error occurs when trying to call `.toLowerCase()` on undefined name

**Error Message**:
```
TypeError: can't access property "toLowerCase", college.name is undefined
```

**Test Case**:
```typescript
// Run: deno test supabase/functions/__tests__/error-reproduction.test.ts
// Look for: "ERROR REPRODUCTION: College name undefined"
```

**Fix Applied** (in `src/pages/Colleges.tsx`):
```typescript
// Before (causes error):
const filtered = colleges.filter(c => 
  c.name.toLowerCase().includes(searchTerm)
);

// After (safe):
const filtered = colleges.filter(c => {
  const name = c?.name || c?.college_name || 'Unknown College';
  return name.toLowerCase().includes(searchTerm);
});
```

**Verification**:
```sql
-- Check for colleges with null/undefined names
SELECT id, college_name, name, state 
FROM colleges 
WHERE name IS NULL OR college_name IS NULL;

-- If found, update them:
UPDATE colleges 
SET name = COALESCE(name, college_name, 'Unknown College')
WHERE name IS NULL;
```

---

### Error 3: Career Recommendations Unauthorized

**Current Status**: ⚠️ Identified in logs

**Error Logs**:
```
2025-11-12T16:59:36Z ERROR Error in generate-career-recommendations: Error: Unauthorized
```

**Steps to Reproduce**:
1. Complete a quiz as a regular user
2. System attempts to generate career recommendations
3. Edge function returns "Unauthorized" error

**Possible Causes**:
- JWT verification enabled but user token not passed correctly
- RLS policies blocking access to required tables
- Missing auth context in edge function

**Investigation Required**:
```bash
# Check edge function configuration
cat supabase/config.toml | grep -A 2 "generate-career-recommendations"

# Should show:
# [functions.generate-career-recommendations]
# verify_jwt = false  # or true with proper token passing

# Check edge function logs
supabase functions logs generate-career-recommendations --limit 50
```

**Fix Options**:
1. If `verify_jwt = true`, ensure token is passed in Authorization header
2. If `verify_jwt = false`, check RLS policies on tables
3. Add detailed error logging to identify exact failure point

---

## Monitoring & Debugging Workflow

### 1. Enable Debug Logging

Set environment variable in local development:
```bash
export DEBUG=true
```

Edge functions will log additional debug information.

### 2. Monitor Real-Time Logs

```bash
# All functions
supabase functions logs --tail

# Specific function
supabase functions logs generate-quiz-questions --tail

# Filter by error level
supabase functions logs generate-quiz-questions | grep ERROR
```

### 3. Check Request/Response Flow

The new logging system captures:
- ✅ Request method, endpoint, payload (PII redacted)
- ✅ Response status code, data, duration
- ✅ Profile validation errors with field names
- ✅ AI generation success/failure
- ✅ Database operation results
- ✅ Fallback mechanism triggers

**Example Log Output**:
```
[2025-11-12T17:10:00Z] [INFO] [generate-quiz-questions] Quiz generation requested
{
  "request": {
    "method": "POST",
    "endpoint": "/generate-quiz-questions",
    "payload": {
      "profile": {
        "userId": "test-ug-cs-001",
        "class_level": "UG",
        "study_area": "Science"
      }
    }
  }
}

[2025-11-12T17:10:02Z] [INFO] [generate-quiz-questions] Quiz generated successfully
{
  "response": {
    "statusCode": 200,
    "data": {
      "success": true,
      "count": 20
    },
    "durationMs": 2500
  }
}
```

### 4. Test with Different Profiles

```bash
# Test each profile type
for profile in "10th-science" "12th-commerce" "ug-cs"; do
  echo "Testing profile: $profile"
  # Call your test endpoint with this profile
  curl -X POST https://your-project.supabase.co/functions/v1/generate-quiz-questions \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d @test-profiles/$profile.json
done
```

---

## Automated Test Suite

### Run Complete Test Suite

```bash
# All tests
deno test --allow-all supabase/functions/__tests__/

# Expected output:
# ✅ ERROR REPRODUCTION: Invalid study area validation
# ✅ ERROR REPRODUCTION: Missing class_level validation
# ✅ ERROR REPRODUCTION: College name undefined handling
# ✅ Minimal profile validation passed
# ✅ INTEGRATION: Complete quiz flow validated
# ✅ STACK TRACE CAPTURED
# ✅ LOGGING: Request/Response format validated
# ✅ TEST SUMMARY: All error scenarios covered
```

### Continuous Integration

Add to your CI pipeline:
```yaml
name: Test Edge Functions
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: denoland/setup-deno@v1
      - run: deno test --allow-all supabase/functions/__tests__/
```

---

## Production Verification Checklist

Before deploying to production:

- [ ] All unit tests pass (`deno test`)
- [ ] Error reproduction tests pass
- [ ] Profile validation working for all class/study combinations
- [ ] College data has no null names (run SQL check)
- [ ] Career recommendations working without "Unauthorized" errors
- [ ] Logging system capturing all request/response flows
- [ ] No PII in logs (email, phone, passwords redacted)
- [ ] Fallback mechanisms tested (AI failure → question bank)
- [ ] Edge function logs reviewed for errors
- [ ] Load testing completed with test profiles

---

## Common Issues & Solutions

### Issue: "Invalid study area" Error

**Solution**: Update user profile to use valid study area:
```sql
UPDATE profiles 
SET study_area = 'All'  -- or 'Science', 'Commerce', 'Arts'
WHERE study_area NOT IN ('Science', 'Commerce', 'Arts', 'All');
```

### Issue: No Questions Generated

**Logs**: "No questions available in question bank"

**Solution**: 
1. Check if questions exist for profile
2. Manually insert seed questions
3. Or trigger AI generation with valid profile

### Issue: Career Recommendations Fail

**Logs**: "Error: Unauthorized"

**Solution**:
1. Check `supabase/config.toml`:
   ```toml
   [functions.generate-career-recommendations]
   verify_jwt = false  # Set to false for testing
   ```
2. Re-deploy edge function
3. Test again

---

## Support & Documentation

- **Test Profiles**: See `docs/TEST_PROFILES.md`
- **Error Codes**: See `supabase/functions/_shared/logger.ts`
- **Edge Function Logs**: https://supabase.com/dashboard/project/[PROJECT_ID]/functions
- **Database Schema**: https://supabase.com/dashboard/project/[PROJECT_ID]/database/tables
