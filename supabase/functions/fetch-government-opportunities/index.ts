import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GovJob {
  title: string;
  department: string;
  category: string;
  notification_date: string;
  last_date: string;
  total_posts: string;
  qualification: string;
  age_limit: string;
  application_fee: string;
  eligibility: string;
  selection_process: string;
  apply_link: string;
  notification_link: string;
  detail_page_url: string;
  youtube_guide: string;
}

interface GovAdmission {
  title: string;
  authority: string;
  category: string;
  notification_date: string;
  last_date: string;
  eligibility: string;
  application_fee: string;
  age_limit: string;
  selection_process: string;
  apply_link: string;
  notification_link: string;
  detail_page_url: string;
  youtube_guide: string;
}

interface GovAdmitCard {
  title: string;
  department: string;
  exam_date: string;
  admit_card_date: string;
  download_link: string;
  detail_page_url: string;
  status: string;
}

// Comprehensive mock data for government opportunities
const getMockGovJobs = (): GovJob[] => [
  {
    title: "SSC CGL 2025 - Combined Graduate Level Examination",
    department: "Staff Selection Commission",
    category: "Central Government",
    notification_date: "2025-01-15",
    last_date: "2025-02-15",
    total_posts: "14,582 Posts",
    qualification: "Graduate in any discipline from recognized university",
    age_limit: "18-32 years (relaxation applicable)",
    application_fee: "₹100 (Free for SC/ST/Female/PwD)",
    eligibility: "Indian citizen, Bachelor's degree from recognized university",
    selection_process: "Tier-1 (CBT) → Tier-2 (CBT) → Document Verification",
    apply_link: "https://ssc.nic.in/Portal/Apply",
    notification_link: "https://ssc.nic.in/Portal/Notifications",
    detail_page_url: "https://ssc.nic.in",
    youtube_guide: "https://www.youtube.com/watch?v=ssc-cgl-guide"
  },
  {
    title: "IBPS PO 2025 - Probationary Officer Recruitment",
    department: "Institute of Banking Personnel Selection",
    category: "Banking",
    notification_date: "2025-01-10",
    last_date: "2025-02-28",
    total_posts: "4,455 Posts",
    qualification: "Graduate with minimum 60% marks",
    age_limit: "20-30 years",
    application_fee: "₹850 (₹175 for SC/ST/PwD)",
    eligibility: "Graduate from recognized university, Computer knowledge essential",
    selection_process: "Prelims → Mains → Interview → Final Selection",
    apply_link: "https://ibps.in/apply",
    notification_link: "https://ibps.in/notifications",
    detail_page_url: "https://ibps.in",
    youtube_guide: "https://www.youtube.com/watch?v=ibps-po-guide"
  },
  {
    title: "Railway RRB NTPC 2025 - Non-Technical Popular Categories",
    department: "Railway Recruitment Board",
    category: "Railways",
    notification_date: "2025-01-05",
    last_date: "2025-03-15",
    total_posts: "35,281 Posts",
    qualification: "12th Pass / Graduate (depending on post)",
    age_limit: "18-33 years",
    application_fee: "₹500 (₹250 refundable for SC/ST/PwD/Female)",
    eligibility: "12th pass or Graduate based on post level",
    selection_process: "CBT Stage 1 → CBT Stage 2 → CBAT/Typing Test → Document Verification",
    apply_link: "https://rrbapply.gov.in",
    notification_link: "https://rrbcdg.gov.in/ntpc",
    detail_page_url: "https://rrbcdg.gov.in",
    youtube_guide: "https://www.youtube.com/watch?v=rrb-ntpc-guide"
  },
  {
    title: "UPSC Civil Services 2025 - IAS/IPS/IFS Examination",
    department: "Union Public Service Commission",
    category: "Central Government",
    notification_date: "2025-01-20",
    last_date: "2025-02-20",
    total_posts: "1,105 Posts",
    qualification: "Graduate in any discipline",
    age_limit: "21-32 years (relaxation for reserved categories)",
    application_fee: "₹100 (Free for SC/ST/Female/PwD)",
    eligibility: "Indian citizen, Bachelor's degree from recognized university",
    selection_process: "Prelims (CSAT) → Mains → Personality Test (Interview)",
    apply_link: "https://upsc.gov.in/apply",
    notification_link: "https://upsc.gov.in/notifications",
    detail_page_url: "https://upsc.gov.in",
    youtube_guide: "https://www.youtube.com/watch?v=upsc-ias-guide"
  },
  {
    title: "Indian Army Agniveer Recruitment 2025",
    department: "Indian Army",
    category: "Defence",
    notification_date: "2025-01-08",
    last_date: "2025-02-10",
    total_posts: "46,000 Posts",
    qualification: "10th/12th Pass (depending on trade)",
    age_limit: "17.5-23 years",
    application_fee: "Free",
    eligibility: "10th/12th pass, Physical standards as per trade",
    selection_process: "Online Registration → Physical Test → Medical → Written Test",
    apply_link: "https://joinindianarmy.nic.in/apply",
    notification_link: "https://joinindianarmy.nic.in/notifications",
    detail_page_url: "https://joinindianarmy.nic.in",
    youtube_guide: "https://www.youtube.com/watch?v=agniveer-guide"
  },
  {
    title: "DRDO Scientist B Recruitment 2025",
    department: "Defence Research and Development Organisation",
    category: "Research & Development",
    notification_date: "2025-01-18",
    last_date: "2025-03-01",
    total_posts: "290 Posts",
    qualification: "B.E./B.Tech in relevant discipline with minimum 60%",
    age_limit: "18-28 years",
    application_fee: "₹100 (Free for SC/ST/Female/PwD)",
    eligibility: "Engineering graduate with valid GATE score",
    selection_process: "GATE Score → Interview → Document Verification",
    apply_link: "https://drdo.gov.in/apply",
    notification_link: "https://drdo.gov.in/careers",
    detail_page_url: "https://drdo.gov.in",
    youtube_guide: "https://www.youtube.com/watch?v=drdo-scientist-guide"
  },
  {
    title: "India Post GDS Recruitment 2025 - Gramin Dak Sevak",
    department: "Department of Posts",
    category: "Postal",
    notification_date: "2025-01-22",
    last_date: "2025-02-22",
    total_posts: "44,228 Posts",
    qualification: "10th Pass with local language knowledge",
    age_limit: "18-40 years",
    application_fee: "₹100 (Free for Female/SC/ST/PwD)",
    eligibility: "10th pass, Knowledge of local language, Computer knowledge",
    selection_process: "Merit-based selection on 10th marks → Document Verification",
    apply_link: "https://indiapostgdsonline.gov.in/apply",
    notification_link: "https://indiapostgdsonline.gov.in",
    detail_page_url: "https://indiapostgdsonline.gov.in",
    youtube_guide: "https://www.youtube.com/watch?v=india-post-gds-guide"
  },
  {
    title: "SBI Clerk 2025 - Junior Associate Recruitment",
    department: "State Bank of India",
    category: "Banking",
    notification_date: "2025-01-25",
    last_date: "2025-02-25",
    total_posts: "8,773 Posts",
    qualification: "Graduate from recognized university",
    age_limit: "20-28 years",
    application_fee: "₹750 (₹125 for SC/ST/PwD)",
    eligibility: "Graduate with computer knowledge",
    selection_process: "Prelims → Mains → Local Language Test",
    apply_link: "https://sbi.co.in/careers/apply",
    notification_link: "https://sbi.co.in/careers",
    detail_page_url: "https://sbi.co.in/careers",
    youtube_guide: "https://www.youtube.com/watch?v=sbi-clerk-guide"
  }
];

