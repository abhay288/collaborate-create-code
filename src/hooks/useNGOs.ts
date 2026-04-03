import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NGO {
  id: string;
  name: string;
  mission_summary: string;
  primary_focus: string;
  states_present: string[];
  hq_address: string | null;
  phone: string | null;
  email: string | null;
  website: string;
  apply_or_donate_link: string | null;
  notes: string | null;
  verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useNGOs = () => {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNGOs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('ngos')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setNgos((data as NGO[]) || []);
    } catch (err) {
      console.error('Error fetching NGOs:', err);
      setError('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  }, []);

  const createNGO = async (ngo: Omit<NGO, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('ngos')
        .insert(ngo as any)
        .select()
        .single();

      if (error) throw error;
      
      toast({ title: 'Success', description: 'NGO created successfully' });
      await fetchNGOs();
      return data;
    } catch (err) {
      console.error('Error creating NGO:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to create NGO',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const updateNGO = async (id: string, updates: Partial<NGO>) => {
    try {
      const { error } = await supabase
        .from('ngos')
        .update(updates as any)
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Success', description: 'NGO updated successfully' });
      await fetchNGOs();
    } catch (err) {
      console.error('Error updating NGO:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to update NGO',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const deleteNGO = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ngos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Success', description: 'NGO deleted successfully' });
      await fetchNGOs();
    } catch (err) {
      console.error('Error deleting NGO:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to delete NGO',
        variant: 'destructive'
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchNGOs();
  }, [fetchNGOs]);

  return {
    ngos,
    loading,
    error,
    fetchNGOs,
    createNGO,
    updateNGO,
    deleteNGO
  };
};
