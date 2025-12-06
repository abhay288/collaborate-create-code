import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Stream to college type mapping (matching actual database values)
const STREAM_COLLEGE_MAPPING: Record<string, string[]> = {
  'Computer Science': [
    'engineering & technology', 'computer application', 'computer', 'technical',
    'it', 'software', 'data science', 'information technology', 'bca', 'mca'
  ],
  'Medical': [
    'medical-allopathy', 'medical-ayurveda', 'medical-homeopathy', 'medical-dental',
    'medical-others', 'nursing', 'pharmacy', 'paramedical', 'physiotherapy', 'health'
  ],
  'Commerce': [
    'commerce', 'management', 'hotel & tourism management', 'finance', 
    'accounting', 'business', 'bba', 'mba'
  ],
  'Arts': [
    'arts', 'fine arts', 'education/teacher education', 'journalism & mass communication',
    'sanskrit', 'oriental learning', 'humanities', 'social work', 'law', 'design'
  ],
  'Science': [
    'science', 'agriculture', 'horticulture', 'food technology', 'fisheries',
    'biotechnology', 'microbiology', 'physics', 'chemistry', 'biology'
  ],
  'Engineering': [
    'engineering & technology', 'technical', 'architecture', 'computer application',
    'mechanical', 'electrical', 'civil', 'electronics'
  ],
};

