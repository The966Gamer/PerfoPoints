
import { useState } from "react";
import { Task } from "@/types";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { Check, Image, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { TaskProofUploader } from "./TaskProofUploader";

interface TaskCardFooterProps {
  task: Task;
}

export function TaskCardFooter({ task }: TaskCardFooterProps) {
  const { currentUser } = useAuth();
  const { createPointRequest, requests } = useData();
  const { theme } = useTheme();
  
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
              
              <TaskProofUploader
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                previewUrl={previewUrl}
                setPreviewUrl={setPreviewUrl}
              />
              
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
  );
}
