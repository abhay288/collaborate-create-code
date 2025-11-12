import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AptitudeProfile {
  user_id: string;
  skills: {
    logical: number;
    verbal: number;
    quantitative: number;
    creative: number;
    technical: number;
    interpersonal: number;
  };
  interests: string[];
  preferred_locations: string[];
  academic_level: 'UG' | 'PG' | 'Diploma';
  score_percentile_or_band: number;
  user_location?: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
  };
  max_distance_km?: number;
}

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  eligibility_summary: string;
  amount: string;
  deadline: string;
  apply_url: string;
  official_domain: string;
  required_documents: string[];
  youtube_tutorial: {
    title: string;
    channel: string;
    url: string;
    publish_date: string;
  };
  last_checked: string;
  confidence_score: number;
  match_reason: string;
  eligibility_uncertain?: boolean;
}

interface College {
  id: string;
  name: string;
  course: string;
  city: string;
  state: string;
  district?: string;
  approx_fees: string;
  admission_link: string;
  cutoff_info: string;
  ranking_source: string;
  last_checked: string;
  description?: string;
  confidence_score: number;
  match_reason: string;
  distance_km?: number | null;
}

interface Job {
  id: string;
  role: string;
  company: string;
  location: string;
  salary_range: string;
  apply_url: string;
  posting_date: string;
  source_site: string;
  last_checked: string;
  required_skills?: string[];
  confidence_score: number;
  match_reason: string;
}

interface OpportunityResponse {
  meta: {
    timestamp: string;
    profile_id: string;
    sources: string[];
  };
  recommendations: {
    colleges: College[];
    scholarships: Scholarship[];
    jobs: Job[];
  };
  explanations: string[];
  errors: any[];
}

export const useOpportunityMapping = () => {
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<OpportunityResponse | null>(null);
  const { toast } = useToast();

  const mapOpportunities = async (profile: AptitudeProfile) => {
    setLoading(true);
    try {
      console.log('Mapping opportunities for profile:', profile);

      const { data, error } = await supabase.functions.invoke('map-opportunities', {
        body: { profile }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setOpportunities(data);
      
      toast({
        title: "Opportunities Mapped Successfully",
        description: `Found ${data.recommendations.colleges.length} colleges, ${data.recommendations.scholarships.length} scholarships, and ${data.recommendations.jobs.length} jobs`,
      });

      return data;
    } catch (error) {
      console.error('Error mapping opportunities:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to map opportunities",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    opportunities,
    mapOpportunities,
  };
};
