import { useState } from "react";
import { useData } from "@/context/DataContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Gift, 
  Plus, 
  Search, 
  SlidersHorizontal,
  Sparkles,
  X
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RewardCard } from "@/components/user/RewardCard";
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
import { UserKeysDisplay } from "@/components/user/UserKeysDisplay";
import { useKeys, KEY_TYPES, KEY_DISPLAY, KeyType } from "@/hooks/data/useKeys";

const RewardsPage = () => {
  const { currentUser } = useAuth();
  const { rewards, addReward } = useData();
  const { addRewardKeyRequirements } = useKeys();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("cost-low");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointCost, setPointCost] = useState(50);
  const [approvalKeyRequired, setApprovalKeyRequired] = useState(false);
  const [category, setCategory] = useState("general");
  const [keyRequirements, setKeyRequirements] = useState<{ keyType: KeyType; quantity: number }[]>([]);

  const isAdmin = currentUser?.role === "admin";

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPointCost(50);
    setApprovalKeyRequired(false);
    setCategory("general");
    setKeyRequirements([]);
  };

  const handleAddReward = async () => {
    if (!title || !description || pointCost <= 0) return;

    await addReward({
      title,
      description,
      pointCost,
      approvalKeyRequired,
      category
    });

    // Get the newly created reward and add key requirements
    // Note: We need to fetch the reward ID after creation
    // For now, key requirements can be added via edit

    resetForm();
    setIsAdding(false);
  };

  const addKeyRequirement = () => {
    setKeyRequirements([...keyRequirements, { keyType: 'copper', quantity: 1 }]);
  };

  const removeKeyRequirement = (index: number) => {
    setKeyRequirements(keyRequirements.filter((_, i) => i !== index));
  };

  const updateKeyRequirement = (index: number, field: 'keyType' | 'quantity', value: any) => {
    const updated = [...keyRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setKeyRequirements(updated);
  };

  // Get all unique categories
  const categories = ["all", ...new Set(rewards.map(reward => reward.category || "general"))];

  // Filter and sort rewards
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || reward.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort rewards based on selected option
  const sortedRewards = [...filteredRewards].sort((a, b) => {
    if (sortBy === "cost-high") {
      return b.pointCost - a.pointCost;
    } else if (sortBy === "cost-low") {
      return a.pointCost - b.pointCost;
    } else if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "alphabetical") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const canAfford = (cost: number) => currentUser && currentUser.points >= cost;
  const affordableRewards = rewards.filter(reward => canAfford(reward.pointCost));

  return (
    <PageLayout requireAuth title="Rewards">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rewards</h1>
            <p className="text-muted-foreground">
              Spend your points on exciting rewards
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Reward
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rewards..."
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
                    <SelectItem value="cost-low">Lowest Cost</SelectItem>
                    <SelectItem value="cost-high">Highest Cost</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="all" value={categoryFilter} onValueChange={setCategoryFilter}>
              <TabsList className="mb-4 overflow-auto">
                {categories.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={categoryFilter}>
                {sortedRewards.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {sortedRewards.map((reward) => (
                      <RewardCard key={reward.id} reward={reward} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <h3 className="text-lg font-medium mb-2">No rewards found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Try adjusting your search or filters." : 
                        isAdmin ? "Click the 'Add Reward' button to create your first reward." 
                          : "There are no rewards available yet. Check back later!"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Your Points</CardTitle>
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{currentUser?.points || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {affordableRewards.length === 0 
                    ? "Keep earning to unlock rewards!" 
                    : `You can afford ${affordableRewards.length} rewards`}
                </p>
              </CardContent>
            </Card>

            <UserKeysDisplay />

            <Card>
              <CardHeader>
                <CardTitle>Reward Categories</CardTitle>
                <CardDescription>Filter rewards by category</CardDescription>
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
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured Rewards</CardTitle>
                <CardDescription>Special rewards to aim for</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {rewards
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map(reward => (
                      <li key={reward.id} className="flex justify-between items-center">
                        <span className="text-sm truncate max-w-[180px]">{reward.title}</span>
                        <Badge variant="secondary">
                          <Gift className="h-3 w-3 mr-1" />
                          {reward.pointCost}
                        </Badge>
                      </li>
                    ))
                  }
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Reward Dialog */}
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Reward</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Reward title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reward description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pointCost">Point Cost</Label>
                  <Input
                    id="pointCost"
                    type="number"
                    min={1}
                    value={pointCost}
                    onChange={(e) => setPointCost(Number(e.target.value))}
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
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="activities">Activities</SelectItem>
                      <SelectItem value="toys">Toys</SelectItem>
                      <SelectItem value="privileges">Privileges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="approval">Requires Approval</Label>
                <Switch
                  id="approval"
                  checked={approvalKeyRequired}
                  onCheckedChange={setApprovalKeyRequired}
                />
              </div>
              
              {/* Key Requirements - Note: Add via edit after creation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Required Keys (add after creation via edit)</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can add key requirements after creating the reward by clicking the edit button.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReward}>Create Reward</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default RewardsPage;
