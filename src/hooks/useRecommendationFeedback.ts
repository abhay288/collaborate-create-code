import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type FeedbackType = 'like' | 'dislike' | 'applied' | 'not_interested';
type RecommendationType = 'job' | 'college' | 'scholarship';

interface FeedbackData {
  id: string;
  recommendation_type: RecommendationType;
  recommendation_id: string;
  feedback_type: FeedbackType;
  feedback_data?: any;
}

export const useRecommendationFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<Map<string, FeedbackType>>(new Map());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUserFeedbacks();
  }, []);

  const loadUserFeedbacks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('recommendation_feedback')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const feedbackMap = new Map<string, FeedbackType>();
      data?.forEach((feedback) => {
        const key = `${feedback.recommendation_type}-${feedback.recommendation_id}`;
        feedbackMap.set(key, feedback.feedback_type as FeedbackType);
      });
      
      setFeedbacks(feedbackMap);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    }
  };

  const submitFeedback = async (
    recommendationType: RecommendationType,
    recommendationId: string,
    feedbackType: FeedbackType,
    additionalData?: any
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const key = `${recommendationType}-${recommendationId}`;
      
      // Check if feedback already exists
      const { data: existing } = await supabase
        .from('recommendation_feedback')
        .select('id')
        .eq('user_id', user.id)
        .eq('recommendation_type', recommendationType)
        .eq('recommendation_id', recommendationId)
        .single();

      if (existing) {
        // Update existing feedback
        const { error } = await supabase
          .from('recommendation_feedback')
          .update({
            feedback_type: feedbackType,
            feedback_data: additionalData || {},
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new feedback
        const { error } = await supabase
          .from('recommendation_feedback')
          .insert({
            user_id: user.id,
            recommendation_type: recommendationType,
            recommendation_id: recommendationId,
            feedback_type: feedbackType,
            feedback_data: additionalData || {}
          });

        if (error) throw error;
      }

      // Update local state
      setFeedbacks(prev => new Map(prev).set(key, feedbackType));

      toast({
        title: "Feedback saved",
        description: "Thank you for helping us improve recommendations!",
      });

      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to save feedback",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getFeedback = (recommendationType: RecommendationType, recommendationId: string): FeedbackType | undefined => {
    const key = `${recommendationType}-${recommendationId}`;
    return feedbacks.get(key);
  };

  return {
    submitFeedback,
    getFeedback,
    loading,
    reload: loadUserFeedbacks
  };
};
