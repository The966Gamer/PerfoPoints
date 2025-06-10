
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, CheckCircle } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { useData } from "@/context/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskCard } from "./task";

interface WeekDay {
  day: string;
  date: Date;
  tasks: any[];
  isToday: boolean;
  hasDatePassed: boolean;
}

export function CalendarPlanner() {
  const { tasks } = useData();
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<WeekDay | null>(null);

  useEffect(() => {
    const today = new Date();
    const startWeek = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const weekDaysList = dayNames.map((dayName, index) => {
      const date = addDays(startWeek, index);
      const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      const hasDatePassed = date < new Date(new Date().setHours(0, 0, 0, 0));
      
      // For demo purposes, assign some tasks to certain days
      let dayTasks: any[] = [];
      if (dayName === 'Wed' || dayName === 'Fri') {
        dayTasks = tasks.slice(0, 1);
      } else if (dayName === 'Sat') {
        dayTasks = tasks.slice(0, 2);
      }
      
      return {
        day: dayName,
        date,
        tasks: dayTasks,
        isToday,
        hasDatePassed
      };
    });
    
    setWeekDays(weekDaysList);
  }, [tasks]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Weekly Task Planner
          </CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
        <CardDescription>Plan your week with these upcoming tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((dayInfo) => (
            <Dialog key={dayInfo.day}>
              <DialogTrigger asChild>
                <div 
                  className={`text-center cursor-pointer transition-all hover:scale-105 ${
                    dayInfo.isToday ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  onClick={() => setSelectedDay(dayInfo)}
                >
                  <div className={`font-medium ${dayInfo.isToday ? 'text-primary' : ''}`}>
                    {dayInfo.day}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(dayInfo.date, 'MMM d')}
                  </div>
                  <div className={`mt-2 h-20 border rounded-md ${
                    dayInfo.isToday ? 'bg-primary/10 border-primary/30' : 
                    dayInfo.hasDatePassed ? 'bg-gray-100 dark:bg-gray-800 opacity-60' :
                    'bg-background/50 hover:bg-primary/5'
                  } flex flex-col items-center justify-center p-1`}>
                    {dayInfo.tasks.length > 0 ? (
                      <div className="space-y-1">
                        <Badge 
                          variant={dayInfo.tasks.length > 1 ? "default" : "secondary"}
                          className={`text-xs px-1 py-0 ${
                            dayInfo.hasDatePassed ? 'opacity-60' : ''
                          }`}
                        >
                          {dayInfo.tasks.length} {dayInfo.tasks.length === 1 ? 'task' : 'tasks'}
                        </Badge>
                        {dayInfo.hasDatePassed && (
                          <div className="flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    Tasks for {dayInfo.day}, {format(dayInfo.date, 'MMMM d, yyyy')}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {dayInfo.tasks.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {dayInfo.tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No tasks scheduled</h3>
                      <p className="text-muted-foreground mb-4">
                        This day is free! You can add tasks or enjoy some rest.
                      </p>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task for This Day
                      </Button>
                    </div>
                  )}
                  
                  {dayInfo.hasDatePassed && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          This day has passed
                        </span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Great job on completing the tasks for this day!
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary/20 border border-primary/30 rounded"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Completed</span>
            </div>
          </div>
          <span>Click any day to view details</span>
        </div>
      </CardContent>
    </Card>
  );
}
