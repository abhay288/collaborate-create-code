import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { safeParseCollege } from '@/lib/validation';
import { logError } from '@/lib/errorHandling';

export const useColleges = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        
        // First get total count
        const { count: totalCount } = await supabase
          .from('colleges')
          .select('*', { count: 'exact', head: true });
        
        console.log(`[useColleges] Total colleges in database: ${totalCount}`);
        setTotalCount(totalCount || 0);
        
        // Fetch ALL colleges without pagination
        // The RLS policy filters to is_active = true automatically
        const { data, error } = await supabase
          .from('colleges')
          .select('*')
          .order('rating', { ascending: false, nullsFirst: false });

        if (error) {
          logError(error, 'fetchColleges');
          throw error;
        }
        
        console.log(`[useColleges] Fetched ${data?.length || 0} colleges`);
        
        // Safely parse all colleges with fallback handling
        // safeParseCollege returns null for invalid colleges (no name, etc.)
        const safeData = (data || [])
          .map(safeParseCollege)
          .filter((c): c is NonNullable<typeof c> => c !== null);
        
        console.log(`[useColleges] After parsing: ${safeData.length} valid colleges`);
          
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

  return { colleges, loading, totalCount };
};
