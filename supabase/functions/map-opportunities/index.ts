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
    let confidence_score = 40;
    const matchReasons: string[] = [];

    // Strong location match
    if (college.state && profile.preferred_locations.includes(college.state)) {
      confidence_score += 25;
      matchReasons.push(`Located in ${college.state}`);
    }

    // Course-aptitude alignment
    const courseInfo = college.course?.toLowerCase() || '';
    const coursesOffered = college.courses_offered || [];
    const allCourses = [courseInfo, ...coursesOffered.map((c: string) => c.toLowerCase())].join(' ');

    // Technical/Engineering match
    if ((allCourses.includes('engineering') || allCourses.includes('tech') || 
         allCourses.includes('computer') || allCourses.includes('it')) && 
        profile.skills.technical >= 70) {
      confidence_score += 20;
      matchReasons.push(`Technical programs match your aptitude (${profile.skills.technical}%)`);
    }

    // Science/Quantitative match
    if ((allCourses.includes('science') || allCourses.includes('mathematics') || 
         allCourses.includes('physics') || allCourses.includes('chemistry')) && 
        profile.skills.quantitative >= 70) {
      confidence_score += 15;
      matchReasons.push(`Science programs match your quantitative skills (${profile.skills.quantitative}%)`);
    }

    // Commerce/Business match
    if ((allCourses.includes('commerce') || allCourses.includes('business') || 
         allCourses.includes('management') || allCourses.includes('economics')) && 
        (profile.skills.quantitative >= 60 || profile.skills.interpersonal >= 60)) {
      confidence_score += 15;
      matchReasons.push('Commerce/Business programs match your profile');
    }

    // Arts/Creative match
    if ((allCourses.includes('arts') || allCourses.includes('design') || 
         allCourses.includes('media') || allCourses.includes('humanities')) && 
        profile.skills.creative >= 70) {
      confidence_score += 15;
      matchReasons.push(`Arts programs match your creative aptitude (${profile.skills.creative}%)`);
    }

    // Rating bonus
    if (college.ranking_source && !college.ranking_source.includes('N/A')) {
      const ratingMatch = college.ranking_source.match(/(\d+\.?\d*)/);
      if (ratingMatch) {
        const rating = parseFloat(ratingMatch[1]);
        if (rating >= 4.5) {
          confidence_score += 10;
          matchReasons.push('Highly rated institution');
        } else if (rating >= 4.0) {
          confidence_score += 5;
          matchReasons.push('Well-rated institution');
        }
      }
    }

    const reason = matchReasons.length > 0 
      ? matchReasons.join(' • ') 
      : 'General academic match';

    return {
      ...college,
      confidence_score: Math.min(100, confidence_score),
      match_reason: reason
    };
  }).sort((a, b) => b.confidence_score - a.confidence_score).slice(0, 15); // Top 15 colleges
}

