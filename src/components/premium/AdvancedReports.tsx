
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Calendar, Download, FileText, PieChart, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function AdvancedReports() {
  const reports = [
    {
      title: "Weekly Performance Report",
      description: "Detailed breakdown of tasks, points, and streaks",
      type: "performance",
      lastGenerated: "2 hours ago",
      status: "ready"
    },
    {
      title: "Monthly Progress Summary",
      description: "Monthly achievements and goal tracking",
      type: "summary", 
      lastGenerated: "1 day ago",
      status: "ready"
    },
    {
      title: "Prayer Analytics Report",
      description: "Salah completion rates and timing analysis",
      type: "prayer",
      lastGenerated: "3 hours ago", 
      status: "generating"
    },
    {
      title: "Family Comparison Report",
      description: "Compare progress across all family members",
      type: "family",
      lastGenerated: "5 days ago",
      status: "ready"
    }
  ];

  const handleDownload = (reportTitle: string) => {
    console.log(`Downloading ${reportTitle}`);
  };

  const handleGenerate = (reportTitle: string) => {
    console.log(`Generating ${reportTitle}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Advanced Reports</h3>
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
          Premium
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-2 text-base">
                  {report.type === 'performance' && <TrendingUp className="h-4 w-4 text-primary" />}
                  {report.type === 'summary' && <Calendar className="h-4 w-4 text-primary" />}
                  {report.type === 'prayer' && <Activity className="h-4 w-4 text-primary" />}
                  {report.type === 'family' && <PieChart className="h-4 w-4 text-primary" />}
                  {report.title}
                </CardTitle>
                <Badge variant={report.status === 'ready' ? 'default' : 'secondary'}>
                  {report.status}
                </Badge>
              </div>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Last generated: {report.lastGenerated}
                </div>
                
                {report.status === 'generating' && (
                  <div className="space-y-2">
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-muted-foreground">Generating report... 65% complete</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {report.status === 'ready' ? (
                    <>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownload(report.title)}
                      >
                        <Download className="h-3 w-3 mr-2" />
                        Download
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleGenerate(report.title)}
                      >
                        <FileText className="h-3 w-3 mr-2" />
                        Regenerate
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="flex-1" disabled>
                      <FileText className="h-3 w-3 mr-2" />
                      Generating...
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
          <CardDescription>Key metrics from your latest reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">92%</div>
              <div className="text-sm text-muted-foreground">Task Completion Rate</div>
              <div className="text-xs text-green-500 mt-1">↑ 8% from last week</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">127</div>
              <div className="text-sm text-muted-foreground">Avg Points/Week</div>
              <div className="text-xs text-green-500 mt-1">↑ 15% from last month</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">18</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
              <div className="text-xs text-yellow-500 mt-1">Personal best!</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
