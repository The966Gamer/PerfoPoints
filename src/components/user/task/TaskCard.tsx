
import { Task } from "@/types";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { TaskCardHeader } from "./TaskCardHeader";
import { TaskCardContent } from "./TaskCardContent";
import { TaskCardFooter } from "./TaskCardFooter";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { theme } = useTheme();
  
  return (
    <Card className={`task-card transition-all duration-300 hover:shadow-lg border
      ${theme === 'dark' 
        ? 'bg-gray-800/75 backdrop-blur border-gray-700 hover:border-gray-600' 
        : 'bg-white/80 backdrop-blur hover:bg-white'}
    `}>
      <TaskCardHeader task={task} />
      <TaskCardContent task={task} />
      <TaskCardFooter task={task} />
    </Card>
  );
}
