
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/data/useUsers";
import { User } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AdminGiftDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function AdminGiftDialog({ open, onClose, user }: AdminGiftDialogProps) {
  const [giftType, setGiftType] = useState<"points" | "keys">("points");
  const [points, setPoints] = useState<number>(0);
  const [keyType, setKeyType] = useState<string>("gold");
  const [keyQuantity, setKeyQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { grantPoints, grantKeys } = useUsers();

  if (!user) return null;

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      if (giftType === "points") {
        if (points <= 0) {
          toast.error("Please enter a valid number of points");
          return;
        }
        
        const success = await grantPoints(user.id, points, reason);
        if (success) {
          onClose();
          setPoints(0);
          setReason("");
        }
      } else {
        if (keyQuantity <= 0) {
          toast.error("Please enter a valid number of keys");
          return;
        }
        
        const success = await grantKeys(user.id, keyType, keyQuantity, reason);
        if (success) {
          onClose();
          setKeyQuantity(0);
          setReason("");
        }
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
            Grant points or keys to this user. This action will be logged.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="points" value={giftType} onValueChange={(value) => setGiftType(value as "points" | "keys")}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="points">Grant Points</TabsTrigger>
            <TabsTrigger value="keys">Grant Keys</TabsTrigger>
          </TabsList>
          
          <TabsContent value="points" className="space-y-4 mt-4">
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
          </TabsContent>
          
          <TabsContent value="keys" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="keyType">Key Type</Label>
              <Select value={keyType} onValueChange={setKeyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select key type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bronze">Bronze Key</SelectItem>
                  <SelectItem value="silver">Silver Key</SelectItem>
                  <SelectItem value="gold">Gold Key</SelectItem>
                  <SelectItem value="platinum">Platinum Key</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keyQuantity">Quantity</Label>
              <Input
                id="keyQuantity"
                type="number"
                min={1}
                value={keyQuantity}
                onChange={(e) => setKeyQuantity(parseInt(e.target.value) || 0)}
                placeholder="Enter number of keys"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-2">
          <Label htmlFor="reason">Reason (optional)</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you granting this reward?"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Gift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
