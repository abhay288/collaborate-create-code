# AVSAR AI Features Documentation

## Overview

AVSAR leverages Lovable AI (powered by Google Gemini 2.5 Flash) to provide intelligent career guidance and personalized recommendations. This document explains the AI-powered features and how they work.

## AI-Powered Features

### 1. Career Recommendations Engine

**Edge Function:** `generate-career-recommendations`

The career recommendations system analyzes quiz responses to generate personalized career suggestions using AI.

**How it works:**
1. User completes an aptitude quiz with questions across categories:
   - Logical Reasoning
   - Analytical Skills
   - Creativity
   - Technical Interests

2. Quiz responses are analyzed to calculate category-wise performance scores

3. Performance data is sent to Lovable AI with the prompt:
   ```
   User scored: 
   - logical_reasoning: 85%
   - analytical_skills: 72%
   - creativity: 68%
   - technical_interests: 90%
   
   Suggest 5 suitable careers with confidence scores (0-100)
   ```

4. AI generates structured recommendations using function calling:
   - Career title
   - Confidence score (match percentage)
   - Brief reason for recommendation

5. Recommendations are saved to the database and linked to the user's quiz session

**Benefits:**
- Personalized career matches based on actual aptitude
- Confidence scores help prioritize options
- AI-generated reasoning provides context

### 2. Career Description Generator

**Edge Function:** `generate-career-description`

Generates comprehensive, detailed information about specific careers.

**How it works:**
1. When a user wants detailed information about a career, the system calls this edge function
2. AI generates detailed content including:
   - Career overview
   - Key responsibilities
   - Required skills
   - Education requirements
   - Career prospects
   - Salary information

**Benefits:**
- Rich, detailed career information
- Contextual guidance for each career path
- Helps users make informed decisions

## Real-time Features

### Activity Tracking & Notifications

**Hook:** `useRealtimeNotifications`

Real-time notifications keep users informed about important events:

**Tracked Activities:**
- Quiz started/completed
- Career recommendations generated
- Items added to favorites
- Career/college/scholarship views

**How it works:**
1. User actions trigger database inserts in `user_activity` table
2. Supabase real-time listens for INSERT events
3. Notifications appear instantly via toast messages
4. Recent notifications displayed in notification bell

## Analytics & Insights

**Hook:** `useAnalytics`

Provides users with insights into their platform usage:

**Metrics Tracked:**
- Total quizzes taken
- Career recommendations received
- Careers explored
- Colleges and scholarships saved
- Activity trends over time

**Dashboard Integration:**
The dashboard displays real-time analytics using the `AnalyticsCard` component, giving users a comprehensive view of their journey.

## Favorites System

**Hook:** `useFavorites`

Allows users to bookmark and save items for later:

**Supported Item Types:**
- Careers
- Colleges
- Scholarships

**Features:**
- Add/remove favorites
- Check if item is favorited
- Persistent storage across sessions

## AI Model Configuration

**Model:** `google/gemini-2.5-flash`

This model was chosen for its:
- Balanced performance and cost
- Strong reasoning capabilities
- Fast response times
- Excellent accuracy for career guidance tasks

## Error Handling

All AI features include comprehensive error handling:

**Rate Limiting (429):**
- Displayed to user: "Rate limit exceeded. Please try again later."
- Occurs when too many requests are made in short time

**Payment Required (402):**
- Displayed to user: "AI service payment required. Please contact support."
- Occurs when AI credits are exhausted

**General Errors:**
- All errors are logged to console for debugging
- User-friendly messages displayed via toast notifications
- Graceful fallbacks prevent application crashes

## Security Considerations

1. **Authentication Required:** All AI endpoints require user authentication via JWT
2. **Server-Side Processing:** AI API keys never exposed to client
3. **RLS Policies:** All database access controlled by Row Level Security
4. **Input Validation:** Quiz responses validated before processing

## Usage Tips

### For Users:
1. Complete the full aptitude quiz for best recommendations
2. Review all career matches, not just the highest confidence ones
3. Check notifications regularly for updates
4. Use favorites to track interesting opportunities

### For Admins:
1. Monitor AI usage to stay within rate limits
2. Review analytics to understand user engagement
3. Add sample careers, colleges, and scholarships to database
4. Keep quiz questions updated and relevant

## Future Enhancements

Potential AI-powered features for future implementation:
- College match predictions based on profile
- Scholarship eligibility checker
- Interview preparation assistant
- Career path progression analyzer
- Resume builder with AI suggestions
- Personalized study recommendations

## API Reference

### Generate Career Recommendations

```typescript
const { data, error } = await supabase.functions.invoke(
  'generate-career-recommendations',
  {
    body: {
      quizSessionId: string,
      responses: Array<{
        question_id: string,
        category: string,
        selected_option: string,
        isCorrect: boolean
      }>
    }
  }
);
```

### Generate Career Description

```typescript
const { data, error } = await supabase.functions.invoke(
  'generate-career-description',
  {
    body: {
      careerTitle: string,
      category: string
    }
  }
);
```

## Support

For issues with AI features:
1. Check console logs for detailed error messages
2. Verify authentication is working
3. Ensure AI credits are available
4. Check Supabase Edge Function logs
5. Contact support if issues persist

---

Last Updated: October 2024
Version: 1.0.0
