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

// Normalize string for comparison (trim, lowercase, handle nulls)
const normalizeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return String(value);
  return value.trim();
};

// Title case for display
const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const useColleges = (options: UseCollegesOptions = {}) => {
  const { pageSize = 50, filters = {} } = options;
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  // Filter dropdown options
  const [states, setStates] = useState<string[]>(['All']);
  const [districts, setDistricts] = useState<string[]>(['All']);
  const [collegeTypes, setCollegeTypes] = useState<string[]>(['All']);

  // Fetch ALL distinct states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        console.log('[useColleges] Fetching all distinct states...');
        
        // Fetch all states from the database
        const { data: stateData, error: stateError } = await supabase
          .from('colleges')
          .select('state')
          .eq('is_active', true)
          .not('state', 'is', null);
        
        if (stateError) {
          console.error('[useColleges] Error fetching states:', stateError);
          return;
        }
        
        if (stateData) {
          // Extract, normalize, dedupe, and sort states
          const allStates = stateData
            .map(d => normalizeString(d.state))
            .filter(s => s && s.toLowerCase() !== 'unknown' && s.length > 0);
          
          const uniqueStates = [...new Set(allStates)]
            .map(s => toTitleCase(s))
            .sort((a, b) => a.localeCompare(b));
          
          console.log('[useColleges] Found unique states:', uniqueStates.length);
          setStates(['All', ...uniqueStates]);
        }

        // Fetch distinct college types
        const { data: typeData, error: typeError } = await supabase
          .from('colleges')
          .select('college_type')
          .eq('is_active', true)
          .not('college_type', 'is', null);
        
        if (typeError) {
          console.error('[useColleges] Error fetching types:', typeError);
          return;
        }
        
        if (typeData) {
          const allTypes = typeData
            .map(d => normalizeString(d.college_type))
            .filter(t => t && t.length > 0);
          
          const uniqueTypes = [...new Set(allTypes)]
            .map(t => toTitleCase(t))
            .sort((a, b) => a.localeCompare(b));
          
          console.log('[useColleges] Found unique college types:', uniqueTypes.length);
          setCollegeTypes(['All', ...uniqueTypes]);
        }
      } catch (error) {
        logError(error, 'fetchStates');
      }
    };

    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        console.log('[useColleges] Fetching districts for state:', filters.state);
        
        // Reset districts when state changes
        if (!filters.state || filters.state === 'All') {
          // Fetch all districts when no state is selected
          const { data: districtData, error } = await supabase
            .from('colleges')
            .select('district')
            .eq('is_active', true)
            .not('district', 'is', null);
          
          if (error) {
            console.error('[useColleges] Error fetching districts:', error);
            return;
          }
          
          if (districtData) {
            const allDistricts = districtData
              .map(d => normalizeString(d.district))
              .filter(d => d && d.length > 0);
            
            const uniqueDistricts = [...new Set(allDistricts)]
              .map(d => toTitleCase(d))
              .sort((a, b) => a.localeCompare(b));
            
            console.log('[useColleges] Found all districts:', uniqueDistricts.length);
            setDistricts(['All', ...uniqueDistricts]);
          }
          return;
        }

        // Fetch districts for selected state using case-insensitive matching
        const { data: districtData, error } = await supabase
          .from('colleges')
          .select('district, state')
          .eq('is_active', true)
          .not('district', 'is', null);
        
        if (error) {
          console.error('[useColleges] Error fetching districts:', error);
          return;
        }
        
        if (districtData) {
          // Filter districts client-side for case-insensitive state matching
          const selectedStateNorm = filters.state.toLowerCase().trim();
          
          const matchingDistricts = districtData
            .filter(d => {
              const stateNorm = normalizeString(d.state).toLowerCase();
              return stateNorm === selectedStateNorm;
            })
            .map(d => normalizeString(d.district))
            .filter(d => d && d.length > 0);
          
          const uniqueDistricts = [...new Set(matchingDistricts)]
            .map(d => toTitleCase(d))
            .sort((a, b) => a.localeCompare(b));
          
          console.log('[useColleges] Found districts for state:', uniqueDistricts.length);
          setDistricts(['All', ...uniqueDistricts]);
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
      .select(countOnly ? '*' : '*', { count: 'exact', head: countOnly })
      .eq('is_active', true);

    // Apply state filter with case-insensitive matching using ilike
    if (filters.state && filters.state !== 'All') {
      // Use exact match after normalizing both sides
      query = query.ilike('state', filters.state.trim());
    }

    // Apply district filter
    if (filters.district && filters.district !== 'All') {
      query = query.ilike('district', filters.district.trim());
    }

    // Apply college type filter
    if (filters.college_type && filters.college_type !== 'All') {
      query = query.ilike('college_type', filters.college_type.trim());
    }

    // Apply course filter (array contains)
    if (filters.course && filters.course !== 'All') {
      query = query.contains('courses_offered', [filters.course]);
    }

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(`college_name.ilike.${searchTerm},location.ilike.${searchTerm},district.ilike.${searchTerm},state.ilike.${searchTerm}`);
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
      const { count, error: countError } = await buildQuery(true);
      
      if (countError) {
        console.error('[useColleges] Error getting count:', countError);
      }
      
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

      // Parse colleges safely with normalization
      const safeData = (data || [])
        .map(college => {
          const parsed = safeParseCollege(college);
          if (parsed) {
            // Normalize state and district for display
            return {
              ...parsed,
              state: toTitleCase(normalizeString(parsed.state)),
              district: parsed.district ? toTitleCase(normalizeString(parsed.district)) : null
            };
          }
          return null;
        })
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