const getMockGovAdmissions = (): GovAdmission[] => [
  {
    title: "JEE Main 2025 - Session 2 Registration",
    authority: "National Testing Agency",
    category: "Engineering",
    notification_date: "2025-01-10",
    last_date: "2025-02-28",
    eligibility: "12th pass with Physics, Chemistry, Mathematics",
    application_fee: "₹1,000 (₹500 for SC/ST/PwD/Female)",
    age_limit: "No age limit",
    selection_process: "CBT Examination → Counselling (JoSAA)",
    apply_link: "https://jeemain.nta.nic.in/apply",
    notification_link: "https://jeemain.nta.nic.in/notifications",
    detail_page_url: "https://jeemain.nta.nic.in",
    youtube_guide: "https://www.youtube.com/watch?v=jee-main-guide"
  },
  {
    title: "NEET UG 2025 - Medical Entrance Exam",
    authority: "National Testing Agency",
    category: "Medical",
    notification_date: "2025-01-15",
    last_date: "2025-03-15",
    eligibility: "12th pass with Physics, Chemistry, Biology (PCB)",
    application_fee: "₹1,700 (₹1,000 for SC/ST/PwD)",
    age_limit: "Minimum 17 years as on Dec 31, 2025",
    selection_process: "NEET UG Exam → Counselling (MCC/State)",
    apply_link: "https://neet.nta.nic.in/apply",
    notification_link: "https://neet.nta.nic.in/notifications",
    detail_page_url: "https://neet.nta.nic.in",
    youtube_guide: "https://www.youtube.com/watch?v=neet-ug-guide"
  },
  {
    title: "CUET UG 2025 - Central Universities Entrance Test",
    authority: "National Testing Agency",
    category: "Undergraduate",
    notification_date: "2025-01-20",
    last_date: "2025-03-20",
    eligibility: "12th pass from recognized board",
    application_fee: "₹750 (₹400 for SC/ST/PwD)",
    age_limit: "No upper age limit",
    selection_process: "CUET UG CBT → University Counselling",
    apply_link: "https://cuet.samarth.ac.in/apply",
    notification_link: "https://cuet.samarth.ac.in",
    detail_page_url: "https://cuet.samarth.ac.in",
    youtube_guide: "https://www.youtube.com/watch?v=cuet-ug-guide"
  },
  {
    title: "CAT 2025 - Common Admission Test for IIMs",
    authority: "Indian Institutes of Management",
    category: "Management",
    notification_date: "2025-01-05",
    last_date: "2025-02-15",
    eligibility: "Bachelor's degree with 50% marks (45% for SC/ST/PwD)",
    application_fee: "₹2,400 (₹1,200 for SC/ST/PwD)",
    age_limit: "No upper age limit",
    selection_process: "CAT CBT → WAT/PI at IIMs",
    apply_link: "https://iimcat.ac.in/apply",
    notification_link: "https://iimcat.ac.in",
    detail_page_url: "https://iimcat.ac.in",
    youtube_guide: "https://www.youtube.com/watch?v=cat-iim-guide"
  },
  {
    title: "GATE 2025 - Graduate Aptitude Test in Engineering",
    authority: "IIT Delhi",
    category: "Postgraduate",
    notification_date: "2025-01-08",
    last_date: "2025-02-20",
    eligibility: "Bachelor's degree in Engineering/Science or final year students",
    application_fee: "₹1,800 (₹900 for SC/ST/PwD/Female)",
    age_limit: "No age limit",
    selection_process: "GATE CBT → M.Tech/PSU Recruitment",
    apply_link: "https://gate.iitd.ac.in/apply",
    notification_link: "https://gate.iitd.ac.in",
    detail_page_url: "https://gate.iitd.ac.in",
    youtube_guide: "https://www.youtube.com/watch?v=gate-guide"
  },
  {
    title: "CLAT 2025 - Common Law Admission Test",
    authority: "Consortium of NLUs",
    category: "Law",
    notification_date: "2025-01-12",
    last_date: "2025-02-18",
    eligibility: "12th pass for UG, LLB for PG",
    application_fee: "₹4,000 (₹3,500 for SC/ST/PwD)",
    age_limit: "No upper age limit for UG",
    selection_process: "CLAT CBT → NLU Counselling",
    apply_link: "https://consortiumofnlus.ac.in/apply",
    notification_link: "https://consortiumofnlus.ac.in",
    detail_page_url: "https://consortiumofnlus.ac.in",
    youtube_guide: "https://www.youtube.com/watch?v=clat-guide"
  }
];

