
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserMeters, useCreateMeter, useUpdateMeterPercentage, useDeactivateMeter } from "@/hooks/data/useUserMeters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Gauge, Users, User, TrendingUp, TrendingDown, Pause, Play } from "lucide-react";
import { toast } from "sonner";

export function UserMeterManager() {
  const { users } = useAuth();
  const { data: meters, isLoading } = useUserMeters();
  const createMeter = useCreateMeter();
  const updateMeterPercentage = useUpdateMeterPercentage();
  const deactivateMeter = useDeactivateMeter();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<any>(null);
  
  const [createForm, setCreateForm] = useState({
    targetType: "single", // "single" or "all"
    selectedUserId: "",
    meterType: "standard",
    targetPercentage: 100,
    description: ""
  });

  const [updateForm, setUpdateForm] = useState({
    percentageChange: 0,
    reason: ""
  });

  const handleCreateMeter = async () => {
    let userIds: string[] = [];
    
    if (createForm.targetType === "all") {
      userIds = users.filter(u => u.role === "user").map(u => u.id);
    } else if (createForm.selectedUserId) {
      userIds = [createForm.selectedUserId];
    }

    if (userIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    try {
      await createMeter.mutateAsync({
        userIds,
        meterType: createForm.meterType,
        targetPercentage: createForm.targetPercentage,
        description: createForm.description
      });
      setCreateDialogOpen(false);
      setCreateForm({
        targetType: "single",
        selectedUserId: "",
        meterType: "standard",
        targetPercentage: 100,
        description: ""
      });
    } catch (error) {
      console.error("Error creating meter:", error);
    }
  };

  const handleUpdatePercentage = async () => {
    if (!selectedMeter) return;

    try {
      await updateMeterPercentage.mutateAsync({
        userId: selectedMeter.userId,
        percentageChange: updateForm.percentageChange,
        reason: updateForm.reason
      });
      setUpdateDialogOpen(false);
      setUpdateForm({ percentageChange: 0, reason: "" });
      setSelectedMeter(null);
    } catch (error) {
      console.error("Error updating meter:", error);
    }
  };

  const handleDeactivate = async (meterId: string) => {
    try {
      await deactivateMeter.mutateAsync(meterId);
    } catch (error) {
      console.error("Error deactivating meter:", error);
    }
  };

  if (isLoading) {
    return <div>Loading meters...</div>;
  }

  const activeMeters = meters?.filter(m => m.isActive) || [];
  const completedMeters = meters?.filter(m => m.prizeUnlocked) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Percentage Meters</h2>
          <p className="text-muted-foreground">Manage user progress meters and prize unlocks</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Meter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Percentage Meter</DialogTitle>
              <DialogDescription>
                Set up a new percentage meter for users to track their progress
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Target Users</Label>
                <Select value={createForm.targetType} onValueChange={(value) => setCreateForm({...createForm, targetType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single User</SelectItem>
                    <SelectItem value="all">All Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createForm.targetType === "single" && (
                <div>
                  <Label>Select User</Label>
                  <Select value={createForm.selectedUserId} onValueChange={(value) => setCreateForm({...createForm, selectedUserId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.role === "user").map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Meter Type</Label>
                <Input 
                  value={createForm.meterType}
                  onChange={(e) => setCreateForm({...createForm, meterType: e.target.value})}
                  placeholder="e.g., standard, weekly, special"
                />
              </div>

              <div>
                <Label>Target Percentage</Label>
                <Input 
                  type="number"
                  min="1"
                  max="100"
                  value={createForm.targetPercentage}
                  onChange={(e) => setCreateForm({...createForm, targetPercentage: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea 
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  placeholder="Describe what this meter tracks..."
                />
              </div>

              <Button onClick={handleCreateMeter} disabled={createMeter.isPending} className="w-full">
                {createMeter.isPending ? "Creating..." : "Create Meter"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Gauge className="h-4 w-4 mr-2 text-blue-500" />
              Active Meters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMeters.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Play className="h-4 w-4 mr-2 text-green-500" />
              Completed Meters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMeters.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              Average Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeMeters.length > 0 
                ? Math.round(activeMeters.reduce((sum, m) => sum + m.currentPercentage, 0) / activeMeters.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Meters List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Meters</CardTitle>
          <CardDescription>Currently active percentage meters for users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeMeters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active meters found. Create one to get started!
              </div>
            ) : (
              activeMeters.map((meter) => (
                <div key={meter.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{meter.username}</span>
                        <Badge variant="outline">{meter.meterType}</Badge>
                        {meter.prizeUnlocked && (
                          <Badge variant="default" className="bg-green-500">Prize Unlocked!</Badge>
                        )}
                      </div>
                      {meter.description && (
                        <p className="text-sm text-muted-foreground mt-1">{meter.description}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMeter(meter);
                          setUpdateDialogOpen(true);
                        }}
                      >
                        Update
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeactivate(meter.id)}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{meter.currentPercentage}% / {meter.targetPercentage}%</span>
                    </div>
                    <Progress value={meter.currentPercentage} className="h-2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Update Meter Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Meter Percentage</DialogTitle>
            <DialogDescription>
              Adjust the percentage for {selectedMeter?.username}'s meter
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Current: {selectedMeter?.currentPercentage}%</Label>
              <Progress value={selectedMeter?.currentPercentage} className="h-2 mt-1" />
            </div>
            
            <div>
              <Label>Percentage Change</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpdateForm({...updateForm, percentageChange: -10})}
                >
                  <TrendingDown className="h-4 w-4 mr-1" />
                  -10%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpdateForm({...updateForm, percentageChange: -5})}
                >
                  -5%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpdateForm({...updateForm, percentageChange: 5})}
                >
                  +5%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpdateForm({...updateForm, percentageChange: 10})}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +10%
                </Button>
              </div>
              <Input 
                type="number"
                value={updateForm.percentageChange}
                onChange={(e) => setUpdateForm({...updateForm, percentageChange: parseInt(e.target.value) || 0})}
                className="mt-2"
                placeholder="Enter custom change"
              />
            </div>

            <div>
              <Label>Reason for Change</Label>
              <Textarea 
                value={updateForm.reason}
                onChange={(e) => setUpdateForm({...updateForm, reason: e.target.value})}
                placeholder="Explain why you're adjusting the percentage..."
              />
            </div>

            <Button onClick={handleUpdatePercentage} disabled={updateMeterPercentage.isPending} className="w-full">
              {updateMeterPercentage.isPending ? "Updating..." : "Update Percentage"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
