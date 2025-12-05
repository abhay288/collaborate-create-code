import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Stream to college type mapping
const STREAM_COLLEGE_MAPPING: Record<string, string[]> = {
  'Computer Science': [
    'Engineering & Technology', 'BCA', 'BCA AND BBA', 'IT', 'Computer', 
    'Information Technology', 'Software', 'Data Science', 'AI', 'Cyber'
  ],
  'Medical': [
    'Medical-Allopathy', 'Medical-Ayurveda', 'BUMS', 'BHMS', 'BDS', 'MBBS',
    'Para Medical', 'Nursing', 'Pharmacy', 'B.Pharm', 'D.Pharm', 'Paramedical',
    'Nursing and Paramedical', 'Medical', 'Health', 'Physiotherapy'
  ],
  'Commerce': [
    'Commerce', 'Management', 'BBA', 'B.Com', 'MBA', 'Finance', 'Accounting',
    'Business', 'Commerce and management', 'COMMERCE SCIENCE'
  ],
  'Arts': [
    'Arts', 'Humanities', 'Social Sciences', 'Fine Arts', 'Visual Arts',
    'Music', 'Dance', 'Literature', 'Social Work', 'Design', 'GAYAN', 'BADAN'
  ],
  'Science': [
    'Science', 'Physics', 'Chemistry', 'Biology', 'Biotechnology', 'Microbiology',
    'Agriculture', 'Horticulture', 'Food Technology', 'Fisheries'
  ],
  'Engineering': [
    'Engineering & Technology', 'B.Tech', 'Architecture', 'Mechanical',
    'Electrical', 'Civil', 'Electronics', 'Chemical'
  ],
};

// Future course mapping based on current education
const FUTURE_COURSE_MAPPING: Record<string, { courses: string[]; collegeTypes: string[] }> = {
  // 12th Science (PCM)
  '12th_science_pcm': {
    courses: ['B.Tech CSE', 'B.Tech IT', 'B.Tech AI/ML', 'B.Tech Electronics', 'BCA', 'B.Sc Physics', 'B.Sc Mathematics', 'B.Arch'],
    collegeTypes: ['Engineering & Technology', 'BCA', 'Science', 'Architecture']
  },
  // 12th Science (PCB)
  '12th_science_pcb': {
    courses: ['MBBS', 'BDS', 'BAMS', 'BHMS', 'B.Pharm', 'Nursing', 'BPT', 'B.Sc Nursing', 'Paramedical'],
    collegeTypes: ['Medical-Allopathy', 'Medical-Ayurveda', 'BUMS', 'BHMS', 'Para Medical', 'Nursing', 'Pharmacy', 'Nursing and Paramedical']
  },
  // 12th Commerce
  '12th_commerce': {
    courses: ['B.Com', 'BBA', 'CA Foundation', 'CS Foundation', 'B.Com Honours', 'BBA Finance'],
    collegeTypes: ['Commerce', 'Management', 'BBA', 'Commerce and management']
  },
  // 12th Arts
  '12th_arts': {
    courses: ['BA', 'BA Honours', 'BJMC', 'BSW', 'BFA', 'B.Des', 'BA LLB'],
    collegeTypes: ['Arts', 'Humanities', 'Social Sciences', 'Fine Arts', 'Visual Arts', 'Social Work']
  },
  // Diploma CS/IT
  'diploma_cs': {
    courses: ['B.Tech CSE (Lateral Entry)', 'B.Tech IT (Lateral Entry)', 'BCA', 'B.Sc CS'],
    collegeTypes: ['Engineering & Technology', 'BCA', 'IT', 'Computer']
  },
  // Diploma Engineering
  'diploma_engineering': {
    courses: ['B.Tech (Lateral Entry)', 'B.E. (Lateral Entry)'],
    collegeTypes: ['Engineering & Technology', 'Architecture']
  },
  // UG Computer Science
  'ug_cs': {
    courses: ['M.Tech CSE', 'MCA', 'M.Sc CS', 'MBA (IT)', 'MS (Abroad)'],
    collegeTypes: ['Engineering & Technology', 'Management', 'Science']
  },
  // UG Medical/Biology
  'ug_medical': {
    courses: ['MD', 'MS', 'M.Sc Nursing', 'M.Pharm', 'MPT', 'PhD'],
    collegeTypes: ['Medical-Allopathy', 'Medical-Ayurveda', 'Para Medical', 'Nursing']
  },
  // UG Commerce
  'ug_commerce': {
    courses: ['MBA', 'M.Com', 'CA Final', 'CS Professional', 'CMA'],
    collegeTypes: ['Management', 'Commerce']
  },
  // UG Arts
  'ug_arts': {
    courses: ['MA', 'MSW', 'MFA', 'M.Des', 'LLB', 'LLM'],
    collegeTypes: ['Arts', 'Social Sciences', 'Fine Arts', 'Humanities']
  },
  // UG Science
  'ug_science': {
    courses: ['M.Sc', 'M.Tech', 'MBA', 'PhD'],
    collegeTypes: ['Science', 'Engineering & Technology', 'Management']
  },
};