// Future course recommendations (NO current course duplication)
const FUTURE_COURSE_MAPPING: Record<string, { courses: { code: string; name: string; tags: string[] }[]; collegeTypes: string[] }> = {
  // Class 12 Science (PCM)
  '12th_science_pcm': {
    courses: [
      { code: 'BTECH_CSE', name: 'B.Tech Computer Science', tags: ['technical', 'coding', 'software'] },
      { code: 'BTECH_IT', name: 'B.Tech Information Technology', tags: ['technical', 'it'] },
      { code: 'BTECH_AIML', name: 'B.Tech AI/ML', tags: ['technical', 'ai', 'data'] },
      { code: 'BTECH_ECE', name: 'B.Tech Electronics', tags: ['technical', 'electronics'] },
      { code: 'BCA', name: 'BCA', tags: ['computer', 'programming'] },
      { code: 'BSC_PHY', name: 'B.Sc Physics', tags: ['science', 'physics'] },
      { code: 'BSC_MATH', name: 'B.Sc Mathematics', tags: ['numerical', 'mathematics'] },
      { code: 'BARCH', name: 'B.Arch', tags: ['design', 'creative', 'architecture'] },
    ],
    collegeTypes: ['engineering', 'technology', 'bca', 'science', 'architecture']
  },
  // Class 12 Science (PCB)
  '12th_science_pcb': {
    courses: [
      { code: 'MBBS', name: 'MBBS', tags: ['medical', 'doctor'] },
      { code: 'BDS', name: 'BDS (Dental)', tags: ['medical', 'dental'] },
      { code: 'BAMS', name: 'BAMS (Ayurveda)', tags: ['medical', 'ayurveda'] },
      { code: 'BHMS', name: 'BHMS (Homeopathy)', tags: ['medical', 'homeopathy'] },
      { code: 'BPHARM', name: 'B.Pharm', tags: ['pharmacy', 'medical'] },
      { code: 'BSC_NURSING', name: 'B.Sc Nursing', tags: ['nursing', 'medical'] },
      { code: 'BPT', name: 'BPT (Physiotherapy)', tags: ['physiotherapy', 'medical'] },
      { code: 'PARAMEDICAL', name: 'Paramedical Courses', tags: ['medical', 'paramedical'] },
    ],
    collegeTypes: ['medical', 'allopathy', 'ayurveda', 'pharmacy', 'nursing', 'paramedical']
  },
  // Class 12 Commerce
  '12th_commerce': {
    courses: [
      { code: 'BCOM', name: 'B.Com', tags: ['commerce', 'accounting'] },
      { code: 'BBA', name: 'BBA', tags: ['business', 'management'] },
      { code: 'CA', name: 'CA Foundation', tags: ['accounting', 'finance'] },
      { code: 'CS', name: 'CS Foundation', tags: ['corporate', 'law'] },
      { code: 'BCOM_HONS', name: 'B.Com Honours', tags: ['commerce', 'accounting'] },
      { code: 'BBA_FIN', name: 'BBA Finance', tags: ['business', 'finance'] },
    ],
    collegeTypes: ['commerce', 'management', 'bba']
  },
  // Class 12 Arts
  '12th_arts': {
    courses: [
      { code: 'BA', name: 'BA', tags: ['arts', 'humanities'] },
      { code: 'BA_HONS', name: 'BA Honours', tags: ['arts', 'humanities'] },
      { code: 'BJMC', name: 'BJMC (Journalism)', tags: ['media', 'journalism'] },
      { code: 'BSW', name: 'BSW (Social Work)', tags: ['social', 'welfare'] },
      { code: 'BFA', name: 'BFA (Fine Arts)', tags: ['creative', 'arts'] },
      { code: 'BDES', name: 'B.Des', tags: ['design', 'creative'] },
      { code: 'BALLB', name: 'BA LLB', tags: ['law', 'legal'] },
    ],
    collegeTypes: ['arts', 'humanities', 'social sciences', 'fine arts', 'law']
  },
  // Diploma CS/IT
  'diploma_cs': {
    courses: [
      { code: 'BTECH_LE_CSE', name: 'B.Tech CSE (Lateral Entry)', tags: ['technical', 'coding'] },
      { code: 'BTECH_LE_IT', name: 'B.Tech IT (Lateral Entry)', tags: ['technical', 'it'] },
      { code: 'BCA', name: 'BCA', tags: ['computer', 'programming'] },
      { code: 'BSC_CS', name: 'B.Sc Computer Science', tags: ['computer', 'science'] },
    ],
    collegeTypes: ['engineering', 'technology', 'bca', 'computer']
  },
  // Diploma Engineering (other)
  'diploma_engineering': {
    courses: [
      { code: 'BTECH_LE', name: 'B.Tech (Lateral Entry)', tags: ['engineering', 'technical'] },
      { code: 'BE_LE', name: 'B.E. (Lateral Entry)', tags: ['engineering', 'technical'] },
    ],
    collegeTypes: ['engineering', 'technology']
  },
  // UG Computer Science (B.Tech CSE, BCA, B.Sc CS)
  'ug_cs': {
    courses: [
      { code: 'MTECH_CSE', name: 'M.Tech CSE', tags: ['technical', 'advanced', 'computer'] },
      { code: 'MTECH_AIML', name: 'M.Tech AI/ML', tags: ['technical', 'ai', 'data'] },
      { code: 'MCA', name: 'MCA', tags: ['computer', 'programming'] },
      { code: 'MSC_CS', name: 'M.Sc Computer Science', tags: ['computer', 'science'] },
      { code: 'MBA_IT', name: 'MBA (IT Management)', tags: ['management', 'it'] },
      { code: 'MTECH_CYBER', name: 'M.Tech Cybersecurity', tags: ['security', 'technical'] },
    ],
    collegeTypes: ['engineering', 'technology', 'management']
  },
  // UG Medical/Biology
  'ug_medical': {
    courses: [
      { code: 'MD', name: 'MD (Doctor of Medicine)', tags: ['medical', 'specialist'] },
      { code: 'MS_MED', name: 'MS (Master of Surgery)', tags: ['medical', 'surgery'] },
      { code: 'MSC_NURSING', name: 'M.Sc Nursing', tags: ['nursing', 'medical'] },
      { code: 'MPHARM', name: 'M.Pharm', tags: ['pharmacy', 'medical'] },
      { code: 'MPT', name: 'MPT (Physiotherapy)', tags: ['physiotherapy', 'medical'] },
    ],
    collegeTypes: ['medical', 'allopathy', 'nursing', 'pharmacy']
  },
  // UG Commerce (B.Com, BBA)
  'ug_commerce': {
    courses: [
      { code: 'MBA', name: 'MBA', tags: ['business', 'management'] },
      { code: 'MCOM', name: 'M.Com', tags: ['commerce', 'accounting'] },
      { code: 'CA_FINAL', name: 'CA Final', tags: ['accounting', 'finance'] },
      { code: 'CS_PROF', name: 'CS Professional', tags: ['corporate', 'law'] },
      { code: 'CMA', name: 'CMA', tags: ['cost', 'management'] },
    ],
    collegeTypes: ['management', 'commerce']
  },
  // UG Arts
  'ug_arts': {
    courses: [
      { code: 'MA', name: 'MA', tags: ['arts', 'humanities'] },
      { code: 'MSW', name: 'MSW (Social Work)', tags: ['social', 'welfare'] },
      { code: 'MFA', name: 'MFA (Fine Arts)', tags: ['creative', 'arts'] },
      { code: 'MDES', name: 'M.Des', tags: ['design', 'creative'] },
      { code: 'LLB', name: 'LLB', tags: ['law', 'legal'] },
      { code: 'LLM', name: 'LLM', tags: ['law', 'legal', 'masters'] },
    ],
    collegeTypes: ['arts', 'social sciences', 'fine arts', 'law']
  },
  // UG Science
  'ug_science': {
    courses: [
      { code: 'MSC', name: 'M.Sc', tags: ['science', 'research'] },
      { code: 'MTECH', name: 'M.Tech', tags: ['technology', 'engineering'] },
      { code: 'MBA', name: 'MBA', tags: ['management', 'business'] },
      { code: 'PHD', name: 'PhD', tags: ['research', 'academic'] },
    ],
    collegeTypes: ['science', 'engineering', 'management']
  },
};

