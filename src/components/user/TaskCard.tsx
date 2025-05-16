
import { Task } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useState } from "react";
import { Check, Clock, Image, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { currentUser } = useAuth();
  const { createPointRequest, requests } = useData();
  const [requesting, setRequesting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Check if there's a pending request for this task
  const hasPendingRequest = requests.some(
    req => req.taskId === task.id && req.status === "pending"
  );
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };
  
  const handleRequestPoints = async () => {
    setDialogOpen(false);
    try {
      setRequesting(true);
      
      // If there's an image, upload it first
      let photoUrl = null;
      
      if (selectedImage) {
        setUploadingImage(true);
        
        try {
          // Create task-proof bucket if it doesn't exist
          const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('task-proofs');
          if (bucketError && bucketError.message.includes('does not exist')) {
            await supabase.storage.createBucket('task-proofs', { public: true });
          }
          
          // Upload image
          const fileName = `${currentUser?.id}-${task.id}-${Date.now()}.${selectedImage.name.split('.').pop()}`;
          const { error } = await supabase.storage
            .from('task-proofs')
            .upload(fileName, selectedImage);
            
          if (error) throw error;
          
          // Get public URL
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
      
      // Create request with photo URL and comment
      await createPointRequest(task.id, photoUrl, comment);
      
      // Clear form
      setSelectedImage(null);
      setPreviewUrl(null);
      setComment("");
      
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full"
                variant="default"
              >
                Complete Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
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
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Upload photo proof (optional)</Label>
                  <div className="grid gap-2">
                    {previewUrl && (
                      <div className="border rounded-md overflow-hidden">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-auto object-cover max-h-[200px]" 
                        />
                      </div>
                    )}
                    <Label 
                      htmlFor="image" 
                      className={`flex justify-center items-center gap-2 border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-muted/50 transition-colors ${previewUrl ? 'border-primary/50' : 'border-muted'}`}
                    >
                      <Image size={24} className={previewUrl ? 'text-primary' : 'text-muted-foreground'} />
                      <span className={previewUrl ? 'text-primary' : 'text-muted-foreground'}>
                        {previewUrl ? 'Change photo' : 'Click to upload photo proof'}
                      </span>
                    </Label>
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
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
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
  );
}
