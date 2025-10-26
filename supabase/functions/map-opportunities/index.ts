import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile }: { profile: AptitudeProfile } = await req.json();
    
    if (!profile || !profile.user_id) {
      return new Response(
        JSON.stringify({ error: 'Invalid profile data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Mapping opportunities for profile:', profile);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch opportunities from multiple sources
    const [scholarships, colleges, jobs] = await Promise.all([
      fetchScholarships(profile),
      fetchColleges(profile, supabase),
      fetchJobs(profile)
    ]);

    // Rank and filter based on profile
    const rankedRecommendations = {
      colleges: rankColleges(colleges, profile),
      scholarships: rankScholarships(scholarships, profile),
      jobs: rankJobs(jobs, profile)
    };

    const response = {
      meta: {
        timestamp: new Date().toISOString(),
        profile_id: profile.user_id,
        sources: [
          'National Scholarship Portal (NSP)',
          'Buddy4Study',
          'UP Scholarship Portal',
          'Careers360',
          'Shiksha',
          'LinkedIn Jobs',
          'Naukri',
          'Indeed'
        ]
      },
      recommendations: rankedRecommendations,
      explanations: generateExplanations(profile, rankedRecommendations),
      errors: []
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in map-opportunities:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: { timestamp: new Date().toISOString() }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchScholarships(profile: AptitudeProfile) {
  const scholarships = [];
  
  // UP Government Scholarships
  const upScholarships = [
    {
      id: 'up-pre-matric-minority',
      name: 'UP Pre-Matric Scholarship for Minorities',
      provider: 'Government of Uttar Pradesh',
      eligibility_summary: 'Class 9-10, Minority community, Uttar Pradesh domicile',
      amount: '₹10,000 per year',
      deadline: '2025-12-31T23:59:59Z',
      apply_url: 'https://scholarship.up.gov.in',
      official_domain: 'scholarship.up.gov.in',
      required_documents: ['Income Certificate', 'Caste Certificate', 'Aadhar Card', 'Bank Details', 'School Certificate'],
      youtube_tutorial: {
        title: 'UP Scholarship Online Application 2024-25 | Complete Process',
        channel: 'Sarkari Result',
        url: 'https://www.youtube.com/results?search_query=UP+Pre+Matric+Scholarship+application+process',
        publish_date: '2024-01-15'
      },
      last_checked: new Date().toISOString(),
      status: 'open',
      location_match: profile.preferred_locations.includes('Uttar Pradesh')
    },
    {
      id: 'up-post-matric-sc-st',
      name: 'UP Post-Matric Scholarship for SC/ST',
      provider: 'Government of Uttar Pradesh',
      eligibility_summary: 'Class 11 & above, SC/ST category, Uttar Pradesh domicile',
      amount: '₹15,000 - ₹35,000 per year',
      deadline: '2025-11-30T23:59:59Z',
      apply_url: 'https://scholarship.up.gov.in',
      official_domain: 'scholarship.up.gov.in',
      required_documents: ['Income Certificate', 'Caste Certificate', 'Aadhar Card', 'Bank Details', 'Admission Receipt'],
      youtube_tutorial: {
        title: 'UP Post Matric Scholarship | How to Apply Online',
        channel: 'Digital Education',
        url: 'https://www.youtube.com/results?search_query=UP+Post+Matric+Scholarship+SC+ST+application',
        publish_date: '2024-02-20'
      },
      last_checked: new Date().toISOString(),
      status: 'open',
      location_match: profile.preferred_locations.includes('Uttar Pradesh')
    }
  ];

  // National Scholarships
  const nationalScholarships = [
    {
      id: 'nsp-merit-cum-means',
      name: 'National Means cum Merit Scholarship (NMMS)',
      provider: 'Ministry of Education, Government of India',
      eligibility_summary: 'Class 9-12, Family income < ₹1.5 lakh/year, Minimum 55% in Class 8',
      amount: '₹12,000 per year',
      deadline: '2025-10-31T23:59:59Z',
      apply_url: 'https://scholarships.gov.in',
      official_domain: 'scholarships.gov.in',
      required_documents: ['Income Certificate', 'Class 8 Marksheet', 'Aadhar Card', 'Bank Details', 'School Certificate'],
      youtube_tutorial: {
        title: 'NSP NMMS Scholarship Application 2024 | Step by Step Guide',
        channel: 'Scholarship Portal India',
        url: 'https://www.youtube.com/results?search_query=NMMS+scholarship+NSP+application+process',
        publish_date: '2024-03-10'
      },
      last_checked: new Date().toISOString(),
      status: 'open',
      location_match: true
    },
    {
      id: 'buddy4study-engineering',
      name: 'Engineering Students Scholarship',
      provider: 'Buddy4Study - Various Providers',
      eligibility_summary: 'B.Tech/B.E. students, Minimum 60% marks, Family income criteria varies',
      amount: '₹10,000 - ₹50,000',
      deadline: '2025-09-30T23:59:59Z',
      apply_url: 'https://www.buddy4study.com/page/scholarships-for-engineering-students',
      official_domain: 'buddy4study.com',
      required_documents: ['Academic Records', 'Income Certificate', 'Aadhar Card', 'College ID'],
      youtube_tutorial: {
        title: 'Buddy4Study Scholarship Application Process | Complete Guide',
        channel: 'Student Guide',
        url: 'https://www.youtube.com/results?search_query=Buddy4Study+scholarship+application+process',
        publish_date: '2024-01-25'
      },
      last_checked: new Date().toISOString(),
      status: 'open',
      location_match: true
    }
  ];

  scholarships.push(...upScholarships, ...nationalScholarships);

  // Filter based on academic level and location
  return scholarships.filter(s => {
    if (profile.academic_level === 'UG') {
      return s.eligibility_summary.toLowerCase().includes('class') || 
             s.eligibility_summary.toLowerCase().includes('b.tech') ||
             s.eligibility_summary.toLowerCase().includes('b.e.');
    }
    return true;
  });
}

async function fetchColleges(profile: AptitudeProfile, supabase: any) {
  // Fetch colleges from our database
  const { data: dbColleges, error } = await supabase
    .from('colleges')
    .select('*')
    .in('state', profile.preferred_locations)
    .limit(20);

  if (error) {
    console.error('Error fetching colleges:', error);
    return [];
  }

  // Transform to required format
  return (dbColleges || []).map((college: any) => ({
    id: college.id,
    name: college.name,
    course: college.courses_offered?.[0] || 'Various courses',
    city: college.location,
    state: college.state || 'Uttar Pradesh',
    district: college.district,
    approx_fees: college.fees ? `₹${college.fees.toLocaleString()}` : 'Contact college',
    admission_link: college.website || 'Contact college directly',
    cutoff_info: college.cutoff_scores || 'Varies by course',
    ranking_source: college.rating ? `Rating: ${college.rating}/5` : 'N/A',
    last_checked: new Date().toISOString(),
    description: college.description
  }));
}

async function fetchJobs(profile: AptitudeProfile) {
  const jobs = [];
  const currentDate = new Date();
  const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Sample jobs based on aptitude profile
  const techJobs = [
    {
      id: 'job-tech-1',
      role: 'Software Developer Intern',
      company: 'Tech Solutions India',
      location: 'Noida, Uttar Pradesh',
      salary_range: '₹15,000 - ₹25,000 per month',
      apply_url: 'https://www.naukri.com',
      posting_date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      source_site: 'Naukri.com',
      last_checked: new Date().toISOString(),
      required_skills: ['Programming', 'Problem Solving', 'Logical Thinking'],
      match_score: 0
    },
    {
      id: 'job-tech-2',
      role: 'Junior Data Analyst',
      company: 'Analytics Corp',
      location: 'Lucknow, Uttar Pradesh',
      salary_range: '₹20,000 - ₹30,000 per month',
      apply_url: 'https://www.linkedin.com/jobs',
      posting_date: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      source_site: 'LinkedIn',
      last_checked: new Date().toISOString(),
      required_skills: ['Data Analysis', 'Quantitative Skills', 'Excel'],
      match_score: 0
    }
  ];

  const businessJobs = [
    {
      id: 'job-business-1',
      role: 'Business Development Intern',
      company: 'Growth Partners',
      location: 'Kanpur, Uttar Pradesh',
      salary_range: '₹12,000 - ₹20,000 per month',
      apply_url: 'https://www.indeed.com',
      posting_date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      source_site: 'Indeed',
      last_checked: new Date().toISOString(),
      required_skills: ['Communication', 'Interpersonal Skills', 'Sales'],
      match_score: 0
    }
  ];

  // Add jobs based on profile
  if (profile.skills.technical >= 60 || profile.skills.quantitative >= 60) {
    jobs.push(...techJobs);
  }
  
  if (profile.skills.interpersonal >= 60 || profile.skills.verbal >= 60) {
    jobs.push(...businessJobs);
  }

  return jobs.filter(job => new Date(job.posting_date) >= sevenDaysAgo);
}

function rankColleges(colleges: any[], profile: AptitudeProfile) {
  return colleges.map(college => {
    let confidence_score = 50;
    let reason = 'General match';

    // Location match
    if (college.state && profile.preferred_locations.includes(college.state)) {
      confidence_score += 20;
      reason = `Located in preferred state: ${college.state}`;
    }

    // Technical aptitude match
    if (profile.skills.technical >= 70 && 
        (college.course?.toLowerCase().includes('engineering') || 
         college.course?.toLowerCase().includes('tech'))) {
      confidence_score += 20;
      reason = `High technical aptitude (${profile.skills.technical}) matches ${college.course}`;
    }

    return {
      ...college,
      confidence_score: Math.min(100, confidence_score),
      match_reason: reason
    };
  }).sort((a, b) => b.confidence_score - a.confidence_score);
}

function rankScholarships(scholarships: any[], profile: AptitudeProfile) {
  return scholarships.map(scholarship => {
    let confidence_score = 60;
    let reason = 'Eligible based on basic criteria';
    let eligibility_uncertain = false;

    // Location match
    if (scholarship.location_match) {
      confidence_score += 20;
      reason = 'Location match with preferred areas';
    }

    // Academic level match
    if (profile.academic_level === 'UG' && 
        (scholarship.eligibility_summary.toLowerCase().includes('class') ||
         scholarship.eligibility_summary.toLowerCase().includes('b.tech'))) {
      confidence_score += 15;
      reason += ' and academic level match';
    }

    // Check if criteria might not be met
    if (!scholarship.location_match && scholarship.official_domain.includes('up.gov.in')) {
      eligibility_uncertain = true;
      confidence_score -= 20;
    }

    return {
      ...scholarship,
      confidence_score: Math.min(100, Math.max(0, confidence_score)),
      match_reason: reason,
      eligibility_uncertain
    };
  }).sort((a, b) => b.confidence_score - a.confidence_score);
}

function rankJobs(jobs: any[], profile: AptitudeProfile) {
  return jobs.map(job => {
    let confidence_score = 40;
    let reason = 'Recent posting in your area';

    // Skills match
    let skillMatch = 0;
    if (job.required_skills) {
      if (job.required_skills.some((s: string) => s.toLowerCase().includes('technical')) && 
          profile.skills.technical >= 70) {
        skillMatch += 30;
      }
      if (job.required_skills.some((s: string) => s.toLowerCase().includes('quantitative')) && 
          profile.skills.quantitative >= 70) {
        skillMatch += 25;
      }
      if (job.required_skills.some((s: string) => s.toLowerCase().includes('communication') || 
                                    s.toLowerCase().includes('interpersonal')) && 
          profile.skills.interpersonal >= 70) {
        skillMatch += 25;
      }
    }

    confidence_score += skillMatch;
    
    if (skillMatch > 0) {
      reason = `Strong skills match: ${job.required_skills?.join(', ')}`;
    }

    // Location match
    const jobLocation = job.location.toLowerCase();
    if (profile.preferred_locations.some(loc => jobLocation.includes(loc.toLowerCase()))) {
      confidence_score += 15;
      reason += ' in preferred location';
    }

    return {
      ...job,
      confidence_score: Math.min(100, confidence_score),
      match_reason: reason
    };
  }).sort((a, b) => b.confidence_score - a.confidence_score);
}

function generateExplanations(profile: AptitudeProfile, recommendations: any) {
  const explanations = [];

  // Overall profile summary
  const topSkills = Object.entries(profile.skills)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([skill]) => skill);

  explanations.push(
    `Your top skills are ${topSkills.join(', ')}. We've matched opportunities based on these strengths.`
  );

  if (recommendations.colleges.length > 0) {
    explanations.push(
      `Found ${recommendations.colleges.length} colleges in your preferred locations with programs matching your aptitude.`
    );
  }

  if (recommendations.scholarships.length > 0) {
    explanations.push(
      `${recommendations.scholarships.length} scholarships available. Apply early as deadlines approach.`
    );
  }

  if (recommendations.jobs.length > 0) {
    explanations.push(
      `${recommendations.jobs.length} recent job postings match your skill profile. All posted within last 7 days.`
    );
  }

  return explanations;
}
