import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuizResponse {
  question_id: string;
  category: string;
  selected_option: string;
  isCorrect: boolean;
}

interface CareerRecommendation {
  id: string;
  confidence_score: number;
  careers: {
    id: string;
    title: string;
    description: string;
    requirements: string;
    category: string;
  };
}

export const useCareerRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const { toast } = useToast();

  const generateRecommendations = async (
    quizSessionId: string, 
    responses: QuizResponse[]
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'generate-career-recommendations',
        {
          body: { quizSessionId, responses }
        }
      );

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setRecommendations(data.recommendations);
      
      toast({
        title: "Success!",
        description: "Your career recommendations have been generated.",
      });

      return data;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate recommendations",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async (quizSessionId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('career_recommendations')
        .select(`
          *,
          careers (*)
        `)
        .eq('quiz_session_id', quizSessionId)
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recommendations",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    recommendations,
    generateRecommendations,
    getRecommendations,
  };
};
