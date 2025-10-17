"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Progress } from "@/components/atoms/progress";
import { useToast } from "@/components/atoms/toast/use-toast";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { contentKitService, BatchJobStatus } from "@/services/content-kit";

interface BatchStatusTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  onViewContentKit?: (jobId: string) => void;
}

export default function BatchStatusTracker({
  isOpen,
  onClose,
  batchId,
  onViewContentKit,
}: BatchStatusTrackerProps) {
  const [batchStatus, setBatchStatus] = useState<BatchJobStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen || !batchId) return;

    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const status = await contentKitService.getBatchStatus(batchId);
        if (isMounted) {
          setBatchStatus(status);
          setIsLoading(false);

          // Stop polling if batch is completed or failed
          if (status.status === "COMPLETED" || status.status === "FAILED") {
            clearInterval(pollInterval);

            if (status.status === "COMPLETED") {
              toast({
                title: "Batch Complete! 🎉",
                description: `${status.completedItems}/${status.totalItems} content kits generated successfully`,
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch batch status:", error);
        if (isMounted) {
          setIsLoading(false);
          toast({
            title: "Error Loading Batch",
            description:
              error instanceof Error ? error.message : "Unknown error",
            variant: "destructive",
          });
        }
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 2 seconds while processing
    const pollInterval = setInterval(() => {
      if (
        batchStatus?.status !== "COMPLETED" &&
        batchStatus?.status !== "FAILED"
      ) {
        fetchStatus();
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [isOpen, batchId, batchStatus?.status, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="text-green-500" size={20} />;
      case "FAILED":
        return <XCircle className="text-red-500" size={20} />;
      case "PROCESSING":
        return <Loader2 className="text-blue-500 animate-spin" size={20} />;
      case "PENDING":
        return <Clock className="text-stone-400" size={20} />;
      default:
        return <Clock className="text-stone-400" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600 bg-green-50";
      case "FAILED":
        return "text-red-600 bg-red-50";
      case "PROCESSING":
        return "text-blue-600 bg-blue-50";
      case "PENDING":
        return "text-stone-600 bg-stone-50";
      default:
        return "text-stone-600 bg-stone-50";
    }
  };

  const progressPercentage = batchStatus
    ? Math.round(
        ((batchStatus.completedItems + batchStatus.failedItems) /
          batchStatus.totalItems) *
          100
      )
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-zinc-900">
            {batchStatus?.batchName || "Batch Generation"}
          </DialogTitle>
          <DialogDescription className="text-stone-600">
            Track progress of your batch content generation
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#3a8e9c]" />
          </div>
        ) : batchStatus ? (
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Overall Progress */}
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-zinc-900">
                  Overall Progress
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(batchStatus.status)}`}
                >
                  {batchStatus.status}
                </span>
              </div>

              <Progress value={progressPercentage} className="h-3 mb-3" />

              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-zinc-900">
                    {batchStatus.totalItems}
                  </div>
                  <div className="text-xs text-stone-600">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {batchStatus.processedItems}
                  </div>
                  <div className="text-xs text-stone-600">Processing</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {batchStatus.completedItems}
                  </div>
                  <div className="text-xs text-stone-600">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {batchStatus.failedItems}
                  </div>
                  <div className="text-xs text-stone-600">Failed</div>
                </div>
              </div>
            </div>

            {/* Item Details */}
            <div>
              <h3 className="font-semibold text-zinc-900 mb-3">
                Items ({batchStatus.itemDetails.length})
              </h3>
              <div className="space-y-2">
                {batchStatus.itemDetails
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div
                      key={item.itemId}
                      className="bg-white border border-stone-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(item.status)}
                            <span className="font-semibold text-zinc-900">
                              Item #{item.order + 1}
                            </span>
                            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">
                              {item.inputType}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(item.status)}`}
                            >
                              {item.status}
                            </span>
                          </div>

                          {typeof item.inputData.text === "string" &&
                            item.inputData.text && (
                              <p className="text-sm text-stone-600 truncate">
                                {item.inputData.text.slice(0, 100)}
                                {item.inputData.text.length > 100 ? "..." : ""}
                              </p>
                            )}

                          {item.error && (
                            <p className="text-sm text-red-600 mt-2">
                              Error: {item.error}
                            </p>
                          )}

                          {item.jobId && item.status === "COMPLETED" && (
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  onViewContentKit &&
                                  onViewContentKit(item.jobId!)
                                }
                                className="text-[#3a8e9c] border-[#3a8e9c] hover:bg-[#3a8e9c]/10"
                              >
                                <ExternalLink size={14} className="mr-2" />
                                View Content Kit
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-stone-600">No batch data available</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <div className="text-xs text-stone-500">
            {batchStatus && (
              <>
                Started: {new Date(batchStatus.createdAt).toLocaleString()}
                {batchStatus.updatedAt && (
                  <>
                    {" "}
                    • Updated:{" "}
                    {new Date(batchStatus.updatedAt).toLocaleString()}
                  </>
                )}
              </>
            )}
          </div>
          <Button onClick={onClose} className="bg-[#3a8e9c] hover:bg-[#2d7a85]">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
