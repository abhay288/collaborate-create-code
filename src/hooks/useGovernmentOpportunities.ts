import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GovJob {
  id: string;
  title: string;
  department: string | null;
  category: string | null;
  notification_date: string | null;
  last_date: string | null;
  total_posts: string | null;
  qualification: string | null;
  age_limit: string | null;
  application_fee: string | null;
  eligibility: string | null;
  selection_process: string | null;
  apply_link: string | null;
  notification_link: string | null;
  detail_page_url: string | null;
  youtube_guide: string | null;
  source: string;
  is_active: boolean;
  created_at: string;
}

export interface GovAdmission {
  id: string;
  title: string;
  authority: string | null;
  category: string | null;
  notification_date: string | null;
  last_date: string | null;
  eligibility: string | null;
  application_fee: string | null;
  age_limit: string | null;
  selection_process: string | null;
  apply_link: string | null;
  notification_link: string | null;
  detail_page_url: string | null;
  youtube_guide: string | null;
  source: string;
  is_active: boolean;
  created_at: string;
}

export interface GovAdmitCard {
  id: string;
  title: string;
  department: string | null;
  exam_date: string | null;
  admit_card_date: string | null;
  download_link: string | null;
  detail_page_url: string | null;
  status: string;
  source: string;
  is_active: boolean;
  created_at: string;
}

interface GovOpportunitiesState {
  jobs: GovJob[];
  admissions: GovAdmission[];
  admitCards: GovAdmitCard[];
  loading: boolean;
  lastUpdated: string | null;
  totalCount: number;
}

export const useGovernmentOpportunities = () => {
  const [state, setState] = useState<GovOpportunitiesState>({
    jobs: [],
    admissions: [],
    admitCards: [],
    loading: true,
    lastUpdated: null,
    totalCount: 0
  });
  const { toast } = useToast();
  const hasTriggeredAutoRefresh = useRef(false);

  const fetchOpportunities = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      // Fetch all data in parallel
      const [jobsRes, admissionsRes, admitCardsRes] = await Promise.all([
        supabase
          .from('gov_jobs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('gov_admissions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('gov_admit_cards')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      const jobs = (jobsRes.data || []) as GovJob[];
      const admissions = (admissionsRes.data || []) as GovAdmission[];
      const admitCards = (admitCardsRes.data || []) as GovAdmitCard[];
      const totalCount = jobs.length + admissions.length + admitCards.length;

      console.log(`[GovOpportunities] Fetched: ${jobs.length} jobs, ${admissions.length} admissions, ${admitCards.length} admit cards`);

      setState({
        jobs,
        admissions,
        admitCards,
        loading: false,
        lastUpdated: new Date().toISOString(),
        totalCount
      });

      return { jobs, admissions, admitCards, totalCount };

    } catch (error) {
      console.error('Error fetching government opportunities:', error);
      toast({
        title: "Error",
        description: "Failed to load government opportunities",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, loading: false }));
      return null;
    }
  }, [toast]);

  const refreshData = useCallback(async () => {
    try {
      console.log('[GovOpportunities] Refreshing data from source...');
      
      // Call edge function to refresh from source
      const { data, error } = await supabase.functions.invoke('fetch-government-opportunities', {
        body: { action: 'refresh' }
      });

      if (error) throw error;

      console.log('[GovOpportunities] Refresh response:', data);

      toast({
        title: "Data Refreshed",
        description: `Updated: ${data?.stats?.jobs || 0} jobs, ${data?.stats?.admissions || 0} admissions, ${data?.stats?.admitCards || 0} admit cards`
      });

      // Fetch the updated data
      await fetchOpportunities();
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh government opportunities. Please try again.",
        variant: "destructive"
      });
    }
  }, [fetchOpportunities, toast]);

  // Auto-refresh if data is empty (first time load)
  const autoRefreshIfEmpty = useCallback(async () => {
    if (hasTriggeredAutoRefresh.current) return;
    
    const result = await fetchOpportunities();
    
    if (result && result.totalCount === 0) {
      console.log('[GovOpportunities] No data found, auto-refreshing...');
      hasTriggeredAutoRefresh.current = true;
      await refreshData();
    }
  }, [fetchOpportunities, refreshData]);

  useEffect(() => {
    autoRefreshIfEmpty();
  }, [autoRefreshIfEmpty]);

  return {
    ...state,
    refetch: fetchOpportunities,
    refreshData
  };
};

export default useGovernmentOpportunities;