// Nearby states mapping for location filtering
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
  matched_course?: string;
}

export interface FutureCourse {
  code: string;
  name: string;
  score: number;
  reason: string;
  tags: string[];
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
  interests: string[] | null;
  logical_score: number | null;
  numerical_score: number | null;
  technical_score: number | null;
  creative_score: number | null;
  verbal_score: number | null;
  overall_score: number | null;
}

// Determine user's stream strictly from profile
const determineUserStream = (profile: Profile): string => {
  const currentCourse = (profile.current_course || '').toLowerCase();
  const studyArea = (profile.study_area || '').toLowerCase();
  const targetCourses = profile.target_course_interest || [];
  
  // CS/IT detection
  if (currentCourse.includes('cse') || currentCourse.includes('computer') || 
      currentCourse.includes(' it') || currentCourse.includes('bca') ||
      currentCourse.includes('software') || currentCourse.includes('data') ||
      currentCourse.includes('information technology') || currentCourse.includes('mca')) {
    return 'Computer Science';
  }
  
  // Medical/PCB detection
  if (currentCourse.includes('pcb') || currentCourse.includes('medical') ||
      currentCourse.includes('mbbs') || currentCourse.includes('nursing') ||
      currentCourse.includes('pharmacy') || currentCourse.includes('biology') ||
      currentCourse.includes('bds') || currentCourse.includes('physiotherapy')) {
    return 'Medical';
  }
  
  // Commerce detection
  if (currentCourse.includes('commerce') || currentCourse.includes('bba') ||
      currentCourse.includes('bcom') || currentCourse.includes('b.com') ||
      currentCourse.includes(' ca ') || currentCourse.includes('accounting')) {
    return 'Commerce';
  }
  
  // Arts detection
  if (currentCourse.includes('arts') || currentCourse.includes('humanities') ||
      currentCourse.includes(' ba ') || currentCourse.includes('design') ||
      currentCourse.includes('law') || currentCourse.includes('llb')) {
    return 'Arts';
  }
  
  // Engineering (non-CS)
  if (currentCourse.includes('engineering') || currentCourse.includes('btech') ||
      currentCourse.includes('b.tech') || currentCourse.includes('mechanical') ||
      currentCourse.includes('electrical') || currentCourse.includes('civil')) {
    // If PCM but not specifically CS
    if (currentCourse.includes('pcm') || studyArea === 'science') {
      return 'Engineering';
    }
    return 'Engineering';
  }
  
  // Study area fallback
  if (studyArea === 'science') {
    const techScore = profile.technical_score || 0;
    const numScore = profile.numerical_score || 0;
    if (techScore >= 60 || numScore >= 60) {
      return 'Engineering';
    }
    return 'Science';
  }
  if (studyArea === 'commerce') return 'Commerce';
  if (studyArea === 'arts') return 'Arts';
  
  // Target courses check
  for (const target of targetCourses) {
    const t = target.toLowerCase();
    if (t.includes('tech') || t.includes('computer') || t.includes('it') || t.includes('cse')) return 'Computer Science';
    if (t.includes('medical') || t.includes('mbbs') || t.includes('nursing') || t.includes('pharmacy')) return 'Medical';
    if (t.includes('commerce') || t.includes('bba') || t.includes('mba')) return 'Commerce';
    if (t.includes('arts') || t.includes('design') || t.includes('law')) return 'Arts';
  }
  
  return 'Science'; // Default
};

