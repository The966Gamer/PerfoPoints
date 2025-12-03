
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
      
      // Fetch custom requests separately (no joins)
      const { data: requests, error: requestsError } = await supabase
        .from('custom_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching custom requests:', requestsError);
        return;
      }

      if (!requests || requests.length === 0) {
        setCustomRequests([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(requests.map(r => r.user_id))];

      // Fetch profiles separately
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      // Create lookup map
      const profileMap = new Map(profiles?.map(p => [p.id, p.username]) || []);

      const mappedRequests: CustomRequest[] = requests.map(request => ({
        id: request.id,
        userId: request.user_id,
        title: request.title,
        description: request.description || undefined,
        type: request.type as "task" | "reward" | "other",
        status: request.status as "pending" | "approved" | "rejected",
        createdAt: request.created_at || '',
        updatedAt: request.updated_at || undefined,
        reviewedBy: undefined,
        username: profileMap.get(request.user_id) || 'Unknown User'
      }));
      
      setCustomRequests(mappedRequests);
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
