import { apiClient } from "./api-client";

export interface VoiceSnapshot {
  id: string;
  userId: string;
  fileCount: number;
  milestone: number;
  snapshotData: {
    voiceProfile: Record<string, unknown>;
    contentBreakdown: {
      emails: number;
      documents: number;
      videos: number;
      audio: number;
    };
    avgTemperature: number;
    dominantTone: string;
  };
  createdAt: string;
  label?: string;
}

export interface VoiceComparison {
  snapshotA: VoiceSnapshot;
  snapshotB: VoiceSnapshot;
  differences: {
    toneShift: number;
    styleChange: number;
    vocabularyDrift: number;
  };
  summary: string;
}

export interface VoiceDriftAlert {
  detected: boolean;
  severity: "low" | "medium" | "high";
  changes: Array<{
    metric: string;
    previousValue: string | number;
    currentValue: string | number;
    change: string;
  }>;
  recommendation: string;
  affectedBy?: string[];
}

export interface VoiceTimeline {
  snapshots: VoiceSnapshot[];
  currentFileCount: number;
  consistencyScore: number;
  improvementSinceStart: number;
  recentChanges: Array<{
    date: string;
    filesAdded: number;
    impact: string;
    metric: string;
  }>;
}

export interface CreateSnapshotRequest {
  milestone: number;
  label?: string;
}

export interface CreateSnapshotResponse {
  success: boolean;
  data: VoiceSnapshot;
}

export interface CompareSnapshotsRequest {
  snapshotAId: string;
  snapshotBId: string;
}

export interface CompareSnapshotsResponse {
  success: boolean;
  data: VoiceComparison;
}

export interface DetectVoiceDriftResponse {
  success: boolean;
  data: VoiceDriftAlert;
}

export interface GetTimelineResponse {
  success: boolean;
  data: VoiceTimeline;
}

export interface RollbackRequest {
  snapshotId: string;
  confirm: boolean;
}

export interface RollbackResponse {
  success: boolean;
  message: string;
  restoredSnapshot: VoiceSnapshot;
}

class VoiceSnapshotService {
  /**
   * Create a new voice snapshot at a milestone
   */
  async createSnapshot(
    request: CreateSnapshotRequest
  ): Promise<CreateSnapshotResponse> {
    const response = await apiClient.post<CreateSnapshotResponse>(
      "/voice-snapshot/create",
      request
    );

    return response;
  }

  /**
   * Compare two voice snapshots
   */
  async compareSnapshots(
    request: CompareSnapshotsRequest
  ): Promise<CompareSnapshotsResponse> {
    const response = await apiClient.post<CompareSnapshotsResponse>(
      "/voice-snapshot/compare",
      request
    );

    return response;
  }

  /**
   * Detect voice drift from baseline
   */
  async detectVoiceDrift(): Promise<DetectVoiceDriftResponse> {
    const response = await apiClient.get<DetectVoiceDriftResponse>(
      "/voice-snapshot/drift"
    );

    return response;
  }

  /**
   * Get voice timeline with all snapshots
   */
  async getTimeline(): Promise<GetTimelineResponse> {
    const response = await apiClient.get<GetTimelineResponse>(
      "/voice-snapshot/timeline"
    );

    return response;
  }

  /**
   * Get all snapshots for the user
   */
  async getSnapshots(): Promise<{ success: boolean; data: VoiceSnapshot[] }> {
    const response = await apiClient.get<{
      success: boolean;
      data: VoiceSnapshot[];
    }>("/voice-snapshot/list");

    return response;
  }

  /**
   * Get a specific snapshot by ID
   */
  async getSnapshot(
    snapshotId: string
  ): Promise<{ success: boolean; data: VoiceSnapshot }> {
    const response = await apiClient.get<{
      success: boolean;
      data: VoiceSnapshot;
    }>(`/voice-snapshot/${snapshotId}`);

    return response;
  }

  /**
   * Rollback to a previous voice snapshot
   */
  async rollbackToSnapshot(
    request: RollbackRequest
  ): Promise<RollbackResponse> {
    const response = await apiClient.post<RollbackResponse>(
      "/voice-snapshot/rollback",
      request
    );

    return response;
  }

  /**
   * Delete a snapshot
   */
  async deleteSnapshot(
    snapshotId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/voice-snapshot/${snapshotId}`);

    return response;
  }

  /**
   * Auto-create snapshots at milestones (10, 25, 50, 100 files)
   */
  async autoCreateMilestoneSnapshot(
    fileCount: number
  ): Promise<CreateSnapshotResponse | null> {
    const milestones = [10, 25, 50, 100, 200];

    if (milestones.includes(fileCount)) {
      return this.createSnapshot({
        milestone: fileCount,
        label: `${fileCount} Files Milestone`,
      });
    }

    return null;
  }
}

export const voiceSnapshotService = new VoiceSnapshotService();
