import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: string;
  message: string;
  data?: any;
  created_at: string;
}

export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('user-activity-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activity'
        },
        (payload) => {
          const newActivity = payload.new;
          
          // Show toast notification for important activities
          if (newActivity.activity_type === 'career_recommendation_generated') {
            toast({
              title: "New Recommendations!",
              description: "Your career recommendations are ready to view.",
            });
          }

          // Add to notifications list
          setNotifications(prev => [{
            id: newActivity.id,
            type: newActivity.activity_type,
            message: getActivityMessage(newActivity.activity_type),
            data: newActivity.activity_data,
            created_at: newActivity.created_at
          }, ...prev].slice(0, 10)); // Keep last 10 notifications
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const getActivityMessage = (activityType: string): string => {
    const messages: Record<string, string> = {
      'quiz_started': 'Quiz session started',
      'quiz_completed': 'Quiz completed successfully',
      'career_recommendation_generated': 'Career recommendations generated',
      'career_viewed': 'Career details viewed',
      'college_viewed': 'College information viewed',
      'scholarship_viewed': 'Scholarship details viewed',
      'favorite_added': 'Item added to favorites',
    };
    return messages[activityType] || 'New activity';
  };

  return {
    notifications,
  };
};
