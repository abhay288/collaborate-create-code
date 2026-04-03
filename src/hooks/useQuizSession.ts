import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizQuestion {
  id: string;
  question_text: string;
  category: string;
  options: { text: string; isCorrect: boolean }[];
}

interface QuizSession {
  id: string;
  user_id: string;
  started_at: string;
  completed: boolean;
}

interface QuizResponse {
  question_id: string;
  selected_option: string;
  category: string;
  isCorrect: boolean;
}

export const useQuizSession = () => {
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);

  const startNewSession = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentSession(data);
      return data;
    } catch (error) {
      console.error('Error starting quiz session:', error);
      toast.error('Failed to start quiz session');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveResponse = async (
    sessionId: string,
    questionId: string,
    selectedOption: string,
    pointsEarned: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First check if response already exists
      const { data: existingResponse } = await supabase
        .from('quiz_responses')
        .select('id')
        .eq('user_id', user.id)
        .eq('quiz_session_id', sessionId)
        .eq('question_id', questionId)
        .maybeSingle();

      if (existingResponse) {
        // Update existing response
        const { error } = await supabase
          .from('quiz_responses')
          .update({
            selected_option: selectedOption,
            points_earned: pointsEarned
          })
          .eq('id', existingResponse.id);

        if (error) throw error;
      } else {
        // Insert new response
        const { error } = await supabase
          .from('quiz_responses')
          .insert({
            user_id: user.id,
            quiz_session_id: sessionId,
            question_id: questionId,
            selected_option: selectedOption,
            points_earned: pointsEarned
          });

        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving response:', error);
      throw error;
    }
  };

  const getSessionResponses = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('quiz_responses')
        .select('*')
        .eq('quiz_session_id', sessionId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting session responses:', error);
      return [];
    }
  };

  const completeSession = async (sessionId: string, score: number) => {
    try {
      const { error } = await supabase
        .from('quiz_sessions')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          score
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error completing session:', error);
      throw error;
    }
  };

  return {
    loading,
    currentSession,
    startNewSession,
    saveResponse,
    getSessionResponses,
    completeSession
  };
};