// Nearby states mapping
const NEARBY_STATES_MAP: Record<string, string[]> = {
  'Andhra Pradesh': ['Telangana', 'Karnataka', 'Tamil Nadu', 'Odisha', 'Chhattisgarh'],
  'Arunachal Pradesh': ['Assam', 'Nagaland'],
  'Assam': ['Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Meghalaya', 'West Bengal'],
  'Bihar': ['Uttar Pradesh', 'Jharkhand', 'West Bengal'],
  'Chhattisgarh': ['Madhya Pradesh', 'Maharashtra', 'Odisha', 'Jharkhand', 'Telangana', 'Andhra Pradesh'],
  'Delhi': ['Haryana', 'Uttar Pradesh', 'Rajasthan'],
  'Goa': ['Maharashtra', 'Karnataka'],
  'Gujarat': ['Maharashtra', 'Rajasthan', 'Madhya Pradesh'],
  'Haryana': ['Delhi', 'Punjab', 'Himachal Pradesh', 'Uttar Pradesh', 'Rajasthan'],
  'Himachal Pradesh': ['Punjab', 'Haryana', 'Uttarakhand', 'Jammu and Kashmir'],
  'Jharkhand': ['Bihar', 'West Bengal', 'Odisha', 'Chhattisgarh', 'Uttar Pradesh'],
  'Karnataka': ['Maharashtra', 'Goa', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana'],
  'Kerala': ['Karnataka', 'Tamil Nadu'],
  'Madhya Pradesh': ['Uttar Pradesh', 'Rajasthan', 'Gujarat', 'Maharashtra', 'Chhattisgarh'],
  'Maharashtra': ['Gujarat', 'Madhya Pradesh', 'Chhattisgarh', 'Telangana', 'Karnataka', 'Goa'],
  'Manipur': ['Assam', 'Nagaland', 'Mizoram'],
  'Meghalaya': ['Assam'],
  'Mizoram': ['Assam', 'Manipur', 'Tripura'],
  'Nagaland': ['Assam', 'Arunachal Pradesh', 'Manipur'],
  'Odisha': ['West Bengal', 'Jharkhand', 'Chhattisgarh', 'Andhra Pradesh'],
  'Punjab': ['Haryana', 'Himachal Pradesh', 'Rajasthan', 'Jammu and Kashmir'],
  'Rajasthan': ['Gujarat', 'Madhya Pradesh', 'Uttar Pradesh', 'Haryana', 'Punjab'],
  'Sikkim': ['West Bengal'],
  'Tamil Nadu': ['Kerala', 'Karnataka', 'Andhra Pradesh', 'Puducherry'],
  'Telangana': ['Maharashtra', 'Chhattisgarh', 'Karnataka', 'Andhra Pradesh'],
  'Tripura': ['Assam', 'Mizoram'],
  'Uttar Pradesh': ['Delhi', 'Haryana', 'Rajasthan', 'Madhya Pradesh', 'Chhattisgarh', 'Bihar', 'Jharkhand', 'Uttarakhand'],
  'Uttarakhand': ['Himachal Pradesh', 'Uttar Pradesh'],
  'West Bengal': ['Bihar', 'Jharkhand', 'Odisha', 'Sikkim', 'Assam'],
  'Jammu and Kashmir': ['Himachal Pradesh', 'Punjab', 'Ladakh'],
  'Ladakh': ['Jammu and Kashmir', 'Himachal Pradesh'],
  'Puducherry': ['Tamil Nadu'],
};

export interface RecommendedCollege {
  id: string;
  college_name: string;
  state: string;
  district: string;
  specialised_in: string;
  college_type: string;
  rating: number | null;
  fees: number | null;
  website: string | null;
  admission_link: string | null;
  courses_offered: string[];
  confidence_score: number;
  match_reason: string;
  is_user_state: boolean;
}

export interface FutureCourse {
  name: string;
  description: string;
  entranceExams: string[];
  collegeTypes: string[];
}

interface Profile {
  id: string;
  preferred_state: string | null;
  preferred_district: string | null;
  current_study_level: string | null;
  current_course: string | null;
  study_area: string | null;
  class_level: string | null;
  target_course_interest: string[] | null;
  logical_score: number | null;
  numerical_score: number | null;
  technical_score: number | null;
  creative_score: number | null;
  verbal_score: number | null;
  overall_score: number | null;
}

// Determine user's stream from profile
const determineUserStream = (profile: Profile): string => {
  const currentCourse = profile.current_course?.toLowerCase() || '';
  const studyArea = profile.study_area?.toLowerCase() || '';
  const targetCourses = profile.target_course_interest || [];
  
  // Check current course keywords
  if (currentCourse.includes('cse') || currentCourse.includes('computer') || 
      currentCourse.includes('it') || currentCourse.includes('bca') ||
      currentCourse.includes('software') || currentCourse.includes('data')) {
    return 'Computer Science';
  }
  
  if (currentCourse.includes('pcb') || currentCourse.includes('medical') ||
      currentCourse.includes('mbbs') || currentCourse.includes('nursing') ||
      currentCourse.includes('pharmacy') || currentCourse.includes('biology')) {
    return 'Medical';
  }
  
  if (currentCourse.includes('commerce') || currentCourse.includes('bba') ||
      currentCourse.includes('bcom') || currentCourse.includes('ca')) {
    return 'Commerce';
  }
  
  if (currentCourse.includes('arts') || currentCourse.includes('humanities') ||
      currentCourse.includes('ba ') || currentCourse.includes('design')) {
    return 'Arts';
  }
  
  if (currentCourse.includes('pcm') || currentCourse.includes('engineering') ||
      currentCourse.includes('btech') || currentCourse.includes('b.tech')) {
    return 'Engineering';
  }
  
  // Check study area
  if (studyArea === 'science') {
    // Check aptitude to differentiate CS vs Medical
    if ((profile.technical_score || 0) > (profile.creative_score || 0)) {
      return 'Engineering';
    }
    return 'Science';
  }
  
  if (studyArea === 'commerce') return 'Commerce';
  if (studyArea === 'arts') return 'Arts';
  
  // Default based on target courses
  for (const target of targetCourses) {
    const t = target.toLowerCase();
    if (t.includes('tech') || t.includes('computer') || t.includes('it')) return 'Computer Science';
    if (t.includes('medical') || t.includes('mbbs') || t.includes('nursing')) return 'Medical';
    if (t.includes('commerce') || t.includes('bba')) return 'Commerce';
    if (t.includes('arts') || t.includes('design')) return 'Arts';
  }
  
  return 'Science'; // Default
};

// Determine education level key for future course mapping
const getEducationLevelKey = (profile: Profile, stream: string): string => {
  const level = profile.current_study_level?.toLowerCase() || '';
  const classLevel = profile.class_level?.toLowerCase() || '';
  const currentCourse = profile.current_course?.toLowerCase() || '';
  
  // Check if 12th class
  if (level.includes('12') || classLevel.includes('12') || level.includes('intermediate')) {
    if (stream === 'Computer Science' || stream === 'Engineering' || currentCourse.includes('pcm')) {
      return '12th_science_pcm';
    }
    if (stream === 'Medical' || currentCourse.includes('pcb') || currentCourse.includes('biology')) {
      return '12th_science_pcb';
    }
    if (stream === 'Commerce') return '12th_commerce';
    if (stream === 'Arts') return '12th_arts';
    return '12th_science_pcm'; // Default for science
  }
  
  // Diploma
  if (level.includes('diploma')) {
    if (stream === 'Computer Science' || currentCourse.includes('cs') || currentCourse.includes('it')) {
      return 'diploma_cs';
    }
    return 'diploma_engineering';
  }
  
  // UG level
  if (level.includes('ug') || level.includes('undergraduate') || level.includes('bachelor') ||
      classLevel.includes('ug') || currentCourse.includes('b.tech') || currentCourse.includes('btech')) {
    if (stream === 'Computer Science') return 'ug_cs';
    if (stream === 'Medical') return 'ug_medical';
    if (stream === 'Commerce') return 'ug_commerce';
    if (stream === 'Arts') return 'ug_arts';
    return 'ug_science';
  }
  
  // Default to 12th science PCM
  return '12th_science_pcm';
};

// Calculate recommendation score
const calculateRecommendationScore = (
  college: any,
  profile: Profile,
  userStream: string,
  isUserState: boolean,
  isUserDistrict: boolean
): { score: number; reason: string } => {
  let score = 0;
  const reasons: string[] = [];
  
  // Location match (30% weight)
  if (isUserDistrict) {
    score += 30;
    reasons.push('Located in your district');
  } else if (isUserState) {
    score += 25;
    reasons.push('Located in your state');
  } else {
    score += 10;
    reasons.push('Nearby state');
  }
  
  // Stream match (45% weight)
  const specialization = college.specialised_in?.toLowerCase() || '';
  const streamKeywords = STREAM_COLLEGE_MAPPING[userStream] || [];
  const streamMatch = streamKeywords.some(keyword => 
    specialization.includes(keyword.toLowerCase())
  );
  
  if (streamMatch) {
    score += 45;
    reasons.push(`Specializes in ${userStream}`);
  } else {
    score += 15;
  }
  
  // Rating bonus (15% weight)
  if (college.rating) {
    const ratingScore = Math.min(15, (college.rating / 5) * 15);
    score += ratingScore;
    if (college.rating >= 4) {
      reasons.push(`High rating: ${college.rating.toFixed(1)}`);
    }
  }
  
  // Aptitude alignment (10% weight)
  const aptitudeScore = profile.overall_score || 0;
  if (aptitudeScore > 70) {
    score += 10;
  } else if (aptitudeScore > 50) {
    score += 7;
  } else {
    score += 3;
  }
  
  return {
    score: Math.min(100, Math.round(score)),
    reason: reasons.slice(0, 2).join(' • ') || 'General recommendation'
  };
};

export const useStreamBasedRecommendations = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [colleges, setColleges] = useState<RecommendedCollege[]>([]);
  const [futureCourses, setFutureCourses] = useState<FutureCourse[]>([]);
  const [userStream, setUserStream] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      if (!profileData) {
        setError('Profile not found');
        return;
      }
      
      setProfile(profileData);
      
      // Determine user stream
      const stream = determineUserStream(profileData);
      setUserStream(stream);
      
      console.log('[StreamRecommendations] User stream:', stream);
      console.log('[StreamRecommendations] Profile:', profileData);
      
      // Get stream-specific college types to search for
      const streamCollegeTypes = STREAM_COLLEGE_MAPPING[stream] || [];
      
      // Determine location filters
      const userState = profileData.preferred_state;
      const userDistrict = profileData.preferred_district;
      const nearbyStates = userState ? (NEARBY_STATES_MAP[userState] || []) : [];
      const allStates = userState ? [userState, ...nearbyStates] : [];
      
      console.log('[StreamRecommendations] Filtering by state:', userState);
      console.log('[StreamRecommendations] College types:', streamCollegeTypes);
      
      // Build query for colleges
      let query = supabase
        .from('colleges')
        .select('*')
        .eq('is_active', true);
      
      // Filter by state if available
      if (allStates.length > 0) {
        query = query.in('state', allStates);
      }
      
      const { data: collegesData, error: collegesError } = await query
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(100);
      
      if (collegesError) throw collegesError;
      
      // Filter and score colleges
      const scoredColleges: RecommendedCollege[] = (collegesData || [])
        .filter(college => {
          // Check if college matches stream
          const specialization = college.specialised_in?.toLowerCase() || '';
          const matchesStream = streamCollegeTypes.some(type => 
            specialization.includes(type.toLowerCase())
          );
          
          // Also check college_type for broader matches
          const collegeType = college.college_type?.toLowerCase() || '';
          const matchesType = streamCollegeTypes.some(type =>
            collegeType.includes(type.toLowerCase())
          );
          
          return matchesStream || matchesType;
        })
        .map(college => {
          const isUserState = college.state === userState;
          const isUserDistrict = college.district === userDistrict && isUserState;
          
          const { score, reason } = calculateRecommendationScore(
            college,
            profileData,
            stream,
            isUserState,
            isUserDistrict
          );
          
          return {
            id: college.id,
            college_name: college.college_name || 'Unknown College',
            state: college.state || 'Unknown',
            district: college.district || 'Unknown',
            specialised_in: college.specialised_in || '',
            college_type: college.college_type || '',
            rating: college.rating,
            fees: college.fees,
            website: college.website,
            admission_link: college.admission_link,
            courses_offered: college.courses_offered || [],
            confidence_score: score,
            match_reason: reason,
            is_user_state: isUserState
          };
        })
        .sort((a, b) => {
          // Priority: user state first, then by score
          if (a.is_user_state && !b.is_user_state) return -1;
          if (!a.is_user_state && b.is_user_state) return 1;
          return b.confidence_score - a.confidence_score;
        });
      
      console.log('[StreamRecommendations] Filtered colleges:', scoredColleges.length);
      
      // If no stream-specific colleges, get general colleges
      if (scoredColleges.length === 0 && collegesData && collegesData.length > 0) {
        const fallbackColleges = collegesData.slice(0, 20).map(college => {
          const isUserState = college.state === userState;
          return {
            id: college.id,
            college_name: college.college_name || 'Unknown College',
            state: college.state || 'Unknown',
            district: college.district || 'Unknown',
            specialised_in: college.specialised_in || '',
            college_type: college.college_type || '',
            rating: college.rating,
            fees: college.fees,
            website: college.website,
            admission_link: college.admission_link,
            courses_offered: college.courses_offered || [],
            confidence_score: 60,
            match_reason: 'Top-rated college in your area',
            is_user_state: isUserState
          };
        });
        setColleges(fallbackColleges);
      } else {
        setColleges(scoredColleges.slice(0, 15));
      }
      
      // Generate future course recommendations
      const educationKey = getEducationLevelKey(profileData, stream);
      const futureMapping = FUTURE_COURSE_MAPPING[educationKey];
      
      if (futureMapping) {
        const currentCourse = profileData.current_course?.toLowerCase() || '';
        
        // Filter out current course from recommendations
        const filteredCourses = futureMapping.courses.filter(course => 
          !currentCourse.includes(course.toLowerCase().split(' ')[0])
        );
        
        const futureCourseRecs: FutureCourse[] = filteredCourses.map(course => ({
          name: course,
          description: getFutureCourseDescription(course),
          entranceExams: getEntranceExams(course),
          collegeTypes: futureMapping.collegeTypes
        }));
        
        setFutureCourses(futureCourseRecs);
      }
      
    } catch (err) {
      console.error('[StreamRecommendations] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return {
    profile,
    colleges,
    futureCourses,
    userStream,
    loading,
    error,
    refresh: loadRecommendations
  };
};

