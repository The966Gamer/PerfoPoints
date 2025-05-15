
import { Task } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { createPointRequest, requests } = useData();
  const [requesting, setRequesting] = useState(false);
  
  // Check if there's a pending request for this task
  const hasPendingRequest = requests.some(
    req => req.taskId === task.id && req.status === "pending"
  );
  
  const handleRequestPoints = async () => {
    try {
      setRequesting(true);
      await createPointRequest(task.id);
    } catch (error) {
      toast.error("Failed to request points");
    } finally {
      setRequesting(false);
    }
  };
  
  return (
    <Card className="task-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <div className="points-badge">+{task.pointValue}</div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2">
        <p className="text-sm text-muted-foreground">{task.description}</p>
        
        {task.deadline && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Clock size={12} />
            <span>Due {format(new Date(task.deadline), "MMM d, yyyy")}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-2">
        {hasPendingRequest ? (
          <Button variant="secondary" disabled className="w-full">
            <Check size={16} className="mr-1" />
            Requested
          </Button>
        ) : (
          <Button 
            onClick={handleRequestPoints} 
            disabled={requesting}
            className="w-full"
          >
            {requesting ? "Requesting..." : "Complete Task"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
