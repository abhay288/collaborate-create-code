import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface VerifiedScholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  deadline: string | null;
  eligibility_summary: string;
  apply_url: string;
  source_url: string;
  source: string;
  official_domain: string;
  status: string;
  target_academic_level: string[] | null;
  target_locations: string[] | null;
  category_criteria: string[] | null;
  income_criteria: string | null;
  minimum_percentage: number | null;
  required_documents: string[];
  youtube_tutorial_url: string | null;
  youtube_tutorial_title: string | null;
  youtube_tutorial_channel: string | null;
  verified_at: string | null;
  created_at: string;
}

interface UserProfile {
  preferred_state: string | null;
  preferred_district: string | null;
  education_level: string | null;
  current_study_level: string | null;
  current_course: string | null;
  target_course_interest: string[] | null;
  class_level: string | null;
}

interface FilterResult {
  scholarships: VerifiedScholarship[];
  isFiltered: boolean;
  matchCount: number;
}

// Map education levels to academic levels for matching
const educationToAcademicLevel: Record<string, string[]> = {
  '10th': ['10th', 'High School', 'Secondary', 'Class 10', 'Matriculation', 'SSC', 'SSLC', 'Class 9', 'Class 1-5', 'Class 6-8'],
  '12th': ['12th', 'Higher Secondary', 'Intermediate', 'Class 12', '+2', 'HSC', 'Pre-University', 'Class 11'],
  'UG': ['Undergraduate', 'UG', 'Bachelor', 'Graduation', 'Graduate', 'B.Tech', 'B.Sc', 'B.Com', 'BA', 'BBA', 'BCA'],
  'PG': ['Postgraduate', 'PG', 'Master', 'Post-Graduation', 'M.Tech', 'M.Sc', 'M.Com', 'MA', 'MBA', 'MCA'],
  'Diploma': ['Diploma', 'Certificate', 'ITI', 'Polytechnic'],
  'PhD': ['PhD', 'Doctoral', 'Research', 'Doctorate'],
};

// State name variations for matching
const stateVariations: Record<string, string[]> = {
  'uttar pradesh': ['up', 'uttar pradesh'],
  'madhya pradesh': ['mp', 'madhya pradesh'],
  'andhra pradesh': ['ap', 'andhra pradesh'],
  'arunachal pradesh': ['arunachal pradesh'],
  'himachal pradesh': ['hp', 'himachal pradesh'],
  'tamil nadu': ['tn', 'tamil nadu', 'tamilnadu'],
  'west bengal': ['wb', 'west bengal'],
  'jammu and kashmir': ['jk', 'jammu kashmir', 'jammu and kashmir'],
};

