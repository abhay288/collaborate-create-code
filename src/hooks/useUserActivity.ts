import { supabase } from '@/integrations/supabase/client';

export const useUserActivity = () => {
  const trackActivity = async (activityType: string, activityData?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_activity').insert({
        user_id: user.id,
        activity_type: activityType,
        activity_data: activityData || {}
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const getActivityHistory = async (limit: number = 50) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  };

  return {
    trackActivity,
    getActivityHistory,
  };
};
