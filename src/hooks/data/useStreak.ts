
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Streak } from '@/types';
import { toast } from 'sonner';
import { differenceInDays, format, parseISO } from 'date-fns';

export function useStreak() {
  const { currentUser } = useAuth();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user streak
  const fetchStreak = async () => {
    try {
      if (!currentUser) {
        setStreak(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Try to get existing streak from profiles table (temporary solution until streaks table is created)
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, points')
        .eq('id', currentUser.id)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        throw userError;
      }

      // For now, we'll use localStorage to track streaks until the database schema is updated
      const storedStreak = localStorage.getItem(`streak_${currentUser.id}`);
      
      if (storedStreak) {
        const parsedStreak = JSON.parse(storedStreak);
        setStreak({
          userId: currentUser.id,
          currentStreak: parsedStreak.currentStreak,
          lastActivity: parsedStreak.lastActivity,
          longestStreak: parsedStreak.longestStreak
        });
      } else {
        // Create default streak data
        const newStreak: Omit<Streak, 'userId'> = {
          currentStreak: 0,
          lastActivity: new Date().toISOString(),
          longestStreak: 0
        };
        
        // Store to localStorage for now
        localStorage.setItem(`streak_${currentUser.id}`, JSON.stringify(newStreak));
        
        setStreak({
          userId: currentUser.id,
          ...newStreak
        });
      }
    } catch (error: any) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check and update streak status
  const checkStreak = async () => {
    try {
      if (!currentUser || !streak) return;
      
      const lastActivityDate = parseISO(streak.lastActivity);
      const today = new Date();
      const diffDays = differenceInDays(today, lastActivityDate);
      
      let newStreak = { ...streak };
      let updated = false;

      // If last activity was today, no need to update
      if (format(lastActivityDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        return;
      }
      
      // If last activity was yesterday, increment streak
      if (diffDays === 1) {
        newStreak.currentStreak += 1;
        newStreak.lastActivity = today.toISOString();
        updated = true;
        
        // Update longest streak if current streak is greater
        if (newStreak.currentStreak > newStreak.longestStreak) {
          newStreak.longestStreak = newStreak.currentStreak;
        }
      } 
      // If more than one day has passed, reset streak
      else if (diffDays > 1) {
        newStreak.currentStreak = 1;
        newStreak.lastActivity = today.toISOString();
        updated = true;
      }
      
      // Update local streak data if changed
      if (updated) {
        // Store to localStorage for now
        localStorage.setItem(`streak_${currentUser.id}`, JSON.stringify({
          currentStreak: newStreak.currentStreak,
          lastActivity: newStreak.lastActivity,
          longestStreak: newStreak.longestStreak
        }));
        
        setStreak(newStreak);
        
        // Show toast for streak milestones
        if (newStreak.currentStreak > 0 && newStreak.currentStreak % 5 === 0) {
          toast.success(`🔥 Streak milestone! ${newStreak.currentStreak} days in a row!`);
        }
      }
    } catch (error: any) {
      console.error('Error updating streak:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchStreak();
    }
  }, [currentUser]);

  return {
    streak,
    loading,
    fetchStreak,
    checkStreak
  };
}
