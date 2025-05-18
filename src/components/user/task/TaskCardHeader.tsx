
import { Task } from "@/types";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface TaskCardHeaderProps {
  task: Task;
}

export function TaskCardHeader({ task }: TaskCardHeaderProps) {
  return (
    <CardHeader className="p-4 pb-2">
      <div className="flex justify-between items-start">
        <CardTitle className="text-lg">{task.title}</CardTitle>
        <div className="points-badge px-2 py-1 bg-primary/15 text-primary rounded-md text-sm font-semibold">
          +{task.pointValue} points
        </div>
      </div>
    </CardHeader>
  );
}
