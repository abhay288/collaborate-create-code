import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Opportunity = Tables<"private_opportunities">;

export function usePrivateOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("private_opportunities")
        .select("*")
        .eq("is_active", true)
        .order("posted_date", { ascending: false });

      if (!error && data) setOpportunities(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return { opportunities, loading };
}
