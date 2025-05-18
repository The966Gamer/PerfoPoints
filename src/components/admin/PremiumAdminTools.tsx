
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldAlert, BarChart, Settings, Mail, Key, Award, Clock, Download, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { BarChart3 } from "lucide-react";

export function PremiumAdminTools() {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [emailType, setEmailType] = useState("announcement");
  
  const handleSendEmail = () => {
    if (!emailSubject || !emailBody) {
      toast.error("Please fill in both subject and message");
      return;
    }
    
    toast.success("Email scheduled for sending", {
      description: `${selectedUsers.length || "All"} recipients will receive this email shortly.`
    });
    
    // Reset form
    setEmailSubject("");
    setEmailBody("");
    setSelectedUsers([]);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Premium Admin Tools</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Advanced Analytics
            </CardTitle>
            <CardDescription>
              Get deeper insights into user behavior and app usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded-lg p-3">
                <div className="text-sm font-medium mb-1">Total Tasks</div>
                <div className="text-2xl font-bold">247</div>
                <div className="text-xs text-green-500">+12% this week</div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="text-sm font-medium mb-1">Completion Rate</div>
                <div className="text-2xl font-bold">67%</div>
                <div className="text-xs text-green-500">+5% this week</div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="text-sm font-medium mb-1">Active Users</div>
                <div className="text-2xl font-bold">38</div>
                <div className="text-xs text-red-500">-2% this week</div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="text-sm font-medium mb-1">Points Awarded</div>
                <div className="text-2xl font-bold">1,560</div>
                <div className="text-xs text-green-500">+18% this week</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <BarChart className="h-4 w-4 mr-2" /> View Full Analytics
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Bulk Email Notifications
            </CardTitle>
            <CardDescription>
              Send custom emails to all users or selected groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailType">Email Type</Label>
                <Select value={emailType} onValueChange={setEmailType}>
                  <SelectTrigger id="emailType">
                    <SelectValue placeholder="Select email type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="reminder">Task Reminder</SelectItem>
                    <SelectItem value="reward">New Reward Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailSubject">Subject Line</Label>
                <Input 
                  id="emailSubject" 
                  placeholder="Email subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailBody">Message</Label>
                <Textarea 
                  id="emailBody" 
                  placeholder="Type your message here..."
                  rows={4}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showAdvancedOptions}
                  onCheckedChange={setShowAdvancedOptions}
                />
                <Label htmlFor="advanced-options">Show advanced options</Label>
              </div>
              
              {showAdvancedOptions && (
                <div className="border rounded-md p-3 space-y-3 bg-muted/30">
                  <div className="text-sm font-medium">Scheduling</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Clock className="h-3 w-3 mr-1" /> Schedule
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-3 w-3 mr-1" /> Save Draft
                    </Button>
                  </div>
                  <div className="text-sm font-medium mt-2">Templates</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm">Welcome</Button>
                    <Button variant="outline" size="sm">Reminder</Button>
                    <Button variant="outline" size="sm">Reward</Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSendEmail}>
              Send Email
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              API Integration
            </CardTitle>
            <CardDescription>
              Connect with third-party services via our API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <h4 className="font-medium">Google Calendar</h4>
                  <p className="text-xs text-muted-foreground">Sync tasks with Google Calendar</p>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <h4 className="font-medium">Microsoft 365</h4>
                  <p className="text-xs text-muted-foreground">Integrate with Microsoft Teams</p>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <h4 className="font-medium">Slack</h4>
                  <p className="text-xs text-muted-foreground">Send notifications to Slack</p>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Generate API Key
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Advanced System Settings
            </CardTitle>
            <CardDescription>
              Configure premium system behaviors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Automated Approvals</h4>
                  <p className="text-xs text-muted-foreground">Auto-approve requests from trusted users</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Daily Backups</h4>
                  <p className="text-xs text-muted-foreground">Create daily backups of all data</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Advanced Reports</h4>
                  <p className="text-xs text-muted-foreground">Generate weekly performance reports</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="font-medium">AI Recommendations</h4>
                  <p className="text-xs text-muted-foreground">Suggest tasks based on user behavior</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full">
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
