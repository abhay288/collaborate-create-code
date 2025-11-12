# Test User Profiles for Reproducible Testing

## Overview

This document defines standard test user profiles for each class level and study area combination. These profiles ensure consistent and reproducible testing across the quiz generation, recommendation, and college discovery features.

## Profile Matrix

### Profile Schema
```typescript
interface TestProfile {
  userId: string;
  class_level: '10th' | '12th' | 'UG' | 'PG' | 'Diploma';
  study_area: 'Science' | 'Commerce' | 'Arts' | 'All';
  interests: string[];
  location: {
    state: string;
    district?: string;
  };
  past_scores?: Array<{
    category: string;
    score: number;
  }>;
}
```

## Test Profiles

### 1. Class 10th - Science
```json
{
  "userId": "test-10th-science-001",
  "class_level": "10th",
  "study_area": "Science",
  "interests": ["Mathematics", "Physics", "Coding"],
  "location": {
    "state": "Uttar Pradesh",
    "district": "Lucknow"
  }
}
```

**Expected Behavior:**
- Should generate questions for 10th grade science students
- Questions should be age-appropriate (14-15 years)
- Should emphasize logical and quantitative reasoning
- Career recommendations should include engineering, research, technology

---

### 2. Class 10th - Commerce
```json
{
  "userId": "test-10th-commerce-001",
  "class_level": "10th",
  "study_area": "Commerce",
  "interests": ["Business", "Accounting", "Economics"],
  "location": {
    "state": "Maharashtra",
    "district": "Mumbai"
  }
}
```

**Expected Behavior:**
- Questions tailored for commerce stream basics
- Should emphasize analytical and interpersonal reasoning
- Career recommendations: Business, Finance, Banking

---

### 3. Class 10th - Arts
```json
{
  "userId": "test-10th-arts-001",
  "class_level": "10th",
  "study_area": "Arts",
  "interests": ["History", "Literature", "Creative Writing"],
  "location": {
    "state": "West Bengal",
    "district": "Kolkata"
  }
}
```

**Expected Behavior:**
- Creative and verbal reasoning emphasis
- Career recommendations: Teaching, Journalism, Creative fields

---

### 4. Class 12th - Science
```json
{
  "userId": "test-12th-science-001",
  "class_level": "12th",
  "study_area": "Science",
  "interests": ["Computer Science", "Biology", "Research"],
  "location": {
    "state": "Karnataka",
    "district": "Bangalore"
  },
  "past_scores": [
    { "category": "logical", "score": 85 },
    { "category": "quantitative", "score": 90 },
    { "category": "technical", "score": 88 }
  ]
}
```

**Expected Behavior:**
- Advanced science questions
- Should consider past performance in technical categories
- Career recommendations: Engineering (IIT/NIT), Medical, Research

---

### 5. Class 12th - Commerce
```json
{
  "userId": "test-12th-commerce-001",
  "class_level": "12th",
  "study_area": "Commerce",
  "interests": ["Investment", "Marketing", "Entrepreneurship"],
  "location": {
    "state": "Delhi",
    "district": "New Delhi"
  },
  "past_scores": [
    { "category": "analytical", "score": 82 },
    { "category": "interpersonal", "score": 88 }
  ]
}
```

**Expected Behavior:**
- Business-oriented questions
- Career recommendations: CA, MBA, Finance

---

### 6. Class 12th - Arts
```json
{
  "userId": "test-12th-arts-001",
  "class_level": "12th",
  "study_area": "Arts",
  "interests": ["Psychology", "Social Work", "Design"],
  "location": {
    "state": "Tamil Nadu",
    "district": "Chennai"
  }
}
```

**Expected Behavior:**
- Humanities-focused questions
- Career recommendations: Psychology, Social Sciences, Design

---

### 7. UG - Computer Science
```json
{
  "userId": "test-ug-cs-001",
  "class_level": "UG",
  "study_area": "Science",
  "interests": ["AI/ML", "Web Development", "Data Science"],
  "location": {
    "state": "Telangana",
    "district": "Hyderabad"
  },
  "past_scores": [
    { "category": "technical", "score": 92 },
    { "category": "logical", "score": 87 },
    { "category": "analytical", "score": 85 }
  ]
}
```

**Expected Behavior:**
- Advanced technical questions
- Career recommendations: Software Engineer, Data Scientist, Product Manager
- Should recommend nearby tech companies/startups

---

### 8. UG - Commerce (MBA Track)
```json
{
  "userId": "test-ug-commerce-001",
  "class_level": "UG",
  "study_area": "Commerce",
  "interests": ["Finance", "Consulting", "Analytics"],
  "location": {
    "state": "Gujarat",
    "district": "Ahmedabad"
  },
  "past_scores": [
    { "category": "analytical", "score": 88 },
    { "category": "quantitative", "score": 85 }
  ]
}
```

**Expected Behavior:**
- Business analytics focus
- Career recommendations: Investment Banking, Consulting, MBA programs

