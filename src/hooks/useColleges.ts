import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useColleges = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('colleges')
          .select('*')
          .order('rating', { ascending: false, nullsFirst: false });

        if (error) throw error;
        setColleges(data || []);
      } catch (error) {
        console.error('Error fetching colleges:', error);
        toast({
          title: "Error",
          description: "Failed to load colleges",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, [toast]);

  return { colleges, loading };
};
