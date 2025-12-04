import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RedemptionSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  rewardTitle: string;
  pointsSpent: number;
  remainingPoints: number;
}

export function RedemptionSuccessDialog({
  open,
  onClose,
  rewardTitle,
  pointsSpent,
  remainingPoints,
}: RedemptionSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center border-2 border-primary/20 overflow-hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="flex flex-col items-center gap-4 py-6"
            >
              {/* Celebration icon */}
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <Gift className="w-12 h-12 text-primary" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-2 -right-2"
                >
                  <PartyPopper className="w-8 h-8 text-yellow-500" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-1 -left-2"
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-primary"
              >
                Congratulations! 🎉
              </motion.h2>

              {/* Reward name */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-1"
              >
                <p className="text-muted-foreground">You've redeemed</p>
                <p className="text-xl font-semibold">{rewardTitle}</p>
              </motion.div>

              {/* Points info */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-6 mt-2"
              >
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Points Spent</p>
                  <p className="text-lg font-bold text-destructive">-{pointsSpent}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-lg font-bold text-primary">{remainingPoints}</p>
                </div>
              </motion.div>

              {/* Close button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 w-full"
              >
                <Button onClick={onClose} className="w-full" size="lg">
                  Awesome!
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
