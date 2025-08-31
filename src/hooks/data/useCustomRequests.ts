
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomRequest } from '@/types';
import { toast } from 'sonner';

export function useCustomRequests() {
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_requests')
        .select(`
          *,
          profiles(username)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching custom requests:', error);
        return;
      }

      if (data) {
        const mappedRequests: CustomRequest[] = data.map(request => ({
          id: request.id,
          userId: request.user_id,
          title: request.title,
          description: request.description || undefined,
          type: request.type as "task" | "reward" | "other",
          status: request.status as "pending" | "approved" | "rejected",
          createdAt: request.created_at,
          updatedAt: request.updated_at || undefined,
          reviewedBy: undefined, // Field doesn't exist in database yet
          username: (request.profiles as any)?.username || 'Unknown User'
        }));
        
        setCustomRequests(mappedRequests);
      }
    } catch (error) {
      console.error('Error in fetchCustomRequests:', error);
      toast.error('Failed to load custom requests');
    } finally {
      setLoading(false);
    }
  };

  const submitCustomRequest = async (request: Omit<CustomRequest, 'id' | 'createdAt' | 'updatedAt' | 'reviewedBy' | 'username'>) => {
    try {
      const { error } = await supabase
        .from('custom_requests')
        .insert([{
          user_id: request.userId,
          title: request.title,
          description: request.description,
          type: request.type,
          status: request.status
        }]);

      if (error) throw error;
      
      toast.success('Custom request submitted successfully!');
      await fetchCustomRequests();
    } catch (error: any) {
      console.error('Error submitting custom request:', error);
      toast.error('Failed to submit custom request');
    }
  };

  const reviewCustomRequest = async (requestId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from('custom_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      
      toast.success(`Custom request ${status} successfully!`);
      await fetchCustomRequests();
    } catch (error: any) {
      console.error('Error reviewing custom request:', error);
      toast.error('Failed to review custom request');
    }
  };

  useEffect(() => {
    fetchCustomRequests();
  }, []);

  return {
    customRequests,
    loading,
    fetchCustomRequests,
    submitCustomRequest,
    reviewCustomRequest
  };
}
