
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CustomRequestFormDialogProps {
  buttonVariant?: "default" | "outline" | "secondary";
  buttonSize?: "default" | "sm" | "lg";
  defaultType?: "task" | "reward" | "other";
}

export function CustomRequestFormDialog({
  buttonVariant = "default",
  buttonSize = "default",
  defaultType = "task"
}: CustomRequestFormDialogProps) {
  const { submitCustomRequest } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requestType, setRequestType] = useState<"task" | "reward" | "other">(defaultType);
  const [submitting, setSubmitting] = useState(false);
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRequestType(defaultType);
  };
  
  const handleSubmit = async () => {
    if (!title) {
      toast.error("Please enter a title for your request");
      return;
    }
    
    try {
      setSubmitting(true);
      
      await submitCustomRequest({
        title,
        description,
        type: requestType,
        userId: "",  // Will be set in the hook with current user
        status: "pending",
        username: ""  // Will be set in the hook
      });
      
      resetForm();
      setIsOpen(false);
      toast.success("Your request has been submitted!");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          <Plus className="h-4 w-4 mr-2" />
          Request New {requestType === "task" ? "Task" : requestType === "reward" ? "Reward" : "Item"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit New Request</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="request-type">Request Type</Label>
            <Select 
              value={requestType} 
              onValueChange={(value) => setRequestType(value as "task" | "reward" | "other")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">New Task</SelectItem>
                <SelectItem value="reward">New Reward</SelectItem>
                <SelectItem value="other">Other Request</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="request-title">Title</Label>
            <Input
              id="request-title"
              placeholder={`Enter ${requestType} title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="request-description">Description</Label>
            <Textarea
              id="request-description"
              placeholder={`Provide details about the ${requestType} you're requesting`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
