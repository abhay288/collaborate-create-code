import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting weekly data refresh...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = {
      scholarships_updated: 0,
      jobs_deactivated: 0,
      colleges_checked: 0,
      errors: [] as string[]
    };

    // 1. Update scholarship status based on deadlines
    try {
      const { data: expiredScholarships, error: expiredError } = await supabase
        .from('verified_scholarships')
        .update({ status: 'closed' })
        .eq('status', 'open')
        .lt('deadline', new Date().toISOString())
        .select('id');

      if (expiredError) throw expiredError;
      
      results.scholarships_updated = expiredScholarships?.length || 0;
      console.log(`Updated ${results.scholarships_updated} expired scholarships to closed status`);
    } catch (error: any) {
      const errorMsg = `Scholarship update error: ${error?.message || 'Unknown error'}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
    }

    // 2. Deactivate old job postings (older than 30 days)
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: oldJobs, error: jobError } = await supabase
        .from('verified_jobs')
        .update({ 
          is_active: false,
          last_checked: new Date().toISOString()
        })
        .eq('is_active', true)
        .lt('posting_date', thirtyDaysAgo.toISOString())
        .select('id');

      if (jobError) throw jobError;
      
      results.jobs_deactivated = oldJobs?.length || 0;
      console.log(`Deactivated ${results.jobs_deactivated} old job postings`);
    } catch (error: any) {
      const errorMsg = `Job deactivation error: ${error?.message || 'Unknown error'}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
    }

    // 3. Update last_checked timestamp for all active data
    try {
      const now = new Date().toISOString();
      
      // Count colleges first
      const { count: collegesCount, error: countError } = await supabase
        .from('colleges')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      results.colleges_checked = collegesCount || 0;

      // Update colleges
      await supabase
        .from('colleges')
        .update({ updated_at: now })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      // Update active scholarships last_checked
      await supabase
        .from('verified_scholarships')
        .update({ last_checked: now })
        .eq('status', 'open');

      // Update active jobs last_checked
      await supabase
        .from('verified_jobs')
        .update({ last_checked: now })
        .eq('is_active', true);

      console.log(`Updated last_checked timestamp for ${results.colleges_checked} colleges`);
    } catch (error: any) {
      const errorMsg = `Timestamp update error: ${error?.message || 'Unknown error'}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
    }

    // 4. Log the refresh activity
    try {
      await supabase
        .from('user_activity')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // System user
          activity_type: 'data_refresh',
          activity_data: {
            timestamp: new Date().toISOString(),
            ...results
          }
        });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't add to errors as this is non-critical
    }

    console.log('Weekly data refresh completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data refresh completed successfully',
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in refresh-data function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
