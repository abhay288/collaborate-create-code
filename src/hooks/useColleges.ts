import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { safeParseCollege } from '@/lib/validation';
import { logError } from '@/lib/errorHandling';

interface CollegeFilters {
  state?: string;
  district?: string;
  college_type?: string;
  course?: string;
  search?: string;
  sortBy?: 'rating' | 'fees-low' | 'fees-high' | 'name';
}

interface UseCollegesOptions {
  pageSize?: number;
  filters?: CollegeFilters;
}

export const useColleges = (options: UseCollegesOptions = {}) => {
  const { pageSize = 50, filters = {} } = options;
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  // Fetch distinct states for filter dropdown
  const [states, setStates] = useState<string[]>(['All']);
  const [districts, setDistricts] = useState<string[]>(['All']);
  const [collegeTypes, setCollegeTypes] = useState<string[]>(['All']);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch distinct states
        const { data: stateData } = await supabase
          .from('colleges')
          .select('state')
          .not('state', 'is', null)
          .neq('state', '')
          .order('state');
        
        if (stateData) {
          const uniqueStates = [...new Set(stateData.map(d => d.state).filter(Boolean))];
          setStates(['All', ...uniqueStates.sort()]);
        }

        // Fetch distinct college types
        const { data: typeData } = await supabase
          .from('colleges')
          .select('college_type')
          .not('college_type', 'is', null)
          .neq('college_type', '');
        
        if (typeData) {
          const uniqueTypes = [...new Set(typeData.map(d => d.college_type).filter(Boolean))];
          setCollegeTypes(['All', ...uniqueTypes.sort()]);
        }
      } catch (error) {
        logError(error, 'fetchFilterOptions');
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        let query = supabase
          .from('colleges')
          .select('district')
          .not('district', 'is', null)
          .neq('district', '');

        if (filters.state && filters.state !== 'All') {
          query = query.ilike('state', filters.state);
        }

        const { data: districtData } = await query;
        
        if (districtData) {
          const uniqueDistricts = [...new Set(districtData.map(d => d.district).filter(Boolean))];
          setDistricts(['All', ...uniqueDistricts.sort()]);
        }
      } catch (error) {
        logError(error, 'fetchDistricts');
      }
    };

    fetchDistricts();
  }, [filters.state]);

  // Build the query with filters
  const buildQuery = useCallback((countOnly = false) => {
    let query = supabase
      .from('colleges')
      .select(countOnly ? '*' : '*', { count: 'exact', head: countOnly });

    // Apply filters with case-insensitive matching
    if (filters.state && filters.state !== 'All') {
      query = query.ilike('state', filters.state);
    }

    if (filters.district && filters.district !== 'All') {
      query = query.ilike('district', filters.district);
    }

    if (filters.college_type && filters.college_type !== 'All') {
      query = query.ilike('college_type', filters.college_type);
    }

    if (filters.course && filters.course !== 'All') {
      query = query.contains('courses_offered', [filters.course]);
    }

    if (filters.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(`college_name.ilike.${searchTerm},location.ilike.${searchTerm},district.ilike.${searchTerm}`);
    }

    return query;
  }, [filters]);

  // Fetch colleges with pagination
  const fetchColleges = useCallback(async (pageNum: number, append = false) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Get total count first
      const { count } = await buildQuery(true);
      setTotalCount(count || 0);
      console.log(`[useColleges] Total matching colleges: ${count}`);

      // Fetch paginated data
      let query = buildQuery(false);

      // Apply sorting
      switch (filters.sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false, nullsFirst: false });
          break;
        case 'fees-low':
          query = query.order('fees', { ascending: true, nullsFirst: false });
          break;
        case 'fees-high':
          query = query.order('fees', { ascending: false, nullsFirst: false });
          break;
        case 'name':
          query = query.order('college_name', { ascending: true, nullsFirst: false });
          break;
        default:
          query = query.order('rating', { ascending: false, nullsFirst: false });
      }

      // Apply pagination
      const from = pageNum * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        logError(error, 'fetchColleges');
        throw error;
      }

      console.log(`[useColleges] Fetched ${data?.length || 0} colleges for page ${pageNum}`);

      // Parse colleges safely
      const safeData = (data || [])
        .map(safeParseCollege)
        .filter((c): c is NonNullable<typeof c> => c !== null);

      console.log(`[useColleges] After parsing: ${safeData.length} valid colleges`);

      if (append) {
        setColleges(prev => [...prev, ...safeData]);
      } else {
        setColleges(safeData);
      }

      // Check if there are more results
      const totalFetched = append ? colleges.length + safeData.length : safeData.length;
      setHasMore(totalFetched < (count || 0));

    } catch (error) {
      logError(error, 'useColleges');
      toast({
        title: "Error",
        description: "Failed to load colleges. Please try again.",
        variant: "destructive",
      });
      if (!append) {
        setColleges([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQuery, filters.sortBy, pageSize, toast, colleges.length]);

  // Reset and fetch when filters change
  useEffect(() => {
    setPage(0);
    setColleges([]);
    fetchColleges(0, false);
  }, [filters.state, filters.district, filters.college_type, filters.course, filters.search, filters.sortBy]);

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchColleges(nextPage, true);
    }
  }, [loadingMore, hasMore, page, fetchColleges]);

  // Refresh function
  const refresh = useCallback(() => {
    setPage(0);
    setColleges([]);
    fetchColleges(0, false);
  }, [fetchColleges]);

  return { 
    colleges, 
    loading, 
    loadingMore,
    totalCount, 
    hasMore,
    loadMore,
    refresh,
    states,
    districts,
    collegeTypes
  };
};
