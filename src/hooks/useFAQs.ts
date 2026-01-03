import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GroupedFAQs {
  [category: string]: FAQ[];
}

export const useFAQs = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [groupedFaqs, setGroupedFaqs] = useState<GroupedFAQs>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (fetchError) throw fetchError;

      setFaqs(data || []);

      // Group FAQs by category
      const grouped = (data || []).reduce((acc: GroupedFAQs, faq: FAQ) => {
        if (!acc[faq.category]) {
          acc[faq.category] = [];
        }
        acc[faq.category].push(faq);
        return acc;
      }, {});

      setGroupedFaqs(grouped);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching FAQs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("faqs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "faqs" },
        () => {
          fetchFAQs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { faqs, groupedFaqs, loading, error, refetch: fetchFAQs };
};

export const useAdminFAQs = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllFAQs = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("faqs")
        .select("*")
        .order("display_order", { ascending: true });

      if (fetchError) throw fetchError;

      setFaqs(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching FAQs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createFAQ = async (faq: Omit<FAQ, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase
      .from("faqs")
      .insert(faq)
      .select()
      .single();

    if (error) throw error;
    await fetchAllFAQs();
    return data;
  };

  const updateFAQ = async (id: string, updates: Partial<FAQ>) => {
    const { data, error } = await supabase
      .from("faqs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await fetchAllFAQs();
    return data;
  };

  const deleteFAQ = async (id: string) => {
    const { error } = await supabase.from("faqs").delete().eq("id", id);

    if (error) throw error;
    await fetchAllFAQs();
  };

  const reorderFAQs = async (reorderedFaqs: { id: string; display_order: number }[]) => {
    for (const faq of reorderedFaqs) {
      await supabase
        .from("faqs")
        .update({ display_order: faq.display_order })
        .eq("id", faq.id);
    }
    await fetchAllFAQs();
  };

  useEffect(() => {
    fetchAllFAQs();
  }, []);

  return {
    faqs,
    loading,
    error,
    refetch: fetchAllFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    reorderFAQs,
  };
};
