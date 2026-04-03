import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface QuizEligibility {
  canTakeQuiz: boolean;
  reason: string;
  lastAttemptDate: Date | null;
  nextAvailableDate: Date | null;
  hasCompletedQuizThisYear: boolean;
}

export const useQuizEligibility = () => {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState<QuizEligibility>({
    canTakeQuiz: true,
    reason: '',
    lastAttemptDate: null,
    nextAvailableDate: null,
    hasCompletedQuizThisYear: false
  });
  const [loading, setLoading] = useState(true);

  const checkEligibility = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get all completed quiz sessions for the user
      const { data: sessions, error } = await supabase
        .from('quiz_sessions')
        .select('id, completed_at, completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        // First time user - can take quiz
        setEligibility({
          canTakeQuiz: true,
          reason: 'Welcome! Take your first aptitude quiz.',
          lastAttemptDate: null,
          nextAvailableDate: null,
          hasCompletedQuizThisYear: false
        });
        return;
      }

      const latestSession = sessions[0];
      const lastAttemptDate = latestSession.completed_at 
        ? new Date(latestSession.completed_at) 
        : null;

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth(); // 0 = January

      // Check if the last attempt was in the current year
      const lastAttemptYear = lastAttemptDate?.getFullYear() || 0;
      const hasCompletedQuizThisYear = lastAttemptYear === currentYear;

      // Quiz resets every January
      // User can take quiz if:
      // 1. They haven't taken it this year
      // 2. OR it's a new year (January) and their last attempt was last year
      const isJanuary = currentMonth === 0;
      const canRetakeInNewYear = isJanuary && lastAttemptYear < currentYear;

      if (!hasCompletedQuizThisYear || canRetakeInNewYear) {
        setEligibility({
          canTakeQuiz: true,
          reason: isJanuary && canRetakeInNewYear 
            ? 'New year! You can retake your annual aptitude assessment.'
            : 'Take your annual aptitude quiz.',
          lastAttemptDate,
          nextAvailableDate: null,
          hasCompletedQuizThisYear: false
        });
      } else {
        // Calculate next January
        const nextJanuary = new Date(currentYear + 1, 0, 1);
        
        setEligibility({
          canTakeQuiz: false,
          reason: `You've already completed your quiz this year. Next available: January ${currentYear + 1}`,
          lastAttemptDate,
          nextAvailableDate: nextJanuary,
          hasCompletedQuizThisYear: true
        });
      }
    } catch (error) {
      console.error('Error checking quiz eligibility:', error);
      // On error, allow quiz to prevent blocking users
      setEligibility({
        canTakeQuiz: true,
        reason: 'Take your aptitude quiz.',
        lastAttemptDate: null,
        nextAvailableDate: null,
        hasCompletedQuizThisYear: false
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkEligibility();
  }, [checkEligibility]);

  return {
    ...eligibility,
    loading,
    refetch: checkEligibility
  };
};
