import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  quizzesTaken: number;
  recommendationsReceived: number;
  careersExplored: number;
  collegesSaved: number;
  scholarshipsSaved: number;
  recentActivity: Array<{
    date: string;
    activity_type: string;
    count: number;
  }>;
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    quizzesTaken: 0,
    recommendationsReceived: 0,
    careersExplored: 0,
    collegesSaved: 0,
    scholarshipsSaved: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get quiz count
      const { count: quizCount } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true);

      // Get recommendations count
      const { count: recommendationsCount } = await supabase
        .from('career_recommendations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get careers explored (from activity)
      const { count: careersCount } = await supabase
        .from('user_activity')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('activity_type', 'career_viewed');

      // Get saved colleges
      const { count: collegesCount } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('item_type', 'college');

      // Get saved scholarships
      const { count: scholarshipsCount } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('item_type', 'scholarship');

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentActivity } = await supabase
        .from('user_activity')
        .select('activity_type, created_at')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      // Group activity by date
      const activityByDate = (recentActivity || []).reduce((acc: any, activity) => {
        const date = new Date(activity.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = {};
        }
        acc[date][activity.activity_type] = (acc[date][activity.activity_type] || 0) + 1;
        return acc;
      }, {});

      const recentActivityArray = Object.entries(activityByDate).map(([date, activities]: any) => ({
        date,
        ...activities,
        total: Object.values(activities).reduce((sum: number, val: any) => sum + val, 0)
      }));

      setAnalytics({
        quizzesTaken: quizCount || 0,
        recommendationsReceived: recommendationsCount || 0,
        careersExplored: careersCount || 0,
        collegesSaved: collegesCount || 0,
        scholarshipsSaved: scholarshipsCount || 0,
        recentActivity: recentActivityArray,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    reload: loadAnalytics,
  };
};
