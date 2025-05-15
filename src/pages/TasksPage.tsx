
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { TaskCard } from "@/components/user/TaskCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";

const TasksPage = () => {
  const { currentUser } = useAuth();
  const { tasks, addTask, updateTask, deleteTask } = useData();
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state for creating/editing tasks
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointValue, setPointValue] = useState(10);
  const [deadline, setDeadline] = useState("");
  const [autoReset, setAutoReset] = useState(true);
  
  const isAdmin = currentUser?.role === "admin";
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPointValue(10);
    setDeadline("");
    setAutoReset(true);
  };
  
  const handleAddTask = async () => {
    if (!title || !description || pointValue <= 0) return;
    
    await addTask({
      title,
      description,
      pointValue,
      deadline: deadline || undefined,
      autoReset
    });
    
    resetForm();
    setIsAdding(false);
  };
  
  return (
    <PageLayout requireAuth title="Tasks">
      <div className="space-y-6">
        {isAdmin && (
          <div className="flex justify-end">
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Task title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Task description"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="points">Point Value</Label>
                    <Input
                      id="points"
                      type="number"
                      min={1}
                      value={pointValue}
                      onChange={(e) => setPointValue(Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline (Optional)</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="autoReset"
                      type="checkbox"
                      className="w-4 h-4"
                      checked={autoReset}
                      onChange={(e) => setAutoReset(e.target.checked)}
                    />
                    <Label htmlFor="autoReset">Auto-reset after completion</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTask}>Create Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
        
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium mb-2">No tasks available</h3>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "Click the 'Add Task' button to create your first task." 
                : "There are no tasks available yet. Check back later!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TasksPage;
