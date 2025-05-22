
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { BookOpen, CheckCircle, CalendarCheck } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Prayer {
  name: string;
  arabicName: string;
  time: string;
  timeRange: string;
  completed: boolean;
}

export function PrayerTracker() {
  const { currentUser } = useAuth();
  const { submitPointRequest, tasks, checkStreak } = useData();
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  const [dailyPrayers, setDailyPrayers] = useState<Prayer[]>([
    { name: 'Fajr', arabicName: 'الفجر', time: 'Dawn', timeRange: '4:00 AM - 6:30 AM', completed: false },
    { name: 'Dhuhr', arabicName: 'الظهر', time: 'Noon', timeRange: '12:00 PM - 3:30 PM', completed: false },
    { name: 'Asr', arabicName: 'العصر', time: 'Afternoon', timeRange: '3:30 PM - 6:00 PM', completed: false },
    { name: 'Maghrib', arabicName: 'المغرب', time: 'Sunset', timeRange: '6:00 PM - 8:00 PM', completed: false },
    { name: 'Isha', arabicName: 'العشاء', time: 'Night', timeRange: '8:00 PM - 4:00 AM', completed: false },
  ]);
  const [todayDate, setTodayDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Find the Salah task
  const salahTask = tasks.find(task => 
    task.title.toLowerCase().includes('salah') || 
    task.title.toLowerCase().includes('prayer') ||
    task.category?.toLowerCase() === 'prayer'
  );

  // Get current prayer based on time
  const getCurrentPrayer = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 4 && hour < 12) return 'Fajr';
    if (hour >= 12 && hour < 15.5) return 'Dhuhr';
    if (hour >= 15.5 && hour < 18) return 'Asr';
    if (hour >= 18 && hour < 20) return 'Maghrib';
    return 'Isha';
  };

  // Load saved prayer data for today
  useEffect(() => {
    if (!currentUser) return;
    
    const savedPrayers = localStorage.getItem(`prayers_${currentUser.id}_${todayDate}`);
    if (savedPrayers) {
      setDailyPrayers(JSON.parse(savedPrayers));
    } else {
      // Reset prayers for new day
      setDailyPrayers(prev => prev.map(p => ({ ...p, completed: false })));
    }
    
    // Default select the current prayer time
    setSelectedPrayer(getCurrentPrayer());
  }, [currentUser, todayDate]);

  // Save prayers whenever they change
  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(`prayers_${currentUser.id}_${todayDate}`, JSON.stringify(dailyPrayers));
  }, [dailyPrayers, currentUser, todayDate]);

  // Check if date changed
  useEffect(() => {
    const checkDate = () => {
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      if (currentDate !== todayDate) {
        setTodayDate(currentDate);
      }
    };

    // Check date on mount and when window gains focus
    checkDate();
    window.addEventListener('focus', checkDate);
    
    return () => {
      window.removeEventListener('focus', checkDate);
    };
  }, [todayDate]);

  const handlePrayerSelect = (prayerName: string) => {
    setSelectedPrayer(prayerName);
  };

  const markPrayerCompleted = () => {
    if (!selectedPrayer) {
      toast.error("Please select a prayer first");
      return;
    }

    const newPrayers = [...dailyPrayers];
    const index = newPrayers.findIndex(p => p.name === selectedPrayer);
    
    if (index !== -1) {
      newPrayers[index].completed = true;
      setDailyPrayers(newPrayers);
      toast.success(`${selectedPrayer} prayer marked as completed!`);
    }
  };

  // Enhanced handle submit function that increments streak for 5 daily prayers
  const handleSubmitPrayers = async () => {
    if (!salahTask?.id) {
      toast.error("No prayer tracking task found. Please ask an admin to create one.");
      return;
    }

    const completedCount = dailyPrayers.filter(p => p.completed).length;
    
    if (completedCount === 0) {
      toast.error("You haven't completed any prayers yet today.");
      return;
    }

    try {
      const comment = `Completed ${completedCount} out of 5 daily prayers: ${dailyPrayers
        .filter(p => p.completed)
        .map(p => p.name)
        .join(', ')}`;
      
      await submitPointRequest(salahTask.id, null, comment);
      
      // Update streak if all prayers are completed
      if (completedCount === 5) {
        checkStreak();
        toast.success("All prayers completed! Your streak has been updated. 🔥");
      } else {
        toast.success("Prayer tracking submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting prayer tracking:", error);
      toast.error("Failed to submit prayer tracking. Please try again.");
    }
  };

  const completedCount = dailyPrayers.filter(p => p.completed).length;

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Daily Prayer Tracker
        </CardTitle>
        <CardDescription>Track your five daily prayers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RadioGroup 
            value={selectedPrayer || ''}
            onValueChange={handlePrayerSelect}
          >
            {dailyPrayers.map((prayer) => (
              <div key={prayer.name} className="flex items-center justify-between space-x-2 mb-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={prayer.name} 
                    id={`prayer-${prayer.name}`}
                    disabled={prayer.completed}
                  />
                  <div>
                    <Label htmlFor={`prayer-${prayer.name}`} className="font-medium">
                      {prayer.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{prayer.timeRange}</p>
                  </div>
                </div>
                <div className="text-sm text-right">
                  <span className="text-muted-foreground">{prayer.arabicName}</span>
                  {prayer.completed && (
                    <CheckCircle className="h-4 w-4 text-green-500 ml-2 inline" />
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-4 flex justify-end">
            <Button 
              onClick={markPrayerCompleted} 
              disabled={!selectedPrayer || dailyPrayers.find(p => p.name === selectedPrayer)?.completed}
              size="sm" 
              variant="outline"
            >
              <CalendarCheck className="mr-2 h-4 w-4" />
              Mark as Completed
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm">
          <span className="font-medium">{completedCount}/5</span> prayers completed
        </div>
        <Button 
          onClick={handleSubmitPrayers} 
          disabled={completedCount === 0 || !salahTask}
          size="sm"
        >
          Submit for Points
        </Button>
      </CardFooter>
    </Card>
  );
}