// Determine education level key for future course mapping
const getEducationLevelKey = (profile: Profile, stream: string): string => {
  const level = (profile.current_study_level || '').toLowerCase();
  const classLevel = (profile.class_level || '').toLowerCase();
  const currentCourse = (profile.current_course || '').toLowerCase();
  
  // 12th Class
  if (level.includes('12') || classLevel.includes('12') || level.includes('intermediate') || level.includes('hsc')) {
    if (stream === 'Computer Science' || stream === 'Engineering' || currentCourse.includes('pcm')) {
      return '12th_science_pcm';
    }
    if (stream === 'Medical' || currentCourse.includes('pcb') || currentCourse.includes('biology')) {
      return '12th_science_pcb';
    }
    if (stream === 'Commerce') return '12th_commerce';
    if (stream === 'Arts') return '12th_arts';
    return '12th_science_pcm';
  }
  
  // Diploma
  if (level.includes('diploma') || currentCourse.includes('diploma')) {
    if (stream === 'Computer Science' || currentCourse.includes('cs') || currentCourse.includes(' it')) {
      return 'diploma_cs';
    }
    return 'diploma_engineering';
  }
  
  // UG level
  if (level.includes('ug') || level.includes('undergraduate') || level.includes('bachelor') ||
      classLevel.includes('ug') || currentCourse.includes('b.tech') || currentCourse.includes('btech') ||
      currentCourse.includes('bca') || currentCourse.includes('bsc') || currentCourse.includes('bcom')) {
    if (stream === 'Computer Science') return 'ug_cs';
    if (stream === 'Medical') return 'ug_medical';
    if (stream === 'Commerce') return 'ug_commerce';
    if (stream === 'Arts') return 'ug_arts';
    return 'ug_science';
  }
  
  // PG level (suggest PhD or further specializations)
  if (level.includes('pg') || level.includes('postgraduate') || level.includes('master')) {
    return 'ug_science'; // Will suggest PhD-level courses
  }
  
  // 10th class - suggest diploma or 12th
  if (level.includes('10') || classLevel.includes('10')) {
    return '12th_science_pcm'; // Default to science stream
  }
  
  return '12th_science_pcm'; // Default
};

/**
 * Calculate match score using the formula:
 * finalScore = (0.45 * aptitudeScoreMatch) + (0.30 * courseInterestMatch) + (0.15 * stateDistrictMatch) + (0.10 * streamMatch)
 */
