
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { PointRequest } from "@/types";

interface RequestListProps {
  limit?: number;
}

const RequestList = ({ limit }: RequestListProps) => {
  const { requests, reviewPointRequest } = useData();
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  
  // Sort requests by status (pending first) and then by date (newest first)
  const sortedRequests = [...requests]
    .sort((a, b) => {
      // Sort by status (pending first)
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      
      // Then sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  
  const displayRequests = limit ? sortedRequests.slice(0, limit) : sortedRequests;
  
  const handleReview = async (requestId: string, approved: boolean) => {
    setProcessing(prev => ({ ...prev, [requestId]: true }));
    try {
      await reviewPointRequest(requestId, approved);
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };
  
  const getStatusBadgeClass = (status: PointRequest['status']) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "denied": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "";
    }
  };
  
  return (
    <div className="overflow-x-auto">
      {displayRequests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No point requests to display
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="py-3 px-4 font-medium">User</th>
              <th className="py-3 px-4 font-medium">Task</th>
              <th className="py-3 px-4 font-medium">Points</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayRequests.map((request) => (
              <tr key={request.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4">{request.username}</td>
                <td className="py-3 px-4">{request.taskTitle}</td>
                <td className="py-3 px-4 font-medium">{request.pointValue}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{format(new Date(request.createdAt), "MMM d, h:mm a")}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  {request.status === "pending" ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleReview(request.id, false)}
                        disabled={processing[request.id]}
                      >
                        <X size={16} />
                        <span className="sr-only md:not-sr-only md:ml-2">Deny</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-green-200 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleReview(request.id, true)}
                        disabled={processing[request.id]}
                      >
                        <Check size={16} />
                        <span className="sr-only md:not-sr-only md:ml-2">Approve</span>
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {request.reviewedBy ? "Reviewed" : "No action needed"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RequestList;
