
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
        return;
      }

      setLoading(true);
      
      // Try to get existing streak
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
      
      if (error) {
        // If no streak found, create default one
        if (error.code === 'PGRST116') {
          const newStreak: Omit<Streak, 'userId'> = {
            currentStreak: 0,
            lastActivity: new Date().toISOString(),
            longestStreak: 0
          };
          
          await supabase
            .from('streaks')
            .insert([{ 
              user_id: currentUser.id,
              current_streak: newStreak.currentStreak,
              last_activity: newStreak.lastActivity,
              longest_streak: newStreak.longestStreak
            }]);
            
          setStreak({
            userId: currentUser.id,
            ...newStreak
          });
        } else {
          throw error;
        }
      } else {
        // Map DB fields to frontend naming
        setStreak({
          userId: data.user_id,
          currentStreak: data.current_streak,
          lastActivity: data.last_activity,
          longestStreak: data.longest_streak
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
      
      // Update streak in database if changed
      if (updated) {
        const { error } = await supabase
          .from('streaks')
          .update({
            current_streak: newStreak.currentStreak,
            last_activity: newStreak.lastActivity,
            longest_streak: newStreak.longestStreak
          })
          .eq('user_id', currentUser.id);
          
        if (error) throw error;
        
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