const calculateRecommendationScore = (
  college: any,
  profile: Profile,
  userStream: string,
  isUserState: boolean,
  isUserDistrict: boolean
): { score: number; reason: string } => {
  const reasons: string[] = [];
  
  // 1. Aptitude Score Match (45% weight) - based on dominant skills
  let aptitudeMatch = 0;
  const techScore = profile.technical_score || 0;
  const numScore = profile.numerical_score || 0;
  const logicalScore = profile.logical_score || 0;
  const verbalScore = profile.verbal_score || 0;
  const creativeScore = profile.creative_score || 0;
  
  // Map stream to required skills
  if (userStream === 'Computer Science' || userStream === 'Engineering') {
    aptitudeMatch = (techScore * 0.5 + numScore * 0.3 + logicalScore * 0.2);
  } else if (userStream === 'Medical') {
    aptitudeMatch = (logicalScore * 0.4 + numScore * 0.3 + verbalScore * 0.3);
  } else if (userStream === 'Commerce') {
    aptitudeMatch = (numScore * 0.4 + verbalScore * 0.3 + logicalScore * 0.3);
  } else if (userStream === 'Arts') {
    aptitudeMatch = (creativeScore * 0.4 + verbalScore * 0.4 + logicalScore * 0.2);
  } else {
    aptitudeMatch = (logicalScore + numScore + techScore + verbalScore + creativeScore) / 5;
  }
  
  if (aptitudeMatch >= 70) reasons.push('Strong aptitude match');
  
  // 2. Course Interest Match (30% weight)
  let courseInterestMatch = 30; // Base match
  const targetCourses = profile.target_course_interest || [];
  const collegeSpecialization = (college.specialised_in || '').toLowerCase();
  const collegeCoursesStr = (college.courses_offered || []).join(' ').toLowerCase();
  
  for (const target of targetCourses) {
    if (collegeSpecialization.includes(target.toLowerCase()) || 
        collegeCoursesStr.includes(target.toLowerCase())) {
      courseInterestMatch = 100;
      reasons.push(`Offers ${target}`);
      break;
    }
  }
  
  // 3. State/District Match (15% weight)
  let stateDistrictMatch = 0;
  if (isUserDistrict) {
    stateDistrictMatch = 100;
    reasons.push('In your district');
  } else if (isUserState) {
    stateDistrictMatch = 80;
    reasons.push('In your state');
  } else {
    stateDistrictMatch = 40;
    reasons.push('Nearby state');
  }
  
  // 4. Stream Match (10% weight)
  let streamMatch = 0;
  const streamKeywords = STREAM_COLLEGE_MAPPING[userStream] || [];
  const matchesStream = streamKeywords.some(keyword => 
    collegeSpecialization.includes(keyword) || 
    (college.college_type || '').toLowerCase().includes(keyword)
  );
  
  if (matchesStream) {
    streamMatch = 100;
    reasons.push(`${userStream} specialization`);
  } else {
    streamMatch = 20;
  }
  
  // Rating bonus (additional factor)
  if (college.rating && college.rating >= 4) {
    reasons.push(`Rating: ${college.rating.toFixed(1)}`);
  }
  
  // Calculate final score with weights
  const finalScore = 
    (0.45 * aptitudeMatch) +
    (0.30 * courseInterestMatch) +
    (0.15 * stateDistrictMatch) +
    (0.10 * streamMatch);
  
  return {
    score: Math.min(100, Math.round(finalScore)),
    reason: reasons.slice(0, 3).join(' • ') || 'General recommendation'
  };
};

/**
 * Calculate course recommendation score
 */
