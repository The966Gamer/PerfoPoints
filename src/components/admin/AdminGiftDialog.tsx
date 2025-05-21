
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
import { User } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AdminGiftDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

export function AdminGiftDialog({ open, onClose, user }: AdminGiftDialogProps) {
  const [giftType, setGiftType] = useState<"points" | "keys">("points");
  const [points, setPoints] = useState<number>(0);
  const [keyType, setKeyType] = useState<string>("gold");
  const [keyQuantity, setKeyQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Implement grant functions directly
  const grantPoints = async (userId: string, amount: number, reason: string) => {
    try {
      // First get the current points from the profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const currentPoints = profile.points || 0;
      const newTotal = currentPoints + amount;
      
      // Update the user's points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: newTotal })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // Record the points transaction
      const { error: historyError } = await supabase
        .from('points_history')
        .insert({
          user_id: userId,
          points: amount,
          new_total: newTotal,
          type: 'admin_gift',
          reason
        });
        
      if (historyError) throw historyError;
      
      toast.success(`Granted ${amount} points successfully!`);
      return true;
    } catch (error) {
      console.error("Error granting points:", error);
      toast.error("Failed to grant points");
      return false;
    }
  };
  
  const grantKeys = async (userId: string, keyType: string, quantity: number, reason: string) => {
    try {
      // Check if user already has keys of this type
      const { data: existingKeys, error: fetchError } = await supabase
        .from('user_keys')
        .select('*')
        .eq('user_id', userId)
        .eq('key_type', keyType)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      let newTotal = quantity;
      
      if (existingKeys) {
        // Update existing keys
        newTotal = existingKeys.quantity + quantity;
        const { error: updateError } = await supabase
          .from('user_keys')
          .update({ quantity: newTotal })
          .eq('id', existingKeys.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new key record
        const { error: insertError } = await supabase
          .from('user_keys')
          .insert({
            user_id: userId,
            key_type: keyType,
            quantity
          });
          
        if (insertError) throw insertError;
      }
      
      // Record key transaction in history
      const { error: historyError } = await supabase
        .from('keys_history')
        .insert({
          user_id: userId,
          key_type: keyType,
          quantity,
          new_total: newTotal,
          type: 'admin_gift',
          reason
        });
        
      if (historyError) throw historyError;
      
      toast.success(`Granted ${quantity} ${keyType} key(s) successfully!`);
      return true;
    } catch (error) {
      console.error("Error granting keys:", error);
      toast.error("Failed to grant keys");
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      if (giftType === "points") {
        if (points <= 0) {
          toast.error("Please enter a valid number of points");
          setIsSubmitting(false);
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
          setIsSubmitting(false);
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
