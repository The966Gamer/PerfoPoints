
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Award, Users, Clock, CheckSquare, CalendarCheck } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'green' | 'yellow' | 'blue' | 'purple' | 'red';
}

export function StatCard({ 
  title, 
  value, 
  description, 
  trend, 
  trendValue,
  icon,
  color = 'primary'
}: StatCardProps) {
  // Map colors to gradient classes
  const colorMap = {
    'primary': 'from-primary/10 to-primary/5',
    'green': 'from-green-500/10 to-green-500/5',
    'yellow': 'from-yellow-500/10 to-yellow-500/5',
    'blue': 'from-blue-500/10 to-blue-500/5',
    'purple': 'from-purple-500/10 to-purple-500/5',
    'red': 'from-red-500/10 to-red-500/5'
  };

  // Map colors to text classes
  const textColorMap = {
    'primary': 'text-primary',
    'green': 'text-green-500',
    'yellow': 'text-yellow-500',
    'blue': 'text-blue-500',
    'purple': 'text-purple-500',
    'red': 'text-red-500'
  };

  return (
    <Card className={`bg-gradient-to-br ${colorMap[color]}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon && <div className={textColorMap[color]}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        
        {trend && (
          <div className={`text-xs flex items-center mt-2 ${
            trend === 'up' 
              ? 'text-green-500' 
              : trend === 'down' 
                ? 'text-red-500' 
                : 'text-muted-foreground'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : null}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Task Completion Rate"
        value="76%"
        description="Based on this week"
        trend="up"
        trendValue="12% this week"
        icon={<CheckSquare className="h-4 w-4" />}
        color="primary"
      />
      
      <StatCard
        title="Active Users"
        value="42"
        description="Regular users"
        trend="up"
        trendValue="8% this month"
        icon={<Users className="h-4 w-4" />}
        color="blue"
      />
      
      <StatCard
        title="Average Daily Points"
        value="125"
        description="Per active user"
        trend="up"
        trendValue="5% this week"
        icon={<Award className="h-4 w-4" />}
        color="yellow"
      />
      
      <StatCard
        title="Task Streak"
        value="5.2"
        description="Average days"
        trend="down"
        trendValue="2% this week"
        icon={<CalendarCheck className="h-4 w-4" />}
        color="green"
      />
    </div>
  );
}