const calculateCourseScore = (
  course: { code: string; name: string; tags: string[] },
  profile: Profile
): { score: number; reason: string } => {
  const reasons: string[] = [];
  
  // Aptitude-based scoring
  const techScore = profile.technical_score || 0;
  const numScore = profile.numerical_score || 0;
  const logicalScore = profile.logical_score || 0;
  const verbalScore = profile.verbal_score || 0;
  const creativeScore = profile.creative_score || 0;
  
  let aptitudeMatch = 0;
  const tags = course.tags.join(' ').toLowerCase();
  
  if (tags.includes('technical') || tags.includes('coding') || tags.includes('computer')) {
    aptitudeMatch = (techScore * 0.6 + numScore * 0.3 + logicalScore * 0.1);
    if (techScore >= 70) reasons.push('Strong technical skills');
  } else if (tags.includes('medical') || tags.includes('pharmacy')) {
    aptitudeMatch = (logicalScore * 0.4 + numScore * 0.3 + verbalScore * 0.3);
    if (logicalScore >= 70) reasons.push('Strong logical reasoning');
  } else if (tags.includes('business') || tags.includes('management') || tags.includes('finance')) {
    aptitudeMatch = (verbalScore * 0.4 + numScore * 0.4 + logicalScore * 0.2);
    if (verbalScore >= 70) reasons.push('Strong verbal skills');
  } else if (tags.includes('creative') || tags.includes('design') || tags.includes('arts')) {
    aptitudeMatch = (creativeScore * 0.5 + verbalScore * 0.3 + logicalScore * 0.2);
    if (creativeScore >= 70) reasons.push('Strong creative skills');
  } else {
    aptitudeMatch = (logicalScore + numScore + techScore + verbalScore + creativeScore) / 5;
  }
  
  // Interest match
  const interests = profile.interests || profile.target_course_interest || [];
  let interestMatch = 30;
  for (const interest of interests) {
    if (tags.includes(interest.toLowerCase()) || course.name.toLowerCase().includes(interest.toLowerCase())) {
      interestMatch = 100;
      reasons.push(`Matches your interest in ${interest}`);
      break;
    }
  }
  
  const finalScore = (0.60 * aptitudeMatch) + (0.40 * interestMatch);
  
  return {
    score: Math.min(100, Math.round(finalScore)),
    reason: reasons.join(' • ') || 'Suitable for your profile'
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
        setLoading(false);
        return;
      }
      
      setProfile(profileData);
      
      // Determine user stream
      const stream = determineUserStream(profileData);
      setUserStream(stream);
      
      // Get education level key
      const eduLevelKey = getEducationLevelKey(profileData, stream);
      
      console.log('[StreamRecommendations] User stream:', stream);
      console.log('[StreamRecommendations] Education level key:', eduLevelKey);
      console.log('[StreamRecommendations] Current course:', profileData.current_course);
      
      // Get future courses (excluding current course)
      const futureMapping = FUTURE_COURSE_MAPPING[eduLevelKey];
      if (futureMapping) {
        const currentCourse = (profileData.current_course || '').toLowerCase();
        
        // Filter out current course and score remaining
        const scoredCourses = futureMapping.courses
          .filter(course => {
            const courseLower = course.name.toLowerCase();
            const codeLower = course.code.toLowerCase();
            // Exclude if current course matches
            return !currentCourse.includes(courseLower.split(' ')[0]) &&
                   !currentCourse.includes(codeLower);
          })
          .map(course => {
            const { score, reason } = calculateCourseScore(course, profileData);
            return {
              code: course.code,
              name: course.name,
              score,
              reason,
              tags: course.tags
            };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 7);
        
        setFutureCourses(scoredCourses);
        console.log('[StreamRecommendations] Future courses:', scoredCourses.length);
      }
      
      // Get stream-specific college types
      const streamCollegeTypes = STREAM_COLLEGE_MAPPING[stream] || [];
      
      // Location filters
      const userState = profileData.preferred_state;
      const userDistrict = profileData.preferred_district;
      const nearbyStates = userState ? (NEARBY_STATES_MAP[userState] || []) : [];
      const allStates = userState ? [userState, ...nearbyStates] : [];
      
      console.log('[StreamRecommendations] Filtering by state:', userState);
      console.log('[StreamRecommendations] Stream college types:', streamCollegeTypes);
      
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
        .limit(200);
      
      if (collegesError) throw collegesError;
      
      // Filter and score colleges STRICTLY by stream
      const scoredColleges: RecommendedCollege[] = (collegesData || [])
        .filter(college => {
          const specialization = (college.specialised_in || '').toLowerCase();
          const collegeType = (college.college_type || '').toLowerCase();
          const coursesStr = (college.courses_offered || []).join(' ').toLowerCase();
          
          // STRICT stream matching
          return streamCollegeTypes.some(type => 
            specialization.includes(type) || 
            collegeType.includes(type) ||
            coursesStr.includes(type)
          );
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
          // Priority: user state > user district > score
          if (a.is_user_state && !b.is_user_state) return -1;
          if (!a.is_user_state && b.is_user_state) return 1;
          return b.confidence_score - a.confidence_score;
        })
        .slice(0, 50); // Top 50 recommendations
      
      console.log('[StreamRecommendations] Filtered colleges:', scoredColleges.length);
      setColleges(scoredColleges);
      
    } catch (err) {
      console.error('[StreamRecommendations] Error:', err);
      setError('Failed to load recommendations');
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
    refreshRecommendations: loadRecommendations
  };
};
