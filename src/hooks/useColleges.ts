import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { safeParseCollege } from '@/lib/validation';
import { logError } from '@/lib/errorHandling';

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

        if (error) {
          logError(error, 'fetchColleges');
          throw error;
        }
        
        // Safely parse all colleges
        const safeData = (data || [])
          .map(safeParseCollege)
          .filter(c => c !== null);
          
        setColleges(safeData);
      } catch (error) {
        logError(error, 'useColleges');
        toast({
          title: "Error",
          description: "Failed to load colleges. Please refresh the page.",
          variant: "destructive",
        });
        setColleges([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, [toast]);

  return { colleges, loading };
};
