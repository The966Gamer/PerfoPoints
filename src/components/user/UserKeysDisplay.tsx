import { useKeys, KEY_DISPLAY, KEY_TYPES } from "@/hooks/data/useKeys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export function UserKeysDisplay() {
  const { userKeys, loading } = useKeys();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" /> Your Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-6 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-4 w-4 text-amber-500" /> Your Keys
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {KEY_TYPES.map(keyType => {
            const keyInfo = KEY_DISPLAY[keyType];
            const userKey = userKeys.find(k => k.keyType === keyType);
            const quantity = userKey?.quantity || 0;
            
            return (
              <div 
                key={keyType} 
                className={`flex items-center justify-between p-2 rounded-md ${
                  quantity > 0 ? 'bg-muted/50' : 'opacity-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{keyInfo.emoji}</span>
                  <span className={`text-sm font-medium ${keyInfo.color}`}>
                    {keyInfo.name}
                  </span>
                </span>
                <span className="font-bold tabular-nums">{quantity}</span>
              </div>
            );
          })}
        </div>
        {userKeys.length === 0 || userKeys.every(k => k.quantity === 0) ? (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Complete tasks to earn keys!
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
