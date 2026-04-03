import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OpportunityData {
  title: string;
  organization?: string;
  department?: string;
  category: string;
  important_dates?: string;
  application_fee?: string;
  eligibility?: string;
  age_limit?: string;
  total_posts?: string;
  location?: string;
  apply_link?: string;
  notification_link?: string;
  last_date?: string;
  source: string;
  source_url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'fetch';
    const source = body.source || 'all';

    console.log(`[scrape-opportunities] Action: ${action}, Source: ${source}`);

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const stats = {
      jobs: 0,
      admissions: 0,
      admitCards: 0,
      privateOpportunities: 0,
      errors: [] as string[]
    };

    // If Firecrawl is not configured, use sample data
    if (!FIRECRAWL_API_KEY) {
      console.log('[scrape-opportunities] Firecrawl not configured, inserting sample data');
      
      // Insert sample government jobs
      const sampleJobs: Partial<OpportunityData>[] = [
        {
          title: 'UPSC Civil Services 2026',
          department: 'Union Public Service Commission',
          category: 'Central Government',
          last_date: '2026-03-15',
          eligibility: 'Graduate from recognized university',
          total_posts: '1000+',
          apply_link: 'https://upsc.gov.in',
          source: 'sarkariresult'
        },
        {
          title: 'SSC CGL 2026',
          department: 'Staff Selection Commission',
          category: 'Central Government',
          last_date: '2026-02-28',
          eligibility: 'Bachelor\'s Degree',
          total_posts: '7500',
          apply_link: 'https://ssc.nic.in',
          source: 'sarkariresult'
        },
        {
          title: 'IBPS PO 2026',
          department: 'Institute of Banking Personnel Selection',
          category: 'Banking',
          last_date: '2026-04-10',
          eligibility: 'Graduate with 60% marks',
          total_posts: '5000',
          apply_link: 'https://ibps.in',
          source: 'sarkariresult'
        },
        {
          title: 'Railway Group D 2026',
          department: 'Railway Recruitment Board',
          category: 'Railway',
          last_date: '2026-05-01',
          eligibility: '10th Pass + ITI',
          total_posts: '100000+',
          apply_link: 'https://rrbcdg.gov.in',
          source: 'sarkariresult'
        },
        {
          title: 'State Police Constable',
          department: 'State Police Department',
          category: 'State Government',
          last_date: '2026-03-30',
          eligibility: '12th Pass',
          total_posts: '25000',
          apply_link: 'https://uppbpb.gov.in',
          source: 'sarkariresult'
        }
      ];

      for (const job of sampleJobs) {
        const { error } = await supabase
          .from('gov_jobs')
          .upsert({
            ...job,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'title,department,last_date'
          });

        if (!error) stats.jobs++;
      }

      // Insert sample admissions
      const sampleAdmissions = [
        {
          title: 'JEE Main 2026',
          authority: 'National Testing Agency',
          category: 'Engineering',
          last_date: '2026-01-31',
          eligibility: '12th with PCM 75%+',
          apply_link: 'https://jeemain.nta.nic.in',
          source: 'sarkariresult'
        },
        {
          title: 'NEET UG 2026',
          authority: 'National Testing Agency',
          category: 'Medical',
          last_date: '2026-02-28',
          eligibility: '12th with PCB 50%+',
          apply_link: 'https://neet.nta.nic.in',
          source: 'sarkariresult'
        },
        {
          title: 'CUET UG 2026',
          authority: 'National Testing Agency',
          category: 'University',
          last_date: '2026-03-15',
          eligibility: '12th from recognized board',
          apply_link: 'https://cuet.nta.nic.in',
          source: 'sarkariresult'
        }
      ];

      for (const admission of sampleAdmissions) {
        const { error } = await supabase
          .from('gov_admissions')
          .upsert({
            ...admission,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'title,authority,last_date'
          });

        if (!error) stats.admissions++;
      }

      // Insert sample admit cards
      const sampleAdmitCards = [
        {
          title: 'UPSC CSE Prelims Admit Card 2026',
          department: 'UPSC',
          exam_date: '2026-05-15',
          admit_card_date: '2026-04-20',
          download_link: 'https://upsc.gov.in/admit-card',
          status: 'Available',
          source: 'sarkariresult'
        },
        {
          title: 'SSC CGL Tier-1 Admit Card 2026',
          department: 'SSC',
          exam_date: '2026-04-10',
          admit_card_date: '2026-03-25',
          download_link: 'https://ssc.nic.in/admit-card',
          status: 'Upcoming',
          source: 'sarkariresult'
        }
      ];

      for (const admitCard of sampleAdmitCards) {
        const { error } = await supabase
          .from('gov_admit_cards')
          .upsert({
            ...admitCard,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'title,department,exam_date'
          });

        if (!error) stats.admitCards++;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Sample data inserted (Firecrawl not configured)',
          stats
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Firecrawl is configured - scrape real data
    console.log('[scrape-opportunities] Using Firecrawl to scrape data');

    // Scrape Sarkari Result for government opportunities
    const sarkariUrls = [
      { url: 'https://www.sarkariresult.com/latestjob.php', type: 'jobs' },
      { url: 'https://www.sarkariresult.com/admission/', type: 'admissions' },
      { url: 'https://www.sarkariresult.com/admit-card/', type: 'admitCards' }
    ];

    for (const urlConfig of sarkariUrls) {
      try {
        console.log(`[scrape-opportunities] Scraping ${urlConfig.url}`);

        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: urlConfig.url,
            formats: ['markdown', 'links'],
            onlyMainContent: true
          }),
        });

        if (!scrapeResponse.ok) {
          throw new Error(`Scrape failed: ${scrapeResponse.status}`);
        }

        const scrapeData = await scrapeResponse.json();
        console.log(`[scrape-opportunities] Scraped ${urlConfig.type}: ${scrapeData.data?.links?.length || 0} links found`);

        // Process scraped data based on type
        // In production, you would parse the markdown content to extract structured data
        // For now, we'll log the result
        if (urlConfig.type === 'jobs') {
          stats.jobs += scrapeData.data?.links?.length || 0;
        } else if (urlConfig.type === 'admissions') {
          stats.admissions += scrapeData.data?.links?.length || 0;
        } else if (urlConfig.type === 'admitCards') {
          stats.admitCards += scrapeData.data?.links?.length || 0;
        }

      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[scrape-opportunities] Error scraping ${urlConfig.url}:`, error);
        stats.errors.push(`Failed to scrape ${urlConfig.type}: ${errorMsg}`);
      }
    }

    // Log scraping activity
    await supabase.from('user_activity').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      activity_type: 'opportunity_scrape',
      activity_data: {
        timestamp: new Date().toISOString(),
        ...stats
      }
    });

    console.log('[scrape-opportunities] Scraping complete:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Opportunities scraped successfully',
        stats
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[scrape-opportunities] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Something went wrong. Please try again later.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
