
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format, isWithinInterval, parseISO, set } from 'date-fns';
import { BookOpen, CheckCircle, CalendarCheck } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Prayer {
  name: string;
  arabicName: string;
  time: string;
  timeRange: string;
  completed: boolean;
  startTime: Date;
  endTime: Date;
}

export function PrayerTracker() {
  const { currentUser } = useAuth();
  const { submitPointRequest, tasks, checkStreak } = useData();
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayDate, setTodayDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Create prayer times dynamically based on current date
  const createPrayerTimes = (date: Date) => {
    const today = date;
    
    const fajrStart = set(today, { hours: 4, minutes: 0 });
    const fajrEnd = set(today, { hours: 6, minutes: 30 });
    
    const dhuhrStart = set(today, { hours: 12, minutes: 0 });
    const dhuhrEnd = set(today, { hours: 15, minutes: 30 });
    
    const asrStart = set(today, { hours: 15, minutes: 30 });
    const asrEnd = set(today, { hours: 18, minutes: 0 });
    
    const maghribStart = set(today, { hours: 18, minutes: 0 });
    const maghribEnd = set(today, { hours: 20, minutes: 0 });
    
    // Isha can span overnight
    const ishaStart = set(today, { hours: 20, minutes: 0 });
    const ishaEnd = set(today, { hours: 4, minutes: 0 });
    // If ishaEnd is before ishaStart, it means it's set to the next day's 4 AM
    if (ishaEnd < ishaStart) {
      ishaEnd.setDate(ishaEnd.getDate() + 1);
    }
    
    return [
      { 
        name: 'Fajr', 
        arabicName: 'الفجر', 
        time: 'Dawn', 
        timeRange: '4:00 AM - 6:30 AM', 
        completed: false,
        startTime: fajrStart,
        endTime: fajrEnd
      },
      { 
        name: 'Dhuhr', 
        arabicName: 'الظهر', 
        time: 'Noon', 
        timeRange: '12:00 PM - 3:30 PM', 
        completed: false,
        startTime: dhuhrStart,
        endTime: dhuhrEnd
      },
      { 
        name: 'Asr', 
        arabicName: 'العصر', 
        time: 'Afternoon', 
        timeRange: '3:30 PM - 6:00 PM', 
        completed: false,
        startTime: asrStart,
        endTime: asrEnd
      },
      { 
        name: 'Maghrib', 
        arabicName: 'المغرب', 
        time: 'Sunset', 
        timeRange: '6:00 PM - 8:00 PM', 
        completed: false,
        startTime: maghribStart,
        endTime: maghribEnd
      },
      { 
        name: 'Isha', 
        arabicName: 'العشاء', 
        time: 'Night', 
        timeRange: '8:00 PM - 4:00 AM', 
        completed: false,
        startTime: ishaStart,
        endTime: ishaEnd
      },
    ];
  };
  
  const [dailyPrayers, setDailyPrayers] = useState<Prayer[]>(createPrayerTimes(new Date()));
  
  // Find the Salah task
  const salahTask = tasks.find(task => 
    task.title.toLowerCase().includes('salah') || 
    task.title.toLowerCase().includes('prayer') ||
    task.category?.toLowerCase() === 'prayer'
  );

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Check if a prayer time is currently active
  const isPrayerTimeActive = (prayer: Prayer) => {
    if (prayer.name === 'Isha' && prayer.endTime < prayer.startTime) {
      // Special case for Isha which spans across days
      return currentTime >= prayer.startTime || currentTime <= prayer.endTime;
    }
    
    return isWithinInterval(currentTime, {
      start: prayer.startTime,
      end: prayer.endTime
    });
  };
  
  // Check if a prayer time has passed
  const hasPrayerTimePassed = (prayer: Prayer) => {
    if (prayer.name === 'Isha' && prayer.endTime < prayer.startTime) {
      // Special case for Isha which spans across days
      return currentTime > prayer.endTime && currentTime < prayer.startTime;
    }
    
    return currentTime > prayer.endTime;
  };
  
  // Get current prayer based on time
  const getCurrentPrayer = () => {
    for (const prayer of dailyPrayers) {
      if (isPrayerTimeActive(prayer)) {
        return prayer.name;
      }
    }
    return null;
  };

  // Load saved prayer data for today
  useEffect(() => {
    if (!currentUser) return;
    
    const savedPrayers = localStorage.getItem(`prayers_${currentUser.id}_${todayDate}`);
    if (savedPrayers) {
      const parsedPrayers = JSON.parse(savedPrayers);
      
      // Merge saved completion status with current time ranges
      const updatedPrayers = createPrayerTimes(new Date()).map(prayer => {
        const savedPrayer = parsedPrayers.find((p: Prayer) => p.name === prayer.name);
        return {
          ...prayer,
          completed: savedPrayer ? savedPrayer.completed : false
        };
      });
      
      setDailyPrayers(updatedPrayers);
    } else {
      // Reset prayers for new day
      setDailyPrayers(createPrayerTimes(new Date()));
    }
    
    // Default select the current prayer time if it's active
    const currentActivePrayer = getCurrentPrayer();
    if (currentActivePrayer) {
      setSelectedPrayer(currentActivePrayer);
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

  const handlePrayerSelect = (prayerName: string) => {
    const prayer = dailyPrayers.find(p => p.name === prayerName);
    
    if (prayer) {
      if (prayer.completed) {
        toast.error(`${prayer.name} prayer has already been completed`);
        return;
      }
      
      if (!isPrayerTimeActive(prayer) && !hasPrayerTimePassed(prayer)) {
        toast.error(`It's not time for ${prayer.name} prayer yet`);
        return;
      }
      
      setSelectedPrayer(prayerName);
    }
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
    } catch (error: any) {
      console.error("Error submitting prayer tracking:", error);
      toast.error("Failed to submit prayer tracking. Please try again.");
    }
  };

  const completedCount = dailyPrayers.filter(p => p.completed).length;
  const currentActivePrayer = getCurrentPrayer();

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Daily Prayer Tracker
        </CardTitle>
        <CardDescription>
          Track your five daily prayers - {format(currentTime, 'h:mm a')}
          {currentActivePrayer && (
            <span className="ml-2 text-primary font-medium">
              Current prayer time: {currentActivePrayer}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RadioGroup 
            value={selectedPrayer || ''}
            onValueChange={handlePrayerSelect}
          >
            {dailyPrayers.map((prayer) => {
              const isActive = isPrayerTimeActive(prayer);
              const hasPassed = hasPrayerTimePassed(prayer);
              const isSelectable = isActive || hasPassed;
              
              return (
                <div key={prayer.name} className="flex items-center justify-between space-x-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={prayer.name} 
                      id={`prayer-${prayer.name}`}
                      disabled={prayer.completed || !isSelectable}
                    />
                    <div>
                      <Label 
                        htmlFor={`prayer-${prayer.name}`} 
                        className={`font-medium ${isActive ? 'text-primary' : ''}`}
                      >
                        {prayer.name}
                        {isActive && <span className="ml-2 text-xs text-primary">(Current)</span>}
                      </Label>
                      <p className="text-xs text-muted-foreground">{prayer.timeRange}</p>
                    </div>
                  </div>
                  <div className="text-sm text-right">
                    <span className="text-muted-foreground">{prayer.arabicName}</span>
                    {prayer.completed && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-2 inline" />
                    )}
                    {!isSelectable && !prayer.completed && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Not yet time)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
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