export const useVerifiedScholarships = () => {
  const [scholarships, setScholarships] = useState<VerifiedScholarship[]>([]);
  const [allScholarships, setAllScholarships] = useState<VerifiedScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch user profile for personalized filtering
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_state, preferred_district, education_level, current_study_level, current_course, target_course_interest, class_level')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, [user?.id]);

  // Normalize state name for comparison
  const normalizeState = useCallback((state: string): string => {
    const normalized = state?.toLowerCase().trim() || '';
    for (const [key, variations] of Object.entries(stateVariations)) {
      if (variations.some(v => normalized.includes(v) || v.includes(normalized))) {
        return key;
      }
    }
    return normalized;
  }, []);

  // Check if scholarship matches user's education level
  const matchesEducationLevel = useCallback((
    scholarship: VerifiedScholarship,
    profile: UserProfile | null
  ): boolean => {
    if (!profile?.education_level && !profile?.current_study_level && !profile?.class_level) return true;
    if (!scholarship.target_academic_level || scholarship.target_academic_level.length === 0) return true;

    const userLevel = profile.current_study_level || profile.education_level || profile.class_level || '';
    const matchLevels = educationToAcademicLevel[userLevel] || [userLevel];

    // Check if any of the scholarship's target levels match user's level
    return scholarship.target_academic_level.some(targetLevel => {
      const normalizedTarget = targetLevel?.toLowerCase().trim() || '';
      return matchLevels.some(ml => 
        normalizedTarget.includes(ml.toLowerCase()) || 
        ml.toLowerCase().includes(normalizedTarget)
      );
    });
  }, []);

  // Check if scholarship matches user's location (state/district)
  const matchesLocation = useCallback((
    scholarship: VerifiedScholarship,
    profile: UserProfile | null
  ): { matches: boolean; reason?: string } => {
    if (!profile?.preferred_state) return { matches: true };
    if (!scholarship.target_locations || scholarship.target_locations.length === 0) return { matches: true };

    const userState = normalizeState(profile.preferred_state);
    
    // Check for national scholarships (available to all)
    const isNational = scholarship.target_locations.some(loc => {
      const normalizedLoc = loc?.toLowerCase().trim() || '';
      return normalizedLoc === 'all' || 
             normalizedLoc === 'india' || 
             normalizedLoc === 'national' ||
             normalizedLoc === 'pan india' ||
             normalizedLoc === 'all india';
    });
    
    if (isNational) return { matches: true, reason: 'National scholarship' };

    // Check if user's state is in target locations
    const stateMatch = scholarship.target_locations.some(loc => {
      const normalizedLoc = normalizeState(loc);
      return normalizedLoc === userState || 
             userState.includes(normalizedLoc) || 
             normalizedLoc.includes(userState);
    });

    if (stateMatch) return { matches: true, reason: `Available in ${profile.preferred_state}` };
    
    return { matches: false };
  }, [normalizeState]);

  // Check if scholarship matches category criteria
  const matchesCategory = useCallback((
    scholarship: VerifiedScholarship
  ): boolean => {
    // If no category criteria, it's open to all
    if (!scholarship.category_criteria || scholarship.category_criteria.length === 0) return true;
    
    // Check for general category scholarships
    const isGeneral = scholarship.category_criteria.some(cat => {
      const normalizedCat = cat?.toLowerCase().trim() || '';
      return normalizedCat === 'all' || 
             normalizedCat === 'general' || 
             normalizedCat === 'open';
    });
    
    return isGeneral; // For now, return true for general; later can match user's category
  }, []);

  // Filter scholarships based on user profile with scoring
  const filterScholarshipsForUser = useCallback((
    allScholarships: VerifiedScholarship[],
    profile: UserProfile | null,
    returnAllIfEmpty: boolean = true
  ): FilterResult => {
    if (!profile) return { scholarships: allScholarships, isFiltered: false, matchCount: allScholarships.length };

    // Score and filter scholarships
    const scoredScholarships = allScholarships.map(scholarship => {
      const educationMatch = matchesEducationLevel(scholarship, profile);
      const locationResult = matchesLocation(scholarship, profile);
      const categoryMatch = matchesCategory(scholarship);
      
      // Calculate relevance score
      let score = 0;
      if (educationMatch) score += 40;
      if (locationResult.matches) score += 35;
      if (categoryMatch) score += 25;
      
      // Bonus for active scholarships
      if (scholarship.deadline) {
        const daysLeft = Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0 && daysLeft <= 30) score += 10; // Urgent bonus
      }
      
      return {
        scholarship,
        score,
        matches: educationMatch && locationResult.matches && categoryMatch,
        matchReason: locationResult.reason
      };
    });

    // Filter matching scholarships and sort by score
    const matchedScholarships = scoredScholarships
      .filter(s => s.matches)
      .sort((a, b) => b.score - a.score)
      .map(s => s.scholarship);

    // CRITICAL FALLBACK: If no matches found, return all scholarships
    if (matchedScholarships.length === 0 && returnAllIfEmpty) {
      return { 
        scholarships: allScholarships.sort((a, b) => {
          // Sort by deadline (urgent first)
          if (a.deadline && b.deadline) {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          }
          return 0;
        }), 
        isFiltered: false, 
        matchCount: 0 
      };
    }

    return { 
      scholarships: matchedScholarships, 
      isFiltered: true, 
      matchCount: matchedScholarships.length 
    };
  }, [matchesEducationLevel, matchesLocation, matchesCategory]);

  const fetchScholarships = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch user profile first
      const profile = await fetchUserProfile();
      setUserProfile(profile);

      // Fetch all open scholarships
      const { data, error } = await supabase
        .from('verified_scholarships')
        .select('*')
        .eq('status', 'open')
        .order('deadline', { ascending: true, nullsFirst: false });

      if (error) throw error;

      // Filter valid scholarships (must have name and apply_url)
      const validScholarships = (data || []).filter(s => 
        s.name && s.apply_url && s.status === 'open'
      ) as VerifiedScholarship[];

      setAllScholarships(validScholarships);
      setLastUpdated(new Date());

      // Filter based on user profile with fallback
      const result = filterScholarshipsForUser(validScholarships, profile);
      setScholarships(result.scholarships);
      setIsPersonalized(result.isFiltered);
      setMatchCount(result.matchCount);

    } catch (error) {
      console.error('Error fetching scholarships:', error);
      toast({
        title: "Error",
        description: "Failed to load scholarships. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, fetchUserProfile, filterScholarshipsForUser]);

  // Get all scholarships without filtering (for browse mode)
  const getAllScholarships = useCallback(() => {
    return allScholarships;
  }, [allScholarships]);

  // Get personalized scholarships (filtered by profile)
  const getPersonalizedScholarships = useCallback(() => {
    return filterScholarshipsForUser(allScholarships, userProfile).scholarships;
  }, [allScholarships, userProfile, filterScholarshipsForUser]);

  // Re-filter when profile changes
  const refreshFilters = useCallback(() => {
    const result = filterScholarshipsForUser(allScholarships, userProfile);
    setScholarships(result.scholarships);
    setIsPersonalized(result.isFiltered);
    setMatchCount(result.matchCount);
  }, [allScholarships, userProfile, filterScholarshipsForUser]);

  // Toggle between personalized and all scholarships
  const togglePersonalized = useCallback((showPersonalized: boolean) => {
    if (showPersonalized) {
      const result = filterScholarshipsForUser(allScholarships, userProfile);
      setScholarships(result.scholarships);
      setIsPersonalized(result.isFiltered);
      setMatchCount(result.matchCount);
    } else {
      setScholarships(allScholarships);
      setIsPersonalized(false);
      setMatchCount(allScholarships.length);
    }
  }, [allScholarships, userProfile, filterScholarshipsForUser]);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  return { 
    scholarships, 
    allScholarships,
    loading,
    userProfile,
    lastUpdated,
    isPersonalized,
    matchCount,
    totalCount: allScholarships.length,
    refetch: fetchScholarships,
    getAllScholarships,
    getPersonalizedScholarships,
    refreshFilters,
    togglePersonalized
  };
};
