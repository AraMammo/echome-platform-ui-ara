import { useState, useEffect } from "react";
import { useMilestoneStore } from "@/stores/milestone-store";

export function useMilestoneTracker(fileCount: number) {
  const { shouldCelebrate, markMilestoneCelebrated, initializeMilestones } =
    useMilestoneStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<number | null>(null);

  // Initialize milestones from localStorage on mount
  useEffect(() => {
    initializeMilestones();
  }, [initializeMilestones]);

  // Check for milestones when file count changes
  useEffect(() => {
    const milestone = shouldCelebrate(fileCount);
    if (milestone) {
      setCurrentMilestone(milestone);
      setShowCelebration(true);
    }
  }, [fileCount, shouldCelebrate]);

  const handleCloseCelebration = () => {
    if (currentMilestone) {
      markMilestoneCelebrated(currentMilestone);
    }
    setShowCelebration(false);
    setCurrentMilestone(null);
  };

  return {
    showCelebration,
    currentMilestone,
    handleCloseCelebration,
  };
}
