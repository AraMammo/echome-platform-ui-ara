"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { useToast } from "@/components/atoms/toast/use-toast";
import { Plus, X, Loader2 } from "lucide-react";
import { contentKitService, BatchItem } from "@/services/content-kit";

interface BatchGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCreated: (batchId: string) => void;
}

interface BatchItemInput extends BatchItem {
  tempId: string;
  label: string;
}

export default function BatchGenerationModal({
  isOpen,
  onClose,
  onBatchCreated,
}: BatchGenerationModalProps) {
  const [batchName, setBatchName] = useState("");
  const [items, setItems] = useState<BatchItemInput[]>([]);
  const [currentInputType, setCurrentInputType] = useState<
    "video" | "prompt" | "voice_note" | "social_import"
  >("prompt");
  const [currentText, setCurrentText] = useState("");
  const [currentFileId, setCurrentFileId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setBatchName("");
    setItems([]);
    setCurrentInputType("prompt");
    setCurrentText("");
    setCurrentFileId("");
  };

  const addItem = () => {
    if (!currentText && !currentFileId) {
      toast({
        title: "Input Required",
        description: "Please provide text or file ID",
        variant: "destructive",
      });
      return;
    }

    const newItem: BatchItemInput = {
      tempId: `temp-${Date.now()}`,
      inputType: currentInputType,
      inputData:
        currentInputType === "prompt" || currentInputType === "voice_note"
          ? { text: currentText }
          : { fileId: currentFileId },
      label:
        currentInputType === "prompt"
          ? currentText.slice(0, 50) + (currentText.length > 50 ? "..." : "")
          : `${currentInputType}: ${currentFileId}`,
    };

    setItems([...items, newItem]);
    setCurrentText("");
    setCurrentFileId("");

    toast({
      title: "Item Added",
      description: `Added ${currentInputType} to batch (${items.length + 1}/10)`,
    });
  };

  const removeItem = (tempId: string) => {
    setItems(items.filter((item) => item.tempId !== tempId));
  };

  const handleSubmit = async () => {
    if (!batchName.trim()) {
      toast({
        title: "Batch Name Required",
        description: "Please provide a name for this batch",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item to the batch",
        variant: "destructive",
      });
      return;
    }

    if (items.length > 10) {
      toast({
        title: "Too Many Items",
        description: "Maximum 10 items per batch",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await contentKitService.generateBatch({
        batchName: batchName.trim(),
        items: items.map(({ tempId: _tempId, label: _label, ...item }) => item),
      });

      toast({
        title: "Batch Created! 🎉",
        description: `Processing ${items.length} content kit${items.length > 1 ? "s" : ""}`,
      });

      onBatchCreated(response.batchId);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create batch:", error);
      toast({
        title: "Batch Creation Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-zinc-900">
            Create Batch Generation
          </DialogTitle>
          <DialogDescription className="text-stone-600">
            Generate multiple content kits at once (max 10 items)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Batch Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Batch Name *
            </label>
            <Input
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g., Weekly Content - March 2025"
              className="w-full"
              disabled={isSubmitting}
            />
          </div>

          {/* Add Item Section */}
          <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
            <h3 className="font-semibold text-zinc-900 mb-3">Add Item</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">
                  Input Type
                </label>
                <Select
                  value={currentInputType}
                  onValueChange={(
                    value: "video" | "prompt" | "voice_note" | "social_import"
                  ) => setCurrentInputType(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prompt">Text Prompt</SelectItem>
                    <SelectItem value="video">Video (File ID)</SelectItem>
                    <SelectItem value="voice_note">Voice Note</SelectItem>
                    <SelectItem value="social_import">Social Import</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(currentInputType === "prompt" ||
                currentInputType === "voice_note") && (
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Content Text
                  </label>
                  <Textarea
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    placeholder="Enter your content text..."
                    className="min-h-[100px]"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {(currentInputType === "video" ||
                currentInputType === "social_import") && (
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    File ID
                  </label>
                  <Input
                    value={currentFileId}
                    onChange={(e) => setCurrentFileId(e.target.value)}
                    placeholder="Enter file ID..."
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <Button
                onClick={addItem}
                disabled={items.length >= 10 || isSubmitting}
                className="w-full bg-[#3a8e9c] hover:bg-[#2d7a85]"
              >
                <Plus size={16} className="mr-2" />
                Add to Batch ({items.length}/10)
              </Button>
            </div>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div>
              <h3 className="font-semibold text-zinc-900 mb-3">
                Batch Items ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.tempId}
                    className="flex items-center justify-between bg-white border border-stone-200 rounded-lg p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900">
                          #{index + 1}
                        </span>
                        <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">
                          {item.inputType}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 truncate mt-1">
                        {item.label}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.tempId)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <div className="text-sm text-stone-600">
            {items.length === 0 && "Add items to get started"}
            {items.length > 0 &&
              items.length < 10 &&
              `${items.length} item${items.length > 1 ? "s" : ""} ready`}
            {items.length === 10 && "Maximum items reached"}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={items.length === 0 || !batchName.trim() || isSubmitting}
              className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Creating..." : "Create Batch"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