// Helper functions
function getFutureCourseDescription(course: string): string {
  const descriptions: Record<string, string> = {
    'B.Tech CSE': 'Bachelor of Technology in Computer Science - 4 year program focusing on software development and computing',
    'B.Tech IT': 'Bachelor of Technology in Information Technology - 4 year program for IT professionals',
    'B.Tech AI/ML': 'Specialized engineering degree in Artificial Intelligence and Machine Learning',
    'BCA': 'Bachelor of Computer Applications - 3 year undergraduate program in computer science',
    'MBBS': 'Bachelor of Medicine and Bachelor of Surgery - 5.5 year medical degree',
    'BDS': 'Bachelor of Dental Surgery - 5 year dental degree',
    'BAMS': 'Bachelor of Ayurvedic Medicine and Surgery - 5.5 year Ayurvedic medicine degree',
    'B.Pharm': 'Bachelor of Pharmacy - 4 year pharmaceutical science degree',
    'Nursing': 'B.Sc Nursing - 4 year nursing degree program',
    'B.Com': 'Bachelor of Commerce - 3 year commerce undergraduate program',
    'BBA': 'Bachelor of Business Administration - 3 year management program',
    'BA': 'Bachelor of Arts - 3 year arts undergraduate program',
    'M.Tech CSE': 'Master of Technology in Computer Science - 2 year postgraduate engineering',
    'MCA': 'Master of Computer Applications - 2 year postgraduate program',
    'MBA': 'Master of Business Administration - 2 year management postgraduate',
    'MBA (IT)': 'MBA with IT specialization for tech management roles',
  };
  return descriptions[course] || `${course} - Higher education program for career advancement`;
}

function getEntranceExams(course: string): string[] {
  const exams: Record<string, string[]> = {
    'B.Tech CSE': ['JEE Main', 'JEE Advanced', 'State CETs'],
    'B.Tech IT': ['JEE Main', 'JEE Advanced', 'State CETs'],
    'B.Tech AI/ML': ['JEE Main', 'JEE Advanced'],
    'BCA': ['IPU CET', 'CUET', 'University entrance'],
    'MBBS': ['NEET UG'],
    'BDS': ['NEET UG'],
    'BAMS': ['NEET UG'],
    'B.Pharm': ['GPAT', 'State pharmacy exams'],
    'Nursing': ['NEET UG', 'State nursing exams'],
    'B.Com': ['CUET', 'DU JAT', 'University entrance'],
    'BBA': ['IPMAT', 'CUET', 'SET'],
    'BA': ['CUET', 'University entrance'],
    'M.Tech CSE': ['GATE'],
    'MCA': ['NIMCET', 'TANCET', 'MAH MCA CET'],
    'MBA': ['CAT', 'XAT', 'MAT', 'GMAT'],
    'MBA (IT)': ['CAT', 'XAT', 'MAT'],
  };
  return exams[course] || ['University entrance exam'];
}

export default useStreamBasedRecommendations;
