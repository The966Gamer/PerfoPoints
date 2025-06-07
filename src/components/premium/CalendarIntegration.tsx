
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, Clock, Settings, RefreshCw, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CalendarIntegration() {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("60");
  const [calendarProvider, setCalendarProvider] = useState("google");
  const [autoCreateTasks, setAutoCreateTasks] = useState(true);
  
  const handleConnect = () => {
    toast.success("Calendar connected successfully!", {
      description: "Your tasks will now sync with your calendar."
    });
    setSyncEnabled(true);
  };
  
  const handleSync = () => {
    toast.success("Tasks synced to calendar", {
      description: "All your upcoming tasks have been added to your calendar."
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Calendar Integration</h3>
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
          Premium
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Calendar Sync
            </CardTitle>
            <CardDescription>
              Sync your tasks and deadlines with your favorite calendar app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calendar-provider">Calendar Provider</Label>
                <Select value={calendarProvider} onValueChange={setCalendarProvider}>
                  <SelectTrigger id="calendar-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Calendar</SelectItem>
                    <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                    <SelectItem value="apple">Apple Calendar</SelectItem>
                    <SelectItem value="ical">Generic iCal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Enable Sync</h4>
                  <p className="text-xs text-muted-foreground">Automatically sync tasks to calendar</p>
                </div>
                <Switch
                  checked={syncEnabled}
                  onCheckedChange={setSyncEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Auto-create Tasks</h4>
                  <p className="text-xs text-muted-foreground">Create tasks from calendar events</p>
                </div>
                <Switch
                  checked={autoCreateTasks}
                  onCheckedChange={setAutoCreateTasks}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {syncEnabled ? (
              <Button variant="outline" className="w-full" onClick={handleSync}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
            ) : (
              <Button className="w-full" onClick={handleConnect}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Calendar
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Reminders & Notifications
            </CardTitle>
            <CardDescription>
              Set up automatic reminders for your tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Default Reminder Time</Label>
                <Select value={reminderTime} onValueChange={setReminderTime}>
                  <SelectTrigger id="reminder-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-md p-3 space-y-3 bg-muted/30">
                <div className="text-sm font-medium">Notification Types</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    <Settings className="h-3 w-3 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Settings className="h-3 w-3 mr-2" />
                    Push
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Settings className="h-3 w-3 mr-2" />
                    SMS
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Settings className="h-3 w-3 mr-2" />
                    In-App
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Configure Notifications
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Calendar Events</CardTitle>
          <CardDescription>Recent calendar synchronization activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { event: "Math homework due", time: "Tomorrow 3:00 PM", status: "synced" },
              { event: "Complete daily prayers", time: "Today 6:00 PM", status: "pending" },
              { event: "Clean room", time: "Friday 10:00 AM", status: "synced" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <h4 className="font-medium text-sm">{item.event}</h4>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.status === 'synced' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
