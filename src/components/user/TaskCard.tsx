
import { Task } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useState, useEffect } from "react";
import { Check, Clock, Image, Loader2, X, Edit, Trash2, Plus, KeyRound } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { useKeys, KEY_TYPES, KEY_DISPLAY, KeyType, TaskKeyReward } from "@/hooks/data/useKeys";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { currentUser } = useAuth();
  const { createPointRequest, requests, updateTask, deleteTask } = useData();
  const { theme } = useTheme();
  const { fetchTaskKeyRewards, addTaskKeyRewards } = useKeys();
  
  const [requesting, setRequesting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [keyRewards, setKeyRewards] = useState<TaskKeyReward[]>([]);
  
  // Edit dialog state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editPointValue, setEditPointValue] = useState(task.pointValue);
  const [editCategory, setEditCategory] = useState(task.category || "general");
  const [editRecurring, setEditRecurring] = useState(task.recurring || false);
  const [editKeyRewards, setEditKeyRewards] = useState<{ keyType: KeyType; quantity: number }[]>([]);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isAdmin = currentUser?.role === "admin";
  
  // Check if there's a pending request for this task
  const hasPendingRequest = requests.some(
    req => req.taskId === task.id && req.status === "pending"
  );

  useEffect(() => {
    const loadKeyRewards = async () => {
      const rewards = await fetchTaskKeyRewards(task.id);
      setKeyRewards(rewards);
    };
    loadKeyRewards();
  }, [task.id]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Please upload an image smaller than 10MB");
        return;
      }
      
      setSelectedImage(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Please upload an image smaller than 10MB");
        return;
      }
      
      setSelectedImage(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };
  
  const removeImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };
  
  const handleRequestPoints = async () => {
    setDialogOpen(false);
    try {
      setRequesting(true);
      
      let photoUrl = null;
      
      if (selectedImage) {
        setUploadingImage(true);
        
        try {
          const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('task-proofs');
          if (bucketError && bucketError.message.includes('does not exist')) {
            await supabase.storage.createBucket('task-proofs', { public: true });
          }
          
          const fileName = `${currentUser?.id}-${task.id}-${Date.now()}.${selectedImage.name.split('.').pop()}`;
          const { error } = await supabase.storage
            .from('task-proofs')
            .upload(fileName, selectedImage);
            
          if (error) throw error;
          
          const { data } = supabase.storage.from('task-proofs').getPublicUrl(fileName);
          photoUrl = data.publicUrl;
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Failed to upload image proof");
          return;
        } finally {
          setUploadingImage(false);
        }
      }
      
      await createPointRequest(task.id, photoUrl, comment);
      
      setSelectedImage(null);
      setPreviewUrl(null);
      setComment("");
      
    } catch (error) {
      toast.error("Failed to request points");
    } finally {
      setRequesting(false);
    }
  };
  
  const handleEdit = async () => {
    try {
      await updateTask(task.id, {
        title: editTitle,
        description: editDescription,
        pointValue: editPointValue,
        category: editCategory,
        recurring: editRecurring
      });
      
      // Update key rewards
      await addTaskKeyRewards(task.id, editKeyRewards);
      
      setIsEditing(false);
      
      // Refresh key rewards
      const rewards = await fetchTaskKeyRewards(task.id);
      setKeyRewards(rewards);
    } catch (error) {
      toast.error("Failed to update task");
    }
  };
  
  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };
  
  const openEditDialog = async () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPointValue(task.pointValue);
    setEditCategory(task.category || "general");
    setEditRecurring(task.recurring || false);
    
    // Load existing key rewards
    const rewards = await fetchTaskKeyRewards(task.id);
    setEditKeyRewards(rewards.map(r => ({ keyType: r.keyType, quantity: r.quantity })));
    
    setIsEditing(true);
  };

  const addKeyReward = () => {
    setEditKeyRewards([...editKeyRewards, { keyType: 'copper', quantity: 1 }]);
  };

  const removeKeyReward = (index: number) => {
    setEditKeyRewards(editKeyRewards.filter((_, i) => i !== index));
  };

  const updateKeyReward = (index: number, field: 'keyType' | 'quantity', value: any) => {
    const updated = [...editKeyRewards];
    updated[index] = { ...updated[index], [field]: value };
    setEditKeyRewards(updated);
  };
  
  return (
    <>
      <Card className={`task-card transition-all duration-300 hover:shadow-lg border
        ${theme === 'dark' 
          ? 'bg-gray-800/75 backdrop-blur border-gray-700 hover:border-gray-600' 
          : 'bg-white/80 backdrop-blur hover:bg-white'}
      `}>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openEditDialog}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="points-badge px-2 py-1 bg-primary/15 text-primary rounded-md text-sm font-semibold">
                +{task.pointValue} points
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-2">
          <p className="text-sm text-muted-foreground">{task.description}</p>
          
          {/* Key Rewards Display */}
          {keyRewards.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <KeyRound className="h-4 w-4 text-amber-500 mr-1" />
              {keyRewards.map((kr, i) => {
                const keyInfo = KEY_DISPLAY[kr.keyType];
                return (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {keyInfo.emoji} +{kr.quantity} {keyInfo.name}
                  </Badge>
                );
              })}
            </div>
          )}
          
          {task.deadline && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Clock size={12} />
              <span>Due {format(new Date(task.deadline), "MMM d, yyyy")}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-2">
          {hasPendingRequest ? (
            <Button variant="secondary" disabled className="w-full group">
              <Check size={16} className="mr-1 text-green-500" />
              <span className="mr-1">Requested</span>
              <span className="text-xs text-muted-foreground">(Pending approval)</span>
            </Button>
          ) : (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full group transition-all"
                  variant="default"
                >
                  <span className="flex items-center">
                    Complete Task
                    <Image size={16} className="ml-2 opacity-70 group-hover:opacity-100" />
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className={`sm:max-w-md 
                ${theme === 'dark' ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95'}`}
              >
                <DialogHeader>
                  <DialogTitle>Complete Task: {task.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="comment">Add a comment (optional)</Label>
                    <Textarea 
                      id="comment" 
                      placeholder="Add details about how you completed this task"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className={`min-h-24 ${theme === 'dark' ? 'bg-gray-700/50' : ''}`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Upload photo proof (optional)</Label>
                    <div className="grid gap-2">
                      {previewUrl && (
                        <div className="relative border rounded-md overflow-hidden group">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-auto object-cover max-h-[200px]" 
                          />
                          <button 
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1 bg-black/70 rounded-full 
                                       text-white opacity-70 hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      
                      {!previewUrl && (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`
                            flex flex-col justify-center items-center gap-2
                            border-2 border-dashed rounded-md p-8 cursor-pointer
                            transition-all duration-200
                            ${dragActive ? 'border-primary bg-primary/5' : 'border-muted hover:bg-muted/50'}
                            ${theme === 'dark' ? 'hover:border-gray-500' : ''}
                          `}
                        >
                          <Image size={32} className={dragActive ? 'text-primary' : 'text-muted-foreground'} />
                          <div className="text-center">
                            <p className={dragActive ? 'text-primary' : 'text-muted-foreground'}>
                              Drag and drop your image here
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                          </div>
                          <Label
                            htmlFor="image" 
                            className="mt-2 cursor-pointer text-sm px-3 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                          >
                            Select file
                          </Label>
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        id="image" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleRequestPoints} 
                      disabled={requesting}
                    >
                      {requesting ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit for Approval'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-points">Point Value</Label>
                <Input
                  id="edit-points"
                  type="number"
                  min={1}
                  value={editPointValue}
                  onChange={(e) => setEditPointValue(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
                    <SelectValue />
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
            <div className="flex items-center gap-2">
              <Input
                id="edit-recurring"
                type="checkbox"
                className="w-4 h-4"
                checked={editRecurring}
                onChange={(e) => setEditRecurring(e.target.checked)}
              />
              <Label htmlFor="edit-recurring">Recurring task</Label>
            </div>
            
            {/* Key Rewards */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Key Rewards</Label>
                <Button type="button" variant="outline" size="sm" onClick={addKeyReward}>
                  <Plus className="h-4 w-4 mr-1" /> Add Key
                </Button>
              </div>
              {editKeyRewards.map((kr, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select 
                    value={kr.keyType} 
                    onValueChange={(v) => updateKeyReward(index, 'keyType', v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KEY_TYPES.map(kt => (
                        <SelectItem key={kt} value={kt}>
                          {KEY_DISPLAY[kt].emoji} {KEY_DISPLAY[kt].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={kr.quantity}
                    onChange={(e) => updateKeyReward(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeKeyReward(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
