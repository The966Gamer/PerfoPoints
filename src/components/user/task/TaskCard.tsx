
import { Task } from "@/types";
import { Card } from "@/components/ui/card";
import { TaskCardHeader } from "./TaskCardHeader";
import { TaskCardContent } from "./TaskCardContent";
import { TaskCardFooter } from "./TaskCardFooter";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className="task-card transition-all duration-300 hover:shadow-lg border bg-white/80 backdrop-blur hover:bg-white dark:bg-gray-800/75 dark:border-gray-700 dark:hover:border-gray-600">
      <TaskCardHeader task={task} />
      <TaskCardContent task={task} />
      <TaskCardFooter task={task} />
    </Card>
  );
}
