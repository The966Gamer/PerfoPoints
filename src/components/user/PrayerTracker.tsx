
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Pray, CheckCircle } from 'lucide-react';

interface Prayer {
  name: string;
  arabicName: string;
  time: string;
  completed: boolean;
}

export function PrayerTracker() {
  const { currentUser } = useAuth();
  const { submitPointRequest, tasks } = useData();
  const [dailyPrayers, setDailyPrayers] = useState<Prayer[]>([
    { name: 'Fajr', arabicName: 'الفجر', time: 'Dawn', completed: false },
    { name: 'Dhuhr', arabicName: 'الظهر', time: 'Noon', completed: false },
    { name: 'Asr', arabicName: 'العصر', time: 'Afternoon', completed: false },
    { name: 'Maghrib', arabicName: 'المغرب', time: 'Sunset', completed: false },
    { name: 'Isha', arabicName: 'العشاء', time: 'Night', completed: false },
  ]);
  const [todayDate, setTodayDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Find the Salah task
  const salahTask = tasks.find(task => 
    task.title.toLowerCase().includes('salah') || 
    task.title.toLowerCase().includes('prayer') ||
    task.category?.toLowerCase() === 'prayer'
  );

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

  const handlePrayerToggle = (index: number) => {
    const newPrayers = [...dailyPrayers];
    newPrayers[index].completed = !newPrayers[index].completed;
    setDailyPrayers(newPrayers);
  };

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
      toast.success("Prayer tracking submitted successfully!");
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
          <Pray className="h-5 w-5 text-primary" />
          Daily Prayer Tracker
        </CardTitle>
        <CardDescription>Track your five daily prayers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dailyPrayers.map((prayer, index) => (
            <div key={prayer.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id={`prayer-${prayer.name}`} 
                  checked={prayer.completed}
                  onCheckedChange={() => handlePrayerToggle(index)}
                />
                <div>
                  <Label htmlFor={`prayer-${prayer.name}`} className="font-medium">
                    {prayer.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">{prayer.time}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground text-right">
                {prayer.arabicName}
                {prayer.completed && (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-2 inline" />
                )}
              </div>
            </div>
          ))}
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
