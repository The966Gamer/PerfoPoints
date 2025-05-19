
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";
import { toast } from "sonner";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all tasks
  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Map database columns to frontend naming
      const mappedTasks: Task[] = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        category: task.category || "general",
        pointValue: task.points_value,
        recurring: task.recurring || false,
        autoReset: task.recurring || false, // Set autoReset same as recurring
        status: task.status === "active" ? "active" : "inactive",
        createdAt: task.created_at,
        createdBy: task.created_by || null,
        deadline: null, // Not in the database schema
      }));
      
      setTasks(mappedTasks);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      // Map frontend naming to database columns
      const dbTask = {
        title: task.title,
        description: task.description,
        points_value: task.pointValue,
        recurring: task.recurring || false,
        category: task.category,
        status: task.status || "active",
        created_by: userId,
        // We don't include deadline as it's not in the database
      };
      
      const { error } = await supabase
        .from("tasks")
        .insert([dbTask]);
      
      if (error) throw error;
      
      toast.success("Task created successfully!");
      fetchAllTasks();
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.message);
    }
  };

  // Update an existing task
  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    try {
      // Map frontend naming to database columns
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.pointValue !== undefined) dbUpdates.points_value = updates.pointValue;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.recurring !== undefined) dbUpdates.recurring = updates.recurring;
      // We don't include deadline as it's not in the database
      
      const { error } = await supabase
        .from("tasks")
        .update(dbUpdates)
        .eq("id", taskId);
      
      if (error) throw error;
      
      toast.success("Task updated successfully!");
      fetchAllTasks();
      return true;
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error(error.message);
      return false;
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);
      
      if (error) throw error;
      
      toast.success("Task deleted successfully!");
      fetchAllTasks();
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error(error.message);
    }
  };

  return {
    tasks,
    loading,
    fetchAllTasks,
    createTask,
    updateTask,
    deleteTask,
    // Alias for compatibility
    addTask: createTask
  };
}
