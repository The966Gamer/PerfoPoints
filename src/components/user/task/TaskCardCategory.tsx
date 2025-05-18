
import { Badge } from "@/components/ui/badge";

interface TaskCardCategoryProps {
  category?: string;
}

export function TaskCardCategory({ category = "general" }: TaskCardCategoryProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "chores":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "homework":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "learning":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "exercise":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "reading":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300";
    }
  };

  return category ? (
    <Badge 
      variant="outline" 
      className={`text-xs font-normal ${getCategoryColor(category)}`}
    >
      {category}
    </Badge>
  ) : null;
}
