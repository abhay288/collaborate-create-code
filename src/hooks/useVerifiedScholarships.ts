import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useVerifiedScholarships = () => {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('verified_scholarships')
          .select('*')
          .eq('status', 'open')
          .order('deadline', { ascending: true, nullsFirst: false });

        if (error) throw error;
        setScholarships(data || []);
      } catch (error) {
        console.error('Error fetching scholarships:', error);
        toast({
          title: "Error",
          description: "Failed to load scholarships",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, [toast]);

  return { scholarships, loading };
};
