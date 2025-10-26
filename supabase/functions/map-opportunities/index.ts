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
      fetchScholarships(profile, supabase),
      fetchColleges(profile, supabase),
      fetchJobs(profile, supabase)
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

async function fetchScholarships(profile: AptitudeProfile, supabase: any) {
  // Fetch verified scholarships from database
  let query = supabase
    .from('verified_scholarships')
    .select('*')
    .eq('status', 'open')
    .gte('deadline', new Date().toISOString());

  // Filter by academic level
  if (profile.academic_level) {
    query = query.contains('target_academic_level', [profile.academic_level]);
  }

  // Filter by locations (prioritize matching locations)
  const { data: allScholarships, error } = await query;

  if (error) {
    console.error('Error fetching scholarships:', error);
    return [];
  }

  // Transform and score scholarships
  return (allScholarships || []).map((scholarship: any) => ({
    id: scholarship.id,
    name: scholarship.name,
    provider: scholarship.provider,
    eligibility_summary: scholarship.eligibility_summary,
    amount: scholarship.amount,
    deadline: scholarship.deadline,
    apply_url: scholarship.apply_url,
    official_domain: scholarship.official_domain,
    required_documents: scholarship.required_documents || [],
    youtube_tutorial: {
      title: scholarship.youtube_tutorial_title || 'Application Tutorial',
      channel: scholarship.youtube_tutorial_channel || 'Official Channel',
      url: scholarship.youtube_tutorial_url || 'https://www.youtube.com',
      publish_date: scholarship.youtube_tutorial_publish_date || new Date().toISOString()
    },
    last_checked: scholarship.last_checked,
    status: scholarship.status,
    location_match: scholarship.target_locations?.some((loc: string) => 
      profile.preferred_locations.some(prefLoc => 
        prefLoc.toLowerCase().includes(loc.toLowerCase()) || 
        loc.toLowerCase() === 'national'
      )
    ) || false
  }));
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

async function fetchJobs(profile: AptitudeProfile, supabase: any) {
  const currentDate = new Date();
  const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Fetch active jobs from last 7 days
  let query = supabase
    .from('verified_jobs')
    .select('*')
    .eq('is_active', true)
    .gte('posting_date', sevenDaysAgo.toISOString())
    .order('posting_date', { ascending: false });

  // Filter by education level if specified
  if (profile.academic_level) {
    query = query.contains('required_education', [profile.academic_level]);
  }

  const { data: jobs, error } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  // Filter by location preference
  return (jobs || []).map((job: any) => ({
    id: job.id,
    role: job.role,
    company: job.company,
    location: job.location,
    salary_range: job.salary_range || 'Competitive',
    apply_url: job.apply_url,
    posting_date: job.posting_date,
    source_site: job.source_site,
    last_checked: job.last_checked,
    required_skills: job.required_skills || [],
    match_score: 0
  }));
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