function rankScholarships(scholarships: any[], profile: AptitudeProfile) {
  return scholarships.map(scholarship => {
    let confidence_score = 50;
    const matchReasons: string[] = [];
    let eligibility_uncertain = false;

    // Strong location match
    if (scholarship.location_match) {
      confidence_score += 25;
      matchReasons.push('Matches your location preferences');
    }

    // Check if location-restricted scholarship doesn't match
    const isLocationRestricted = scholarship.target_locations && 
      scholarship.target_locations.length > 0 && 
      !scholarship.target_locations.includes('National');
    
    if (isLocationRestricted && !scholarship.location_match) {
      confidence_score -= 20;
      eligibility_uncertain = true;
      matchReasons.push('⚠️ Location eligibility uncertain - verify before applying');
    }

    // Academic level match
    const eligibilityText = scholarship.eligibility_summary.toLowerCase();
    if (profile.academic_level === 'UG') {
      if (eligibilityText.includes('undergraduate') || eligibilityText.includes('b.tech') ||
          eligibilityText.includes('b.sc') || eligibilityText.includes('b.com') ||
          eligibilityText.includes('b.a') || eligibilityText.includes('graduation')) {
        confidence_score += 20;
        matchReasons.push('Matches UG level requirements');
      }
    } else if (profile.academic_level === 'PG') {
      if (eligibilityText.includes('postgraduate') || eligibilityText.includes('m.tech') ||
          eligibilityText.includes('m.sc') || eligibilityText.includes('m.com') ||
          eligibilityText.includes('m.a') || eligibilityText.includes('masters')) {
        confidence_score += 20;
        matchReasons.push('Matches PG level requirements');
      }
    } else if (profile.academic_level === 'Diploma') {
      if (eligibilityText.includes('diploma') || eligibilityText.includes('polytechnic')) {
        confidence_score += 20;
        matchReasons.push('Matches Diploma requirements');
      }
    }

    // Merit-based scholarship match with high performers
    if (eligibilityText.includes('merit') || eligibilityText.includes('rank')) {
      if (profile.score_percentile_or_band >= 80) {
        confidence_score += 15;
        matchReasons.push('Strong candidate for merit-based scholarship');
      } else if (profile.score_percentile_or_band >= 70) {
        confidence_score += 10;
        matchReasons.push('Eligible for merit-based scholarship');
      } else {
        eligibility_uncertain = true;
        matchReasons.push('Merit criteria may be challenging - verify cutoffs');
      }
    }

    // Amount significance
    const amountText = scholarship.amount.toLowerCase();
    if (amountText.includes('full') || amountText.includes('100%')) {
      confidence_score += 10;
      matchReasons.push('Full scholarship coverage');
    } else if (amountText.includes('50%') || amountText.includes('half')) {
      confidence_score += 5;
      matchReasons.push('Partial scholarship (50%)');
    }

    // Deadline urgency
    const daysUntilDeadline = Math.floor(
      (new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilDeadline <= 7) {
      matchReasons.push(`⏰ Apply soon - ${daysUntilDeadline} days left`);
    } else if (daysUntilDeadline <= 30) {
      matchReasons.push(`${daysUntilDeadline} days until deadline`);
    }

    const reason = matchReasons.length > 0 
      ? matchReasons.join(' • ') 
      : 'General eligibility - verify criteria';

    return {
      ...scholarship,
      confidence_score: Math.min(100, Math.max(0, confidence_score)),
      match_reason: reason,
      eligibility_uncertain,
      days_until_deadline: daysUntilDeadline
    };
  }).sort((a, b) => {
    // Prioritize by confidence, but boost urgent deadlines
    const urgencyBoostA = a.days_until_deadline <= 7 ? 100 : 0;
    const urgencyBoostB = b.days_until_deadline <= 7 ? 100 : 0;
    return (b.confidence_score + urgencyBoostB) - (a.confidence_score + urgencyBoostA);
  }).slice(0, 12); // Top 12 scholarships
}

function rankJobs(jobs: any[], profile: AptitudeProfile) {
  return jobs.map(job => {
    let confidence_score = 30;
    let reason = 'Recent posting (last 7 days)';
    const matchReasons: string[] = [];

    // Comprehensive Skills match with weighted scoring
    let skillMatch = 0;
    const skillKeywords: Record<string, string[]> = {
      technical: ['technical', 'programming', 'coding', 'software', 'developer', 'engineer', 'IT'],
      quantitative: ['quantitative', 'analytical', 'data', 'statistics', 'mathematics', 'analysis'],
      interpersonal: ['communication', 'interpersonal', 'teamwork', 'leadership', 'presentation', 'collaboration'],
      creative: ['creative', 'design', 'innovation', 'problem-solving', 'ideation'],
      logical: ['logical', 'reasoning', 'systematic', 'structured'],
      verbal: ['verbal', 'writing', 'documentation', 'reporting']
    };

    if (job.required_skills && job.required_skills.length > 0) {
      for (const [skillType, keywords] of Object.entries(skillKeywords)) {
        const hasSkill = job.required_skills.some((s: string) => 
          keywords.some(keyword => s.toLowerCase().includes(keyword))
        );
        
        if (hasSkill) {
          const userSkillScore = profile.skills[skillType as keyof typeof profile.skills];
          if (userSkillScore >= 80) {
            skillMatch += 25;
            matchReasons.push(`Excellent ${skillType} skills (${userSkillScore}%)`);
          } else if (userSkillScore >= 70) {
            skillMatch += 20;
            matchReasons.push(`Strong ${skillType} skills (${userSkillScore}%)`);
          } else if (userSkillScore >= 60) {
            skillMatch += 10;
            matchReasons.push(`Good ${skillType} skills (${userSkillScore}%)`);
          }
        }
      }
    }

    confidence_score += Math.min(skillMatch, 50); // Cap skills contribution at 50%

    // Job type match with aptitude
    if (job.job_type) {
      const jobType = job.job_type.toLowerCase();
      if (jobType.includes('technical') && profile.skills.technical >= 70) {
        confidence_score += 15;
        matchReasons.push('Technical role matches your aptitude');
      }
    }

    // Location match
    const jobLocation = job.location.toLowerCase();
    const locationMatch = profile.preferred_locations.some(loc => 
      jobLocation.includes(loc.toLowerCase()) || 
      jobLocation.includes('remote') || 
      jobLocation.includes('work from home')
    );
    
    if (locationMatch) {
      confidence_score += 15;
      matchReasons.push('Preferred location match');
    }

    // Recency bonus (already filtered to 7 days, but newer is better)
    const daysSincePosting = Math.floor(
      (new Date().getTime() - new Date(job.posting_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePosting <= 2) {
      confidence_score += 10;
      matchReasons.push('Posted within last 2 days');
    } else if (daysSincePosting <= 5) {
      confidence_score += 5;
      matchReasons.push(`Posted ${daysSincePosting} days ago`);
    }

    // Build comprehensive reason
    if (matchReasons.length > 0) {
      reason = matchReasons.join(' • ');
    }

    return {
      ...job,
      confidence_score: Math.min(100, confidence_score),
      match_reason: reason,
      days_since_posting: daysSincePosting
    };
  }).sort((a, b) => {
    // Sort by confidence score first, then by recency
    if (b.confidence_score === a.confidence_score) {
      return a.days_since_posting - b.days_since_posting;
    }
    return b.confidence_score - a.confidence_score;
  }).slice(0, 10); // Return top 10 matches
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
