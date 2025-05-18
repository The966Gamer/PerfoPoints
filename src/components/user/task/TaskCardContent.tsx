
import { Task } from "@/types";
import { CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface TaskCardContentProps {
  task: Task;
}

export function TaskCardContent({ task }: TaskCardContentProps) {
  return (
    <CardContent className="p-4 pt-0 pb-2">
      <p className="text-sm text-muted-foreground">{task.description}</p>
      
      {task.deadline && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
          <Clock size={12} />
          <span>Due {format(new Date(task.deadline), "MMM d, yyyy")}</span>
        </div>
      )}
    </CardContent>
  );
}