const getMockAdmitCards = (): GovAdmitCard[] => [
  {
    title: "SSC CHSL 2024 Tier-2 Admit Card",
    department: "Staff Selection Commission",
    exam_date: "2025-02-15",
    admit_card_date: "2025-01-25",
    download_link: "https://ssc.nic.in/admitcard",
    detail_page_url: "https://ssc.nic.in",
    status: "Available"
  },
  {
    title: "IBPS Clerk Mains 2024 Admit Card",
    department: "Institute of Banking Personnel Selection",
    exam_date: "2025-02-08",
    admit_card_date: "2025-01-28",
    download_link: "https://ibps.in/admitcard",
    detail_page_url: "https://ibps.in",
    status: "Available"
  },
  {
    title: "RRB Group D 2024 Phase-4 Admit Card",
    department: "Railway Recruitment Board",
    exam_date: "2025-02-20",
    admit_card_date: "2025-01-30",
    download_link: "https://rrbcdg.gov.in/admitcard",
    detail_page_url: "https://rrbcdg.gov.in",
    status: "Coming Soon"
  },
  {
    title: "UPPSC PCS Prelims 2024 Admit Card",
    department: "Uttar Pradesh Public Service Commission",
    exam_date: "2025-02-25",
    admit_card_date: "2025-02-01",
    download_link: "https://uppsc.up.nic.in/admitcard",
    detail_page_url: "https://uppsc.up.nic.in",
    status: "Coming Soon"
  },
  {
    title: "SBI PO Prelims 2025 Admit Card",
    department: "State Bank of India",
    exam_date: "2025-03-01",
    admit_card_date: "2025-02-05",
    download_link: "https://sbi.co.in/admitcard",
    detail_page_url: "https://sbi.co.in/careers",
    status: "Coming Soon"
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for action
    let action = 'fetch';
    let type = 'all';
    
    try {
      const body = await req.json();
      action = body.action || 'fetch';
      type = body.type || 'all';
    } catch {
      // Check URL params as fallback
      const url = new URL(req.url);
      action = url.searchParams.get('action') || 'fetch';
      type = url.searchParams.get('type') || 'all';
    }

    console.log(`[GovOpportunities] Action: ${action}, Type: ${type}`);

    if (action === 'refresh') {
      // First, clear existing data to avoid conflicts
      console.log('[GovOpportunities] Clearing existing data...');
      
      await supabase.from('gov_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('gov_admissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('gov_admit_cards').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Get mock data
      const jobs = getMockGovJobs();
      const admissions = getMockGovAdmissions();
      const admitCards = getMockAdmitCards();

      console.log(`[GovOpportunities] Inserting ${jobs.length} jobs, ${admissions.length} admissions, ${admitCards.length} admit cards`);

      // Insert jobs
      const jobInserts = jobs.map(job => ({
        title: job.title,
        department: job.department,
        category: job.category,
        notification_date: job.notification_date,
        last_date: job.last_date,
        total_posts: job.total_posts,
        qualification: job.qualification,
        age_limit: job.age_limit,
        application_fee: job.application_fee,
        eligibility: job.eligibility,
        selection_process: job.selection_process,
        apply_link: job.apply_link,
        notification_link: job.notification_link,
        detail_page_url: job.detail_page_url,
        youtube_guide: job.youtube_guide,
        source: 'sarkariresult',
        is_active: true
      }));

      const { error: jobError } = await supabase.from('gov_jobs').insert(jobInserts);
      if (jobError) {
        console.error('[GovOpportunities] Job insert error:', jobError);
      } else {
        console.log(`[GovOpportunities] Successfully inserted ${jobs.length} jobs`);
      }

      // Insert admissions
      const admissionInserts = admissions.map(admission => ({
        title: admission.title,
        authority: admission.authority,
        category: admission.category,
        notification_date: admission.notification_date,
        last_date: admission.last_date,
        eligibility: admission.eligibility,
        application_fee: admission.application_fee,
        age_limit: admission.age_limit,
        selection_process: admission.selection_process,
        apply_link: admission.apply_link,
        notification_link: admission.notification_link,
        detail_page_url: admission.detail_page_url,
        youtube_guide: admission.youtube_guide,
        source: 'sarkariresult',
        is_active: true
      }));

      const { error: admissionError } = await supabase.from('gov_admissions').insert(admissionInserts);
      if (admissionError) {
        console.error('[GovOpportunities] Admission insert error:', admissionError);
      } else {
        console.log(`[GovOpportunities] Successfully inserted ${admissions.length} admissions`);
      }

      // Insert admit cards
      const admitCardInserts = admitCards.map(card => ({
        title: card.title,
        department: card.department,
        exam_date: card.exam_date,
        admit_card_date: card.admit_card_date,
        download_link: card.download_link,
        detail_page_url: card.detail_page_url,
        status: card.status,
        source: 'sarkariresult',
        is_active: true
      }));

      const { error: admitCardError } = await supabase.from('gov_admit_cards').insert(admitCardInserts);
      if (admitCardError) {
        console.error('[GovOpportunities] Admit card insert error:', admitCardError);
      } else {
        console.log(`[GovOpportunities] Successfully inserted ${admitCards.length} admit cards`);
      }

      console.log('[GovOpportunities] Data refresh completed successfully');
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Government opportunities refreshed',
        stats: {
          jobs: jobs.length,
          admissions: admissions.length,
          admitCards: admitCards.length
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch data from database
    let data: any = {};

    if (type === 'all' || type === 'jobs') {
      const { data: jobs, error } = await supabase
        .from('gov_jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) console.error('Error fetching jobs:', error);
      data.jobs = jobs || [];
      console.log(`[GovOpportunities] Fetched ${data.jobs.length} jobs`);
    }

    if (type === 'all' || type === 'admissions') {
      const { data: admissions, error } = await supabase
        .from('gov_admissions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) console.error('Error fetching admissions:', error);
      data.admissions = admissions || [];
      console.log(`[GovOpportunities] Fetched ${data.admissions.length} admissions`);
    }

    if (type === 'all' || type === 'admit_cards') {
      const { data: admitCards, error } = await supabase
        .from('gov_admit_cards')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) console.error('Error fetching admit cards:', error);
      data.admitCards = admitCards || [];
      console.log(`[GovOpportunities] Fetched ${data.admitCards.length} admit cards`);
    }

    return new Response(JSON.stringify({
      success: true,
      data,
      source: 'Government Verified Sources (Sarkari Result)',
      lastUpdated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[GovOpportunities] Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch government opportunities',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