---

### 9. UG - Arts (Mass Communication)
```json
{
  "userId": "test-ug-arts-001",
  "class_level": "UG",
  "study_area": "Arts",
  "interests": ["Journalism", "Film Making", "Social Media"],
  "location": {
    "state": "Maharashtra",
    "district": "Pune"
  }
}
```

**Expected Behavior:**
- Creative and verbal emphasis
- Career recommendations: Media, Advertising, Content Creation

---

### 10. PG - Research Track
```json
{
  "userId": "test-pg-research-001",
  "class_level": "PG",
  "study_area": "Science",
  "interests": ["Research", "PhD", "Academia"],
  "location": {
    "state": "West Bengal",
    "district": "Kolkata"
  },
  "past_scores": [
    { "category": "analytical", "score": 95 },
    { "category": "logical", "score": 92 },
    { "category": "verbal", "score": 88 }
  ]
}
```

**Expected Behavior:**
- Research-focused questions
- Career recommendations: PhD programs, Research positions, Academia

---

### 11. PG - MBA Track
```json
{
  "userId": "test-pg-mba-001",
  "class_level": "PG",
  "study_area": "Commerce",
  "interests": ["Strategy", "Leadership", "Consulting"],
  "location": {
    "state": "Karnataka",
    "district": "Bangalore"
  },
  "past_scores": [
    { "category": "interpersonal", "score": 90 },
    { "category": "analytical", "score": 87 }
  ]
}
```

**Expected Behavior:**
- Leadership and strategy focus
- Career recommendations: Management Consulting, Product Management, Startups

---

### 12. Diploma - Technical
```json
{
  "userId": "test-diploma-tech-001",
  "class_level": "Diploma",
  "study_area": "Science",
  "interests": ["Electronics", "Mechanics", "Practical Skills"],
  "location": {
    "state": "Uttar Pradesh",
    "district": "Kanpur"
  }
}
```

**Expected Behavior:**
- Practical skills emphasis
- Career recommendations: Technical jobs, Skill-based careers

---

### 13. Edge Case - "All" Study Area
```json
{
  "userId": "test-undecided-001",
  "class_level": "12th",
  "study_area": "All",
  "interests": ["Undecided", "Exploring Options"],
  "location": {
    "state": "Rajasthan",
    "district": "Jaipur"
  }
}
```

**Expected Behavior:**
- Diverse questions across all categories
- Broad career recommendations
- Should help discover interests

---

### 14. Edge Case - Minimal Profile
```json
{
  "userId": "test-minimal-001",
  "class_level": "12th",
  "study_area": "Science",
  "interests": [],
  "location": {
    "state": "Bihar"
  }
}
```

**Expected Behavior:**
- Should generate questions with minimal data
- No interests = broader questions
- Should still provide recommendations

---

## Usage in Tests

### Automated Test Template
```typescript
describe('Quiz Generation for Profile', () => {
  const profile = TEST_PROFILES.UG_COMPUTER_SCIENCE;
  
  it('should generate 20 questions', async () => {
    const result = await generateQuiz(profile);
    expect(result.questions).toHaveLength(20);
  });
  
  it('should match profile characteristics', async () => {
    const result = await generateQuiz(profile);
    expect(result.questions.some(q => q.category === 'technical')).toBe(true);
  });
});
```

### Manual Testing Workflow
1. Create test user with specific profile
2. Run quiz generation with deterministic seed
3. Verify question distribution
4. Submit pre-defined answers
5. Verify recommendation generation
6. Check college/scholarship mapping
7. Capture logs and compare with expected behavior

---

## Test Coverage Matrix

| Class Level | Science | Commerce | Arts | All |
|-------------|---------|----------|------|-----|
| 10th        | ✓       | ✓        | ✓    | -   |
| 12th        | ✓       | ✓        | ✓    | ✓   |
| UG          | ✓       | ✓        | ✓    | -   |
| PG          | ✓       | ✓        | -    | -   |
| Diploma     | ✓       | -        | -    | -   |

**Total Profiles**: 14
**Edge Cases**: 2
**Total Test Cases**: 16

---

## Known Issues to Test

### 1. Invalid Study Area
- **Profile**: `study_area: "Other"`
- **Expected**: Validation error with code `ERR_INVALID_PROFILE_DATA`
- **Current Behavior**: 400 error

### 2. Undefined College Name
- **Scenario**: College record with `name: null`
- **Expected**: Graceful handling, display "Unknown College"
- **Current Behavior**: `TypeError: can't access property "toLowerCase"`

### 3. Missing Profile Fields
- **Scenario**: Profile without `class_level`
- **Expected**: Validation error with code `ERR_MISSING_PROFILE_FIELD`

---

## Updating Test Profiles

When adding new profiles:
1. Follow the schema structure
2. Add to this document
3. Create corresponding test cases
4. Update coverage matrix
5. Document expected behavior
