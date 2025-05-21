import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { TaskCard } from "@/components/user/TaskCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  SlidersHorizontal,
  CalendarClock,
  Star,
  BookOpen
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const TasksPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { tasks, addTask, updateTask, deleteTask } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  
  // Form state for creating/editing tasks
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointValue, setPointValue] = useState(10);
  const [deadline, setDeadline] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [category, setCategory] = useState("general");
  
  const isAdmin = currentUser?.role === "admin";
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPointValue(10);
    setDeadline("");
    setRecurring(false);
    setCategory("general");
  };
  
  const handleAddTask = async () => {
    if (!title || !description || pointValue <= 0) return;
    
    await addTask({
      title,
      description,
      pointValue,
      deadline: deadline || null,
      recurring,
      autoReset: recurring,
      status: "active",
      category
    });
    
    resetForm();
    setIsAdding(false);
  };

  // Get all unique categories
  const categories = ["all", ...new Set(tasks.map(task => task.category || "general"))];
  
  // Ensure prayer category exists
  if (!categories.includes("prayer")) {
    categories.push("prayer");
  }
  
  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Sort tasks based on selected option
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "points-high") {
      return b.pointValue - a.pointValue;
    } else if (sortBy === "points-low") {
      return a.pointValue - b.pointValue;
    } else if (sortBy === "alphabetical") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Check if we need to add a daily prayer task
  const hasSalahTask = tasks.some(task => 
    (task.category === 'prayer' || task.title.toLowerCase().includes('salah') || task.title.toLowerCase().includes('prayer')) && 
    task.recurring === true
  );

  return (
    <PageLayout requireAuth title="Tasks">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">Complete tasks to earn points</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/requests")}>
              Request Task
            </Button>
            {isAdmin && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="points-high">Highest Points</SelectItem>
                    <SelectItem value="points-low">Lowest Points</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="all" value={categoryFilter} onValueChange={setCategoryFilter}>
              <TabsList className="mb-4 overflow-auto">
                {categories.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    {cat === 'prayer' ? (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" /> Prayer
                      </div>
                    ) : cat}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={categoryFilter}>
                {categoryFilter === 'prayer' && !hasSalahTask && isAdmin && (
                  <Card className="mb-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" /> Add Daily Prayer Task
                      </CardTitle>
                      <CardDescription>Create a task for tracking daily prayers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        There's currently no prayer tracking task. As an admin, you can add one for users to track their daily prayers.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => {
                        setTitle("Complete Daily Prayers");
                        setDescription("Complete your five daily prayers (Fajr, Dhuhr, Asr, Maghrib, and Isha) and earn points for each day.");
                        setPointValue(25);
                        setCategory("prayer");
                        setRecurring(true);
                        setIsAdding(true);
                      }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Prayer Task
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {sortedTasks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {sortedTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Try adjusting your search or filters." : 
                        isAdmin ? "Click the 'Add Task' button to create your first task." 
                          : "There are no tasks available yet. Check back later!"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Categories</CardTitle>
                <CardDescription>Filter tasks by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(cat => cat !== "all").map(cat => (
                    <Badge 
                      key={cat} 
                      variant={categoryFilter === cat ? "default" : "outline"}
                      className="capitalize cursor-pointer"
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat === 'prayer' ? (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> Prayer
                        </div>
                      ) : cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Valuable Tasks</CardTitle>
                <CardDescription>Tasks with highest point values</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tasks
                    .sort((a, b) => b.pointValue - a.pointValue)
                    .slice(0, 3)
                    .map(task => (
                      <li key={task.id} className="flex justify-between items-center">
                        <span className="text-sm truncate max-w-[180px]">{task.title}</span>
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          {task.pointValue}
                        </Badge>
                      </li>
                    ))
                  }
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Task Dialog */}
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogContent className="sm:max-w-[500px]">
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
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="chores">Chores</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="prayer">Prayer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  id="recurring"
                  type="checkbox"
                  className="w-4 h-4"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                />
                <Label htmlFor="recurring">Recurring task</Label>
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
    </PageLayout>
  );
};

export default TasksPage;
