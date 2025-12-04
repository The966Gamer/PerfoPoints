
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUsers } from "@/hooks/data/useUsers";

interface AdminGiftDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

export function AdminGiftDialog({ open, onClose, user }: AdminGiftDialogProps) {
  const [points, setPoints] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { grantPoints } = useUsers();

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      if (points <= 0) {
        toast.error("Please enter a valid number of points");
        setIsSubmitting(false);
        return;
      }
      
      const success = await grantPoints(user.id, points, reason);
      if (success) {
        setPoints(0);
        setReason("");
        onClose();
      }
    } catch (error) {
      console.error("Gift error:", error);
      toast.error("Failed to send gift");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Gift to {user.username}</DialogTitle>
          <DialogDescription>
            Grant bonus points to this user. This action will be logged.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="points">Points Amount</Label>
            <Input
              id="points"
              type="number"
              min={1}
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              placeholder="Enter number of points"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you granting this reward?"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Points"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
