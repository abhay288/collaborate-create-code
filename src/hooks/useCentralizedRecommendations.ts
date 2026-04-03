import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CareerRecommendation {
  id: string;
  career_id: string;
  confidence_score: number;
  quiz_session_id: string;
  careers: {
    id: string;
    title: string;
    description: string;
    category: string;
    requirements: string | null;
  };
}

interface CollegeRecommendation {
  id: string;
  item_id: string;
  confidence_score: number;
  match_reason: string | null;
  recommendation_type: string;
}

interface UserRecommendationState {
  sessionId: string | null;
  careerRecommendations: CareerRecommendation[];
  collegeRecommendations: CollegeRecommendation[];
  scholarshipRecommendations: CollegeRecommendation[];
  courseRecommendations: CollegeRecommendation[];
  lastUpdated: Date | null;
  loading: boolean;
  error: string | null;
}

// Singleton pattern to ensure consistent recommendations across pages
let cachedRecommendations: UserRecommendationState | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCentralizedRecommendations = () => {
  const { user } = useAuth();
  const [state, setState] = useState<UserRecommendationState>({
    sessionId: null,
    careerRecommendations: [],
    collegeRecommendations: [],
    scholarshipRecommendations: [],
    courseRecommendations: [],
    lastUpdated: null,
    loading: true,
    error: null
  });

  const fetchRecommendations = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    // Use cache if available and not expired
    const now = Date.now();
    if (!forceRefresh && cachedRecommendations && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
      setState({ ...cachedRecommendations, loading: false });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get the latest completed quiz session
      const { data: latestSession, error: sessionError } = await supabase
        .from('quiz_sessions')
        .select('id, completed_at, score, category_scores')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sessionError) throw sessionError;

      if (!latestSession) {
        const noDataState: UserRecommendationState = {
          sessionId: null,
          careerRecommendations: [],
          collegeRecommendations: [],
          scholarshipRecommendations: [],
          courseRecommendations: [],
          lastUpdated: null,
          loading: false,
          error: null
        };
        cachedRecommendations = noDataState;
        lastFetchTime = now;
        setState(noDataState);
        return;
      }

      // Fetch all recommendations for this session in parallel
      const [careerResult, userRecsResult] = await Promise.all([
        supabase
          .from('career_recommendations')
          .select(`
            id,
            career_id,
            confidence_score,
            quiz_session_id,
            careers (id, title, description, category, requirements)
          `)
          .eq('quiz_session_id', latestSession.id)
          .order('confidence_score', { ascending: false }),
        
        supabase
          .from('user_recommendations')
          .select('*')
          .eq('quiz_session_id', latestSession.id)
          .order('confidence_score', { ascending: false })
      ]);

      if (careerResult.error) throw careerResult.error;
      if (userRecsResult.error) throw userRecsResult.error;

      // Separate user recommendations by type
      const userRecs = userRecsResult.data || [];
      const collegeRecs = userRecs.filter(r => r.recommendation_type === 'college');
      const scholarshipRecs = userRecs.filter(r => r.recommendation_type === 'scholarship');
      const courseRecs = userRecs.filter(r => r.recommendation_type === 'course');

      const newState: UserRecommendationState = {
        sessionId: latestSession.id,
        careerRecommendations: careerResult.data || [],
        collegeRecommendations: collegeRecs,
        scholarshipRecommendations: scholarshipRecs,
        courseRecommendations: courseRecs,
        lastUpdated: new Date(latestSession.completed_at || Date.now()),
        loading: false,
        error: null
      };

      // Update cache
      cachedRecommendations = newState;
      lastFetchTime = now;
      setState(newState);

    } catch (error) {
      console.error('Error fetching centralized recommendations:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load recommendations'
      }));
    }
  }, [user]);

  // Clear cache when recommendations are regenerated
  const invalidateCache = useCallback(() => {
    cachedRecommendations = null;
    lastFetchTime = null;
    fetchRecommendations(true);
  }, [fetchRecommendations]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Subscribe to real-time updates for this user's recommendations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('recommendations-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'career_recommendations',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('New career recommendation detected, refreshing...');
          invalidateCache();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, invalidateCache]);

  return {
    ...state,
    refresh: () => fetchRecommendations(true),
    invalidateCache
  };
};
