import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KeyRound, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KEY_DISPLAY, KeyType } from "@/hooks/data/useKeys";

interface KeyGiftNotificationProps {
  open: boolean;
  onClose: () => void;
  keyType: KeyType;
  quantity: number;
  reason?: string;
}

export function KeyGiftNotification({
  open,
  onClose,
  keyType,
  quantity,
  reason,
}: KeyGiftNotificationProps) {
  const keyInfo = KEY_DISPLAY[keyType];

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
              {/* Key icon */}
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="relative"
              >
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center`}>
                  <span className="text-5xl">{keyInfo.emoji}</span>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                </motion.div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-primary"
              >
                You Received a Gift! 🎁
              </motion.h2>

              {/* Key info */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <p className="text-muted-foreground">An admin has gifted you</p>
                <p className={`text-2xl font-bold ${keyInfo.color}`}>
                  {quantity}x {keyInfo.name} Key{quantity > 1 ? 's' : ''}
                </p>
                {reason && (
                  <p className="text-sm text-muted-foreground italic">"{reason}"</p>
                )}
              </motion.div>

              {/* Close button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
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
