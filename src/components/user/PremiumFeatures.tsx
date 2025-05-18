
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Crown, Gift, Medal, Calendar, Star, ShieldCheck, Award, Sparkles } from "lucide-react";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

export function PremiumFeatures() {
  const { currentUser } = useAuth();
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  // Premium feature list
  const features: Feature[] = [
    {
      id: "streak-multiplier",
      title: "Streak Multiplier",
      description: "Earn 1.5x points when maintaining a 5+ day streak",
      icon: <Medal className="h-5 w-5 text-yellow-500" />,
      available: true
    },
    {
      id: "gifting",
      title: "Point Gifting",
      description: "Send points to friends and family members",
      icon: <Gift className="h-5 w-5 text-purple-500" />,
      available: currentUser?.points ? currentUser.points > 100 : false
    },
    {
      id: "challenges",
      title: "Daily Challenges",
      description: "Unlock special limited-time tasks with bonus points",
      icon: <Star className="h-5 w-5 text-orange-500" />,
      available: true
    },
    {
      id: "calendar",
      title: "Task Calendar",
      description: "View and plan your tasks with an interactive calendar",
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      available: false
    },
    {
      id: "family",
      title: "Family Tracking",
      description: "Track progress of everyone in your household",
      icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
      available: false
    }
  ];

  const handleUnlockFeature = (feature: Feature) => {
    if (!feature.available) {
      setSelectedFeature(feature);
      setUnlockModalOpen(true);
    } else {
      toast.success(`${feature.title} is already available!`);
    }
  };

  const handleConfirmUnlock = () => {
    if (selectedFeature) {
      toast(`${selectedFeature.title} will be available soon`, {
        description: "This feature is coming soon to premium users!",
        action: {
          label: "Dismiss",
          onClick: () => console.log("Dismissed"),
        },
      });
      setUnlockModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Crown className="h-5 w-5 text-yellow-500" />
        <h3 className="text-xl font-semibold">Premium Features</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Card 
            key={feature.id}
            className={`transition-all hover:shadow-md ${
              feature.available 
              ? 'border-green-200 dark:border-green-900' 
              : 'border-gray-200 dark:border-gray-800 opacity-70 hover:opacity-100'
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-md font-medium flex items-center gap-2">
                  {feature.icon}
                  {feature.title}
                </CardTitle>
                {feature.available && <Sparkles className="h-4 w-4 text-yellow-500" />}
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button 
                variant={feature.available ? "outline" : "secondary"} 
                size="sm"
                className={feature.available ? "border-green-200 hover:border-green-300" : ""}
                onClick={() => handleUnlockFeature(feature)}
              >
                {feature.available ? "Available" : "Unlock"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Dialog open={unlockModalOpen} onOpenChange={setUnlockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Unlock Premium Feature
            </DialogTitle>
            <DialogDescription>
              Premium features require special access or can be unlocked with achievement points.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeature && (
            <div className="py-4">
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    {selectedFeature.icon}
                    {selectedFeature.title}
                  </CardTitle>
                  <CardDescription>{selectedFeature.description}</CardDescription>
                </CardHeader>
              </Card>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p>This feature is currently being developed and will be available soon!</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlockModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUnlock}>
              Remind Me When Available
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
