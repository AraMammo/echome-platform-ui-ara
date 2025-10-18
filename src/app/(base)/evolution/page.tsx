"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import { AlertCircle, Camera, TrendingUp, X } from "lucide-react";
import { useVoiceEvolutionStore } from "@/stores/voice-evolution-store";

export default function EvolutionPage() {
  const {
    timeline,
    snapshots,
    driftAlert,
    isDriftDismissed,
    loadTimeline,
    loadSnapshots,
    createSnapshot,
    compareSnapshots,
    dismissDriftAlert,
  } = useVoiceEvolutionStore();

  const [selectedSnapshot, setSelectedSnapshot] = useState<string>();
  const [compareWith, setCompareWith] = useState<string>();

  useEffect(() => {
    loadTimeline();
    loadSnapshots();
  }, [loadTimeline, loadSnapshots]);

  const handleCreateSnapshot = async () => {
    await createSnapshot(timeline?.currentFileCount || 0, "Manual snapshot");
  };

  const handleCompare = async () => {
    if (!selectedSnapshot || !compareWith) return;
    await compareSnapshots(selectedSnapshot, compareWith);
  };

  // Calculate timeline position for milestones
  const getMilestonePosition = (fileCount: number) => {
    const maxFiles = Math.max(
      timeline?.currentFileCount || 0,
      ...snapshots.map((s) => s.fileCount)
    );
    return (fileCount / Math.max(maxFiles, 100)) * 100;
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-medium text-[#1c1c1e]">
            Voice Evolution Timeline
          </h1>
          <p className="text-lg text-[#9b8baf]">
            Track how your AI voice has improved over time
          </p>
        </div>

        {/* Drift Alert */}
        {driftAlert && driftAlert.detected && !isDriftDismissed && (
          <div className="mb-6 rounded-[20px] border border-orange-300 bg-orange-50 p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="mb-2 text-lg font-medium text-[#1c1c1e]">
                    Voice Drift Detected ({driftAlert.severity} severity)
                  </h3>
                  <p className="mb-3 text-sm text-[#9b8baf]">
                    {driftAlert.recommendation}
                  </p>
                  <ul className="space-y-1">
                    {driftAlert.changes.map((change, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-[#1c1c1e]"
                      >
                        <span className="text-orange-600">•</span>
                        {change.metric}: {String(change.previousValue)} →{" "}
                        {String(change.currentValue)} ({change.change})
                      </li>
                    ))}
                  </ul>
                  {driftAlert.affectedBy &&
                    driftAlert.affectedBy.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-[#9b8baf]">
                          Affected by: {driftAlert.affectedBy.join(", ")}
                        </p>
                      </div>
                    )}
                  <Button
                    onClick={() => {
                      /* Navigate to snapshot restore */
                    }}
                    className="mt-4 bg-orange-600 hover:bg-orange-700"
                  >
                    Review Changes
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={dismissDriftAlert}
                className="border-orange-300 text-orange-600 hover:bg-orange-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Voice Metrics Dashboard */}
        {timeline && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-[#3a8e9c]/20 bg-[#3a8e9c]/5 p-6">
              <p className="mb-2 text-sm text-[#9b8baf]">Consistency Score</p>
              <p className="text-3xl font-medium text-[#3a8e9c]">
                {timeline.consistencyScore}%
              </p>
            </div>
            <div className="rounded-[20px] border border-[#9b8baf]/20 bg-[#9b8baf]/5 p-6">
              <p className="mb-2 text-sm text-[#9b8baf]">Overall Improvement</p>
              <p className="text-3xl font-medium text-[#9b8baf]">
                +{timeline.improvementSinceStart}%
              </p>
            </div>
            <div className="rounded-[20px] border border-[#b4a398]/20 bg-[#b4a398]/5 p-6">
              <p className="mb-2 text-sm text-[#9b8baf]">Files Trained</p>
              <p className="text-3xl font-medium text-[#b4a398]">
                {timeline.currentFileCount}
              </p>
            </div>
          </div>
        )}

        {/* Timeline Visualization */}
        <div className="mb-8 rounded-[20px] border border-[#d5d2cc] bg-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-medium text-[#1c1c1e]">
              Training Timeline
            </h2>
            <Button
              onClick={handleCreateSnapshot}
              className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
            >
              <Camera className="mr-2 h-4 w-4" />
              Save Current Snapshot
            </Button>
          </div>

          {/* Timeline Bar */}
          <div className="relative mb-8 h-2 rounded-full bg-[#f3f1ec]">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#3a8e9c] to-[#9b8baf]"
              style={{
                width: `${getMilestonePosition(timeline?.currentFileCount || 0)}%`,
              }}
            />

            {/* Milestone Markers */}
            {snapshots.map((snapshot, index) => (
              <div
                key={snapshot.id}
                className="absolute -top-2"
                style={{ left: `${getMilestonePosition(snapshot.fileCount)}%` }}
              >
                <div className="relative">
                  <div
                    className={`h-6 w-6 rounded-full border-4 border-white ${
                      snapshot.milestone > 0 ? "bg-[#3a8e9c]" : "bg-[#9b8baf]"
                    }`}
                  />
                  <div className="absolute top-8 -left-12 w-24 text-center">
                    <p className="text-xs font-medium text-[#1c1c1e]">
                      {snapshot.fileCount} files
                    </p>
                    {snapshot.milestone > 0 && (
                      <p className="text-xs text-[#9b8baf]">Milestone</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-12 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#3a8e9c]" />
              <span className="text-[#9b8baf]">Milestone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#9b8baf]" />
              <span className="text-[#9b8baf]">Manual Snapshot</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Impact */}
        {timeline && timeline.recentChanges.length > 0 && (
          <div className="mb-8 rounded-[20px] border border-[#d5d2cc] bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-[#1c1c1e]">
              Recent Training Impact
            </h3>
            <div className="space-y-3">
              {timeline.recentChanges.slice(0, 5).map((change, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 border-b border-[#f3f1ec] pb-3 last:border-0"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3a8e9c]/10">
                    <TrendingUp className="h-4 w-4 text-[#3a8e9c]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1c1c1e]">
                      {change.metric}: {change.impact}
                    </p>
                    <p className="text-xs text-[#9b8baf]">
                      {new Date(change.date).toLocaleDateString()} •{" "}
                      {change.filesAdded} files added
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Snapshot List */}
        <div className="rounded-[20px] border border-[#d5d2cc] bg-white p-6">
          <h3 className="mb-4 text-lg font-medium text-[#1c1c1e]">
            Saved Snapshots ({snapshots.length})
          </h3>

          {snapshots.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-2 text-[#9b8baf]">No snapshots saved yet</p>
              <p className="text-sm text-[#9b8baf]">
                Save snapshots to track your voice evolution
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="flex items-center justify-between rounded-[10px] border border-[#d5d2cc] bg-[#f3f1ec] p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-[#1c1c1e]">
                          {snapshot.label ||
                            `Snapshot at ${snapshot.fileCount} files`}
                        </h4>
                        {snapshot.milestone > 0 && (
                          <span className="rounded-full bg-[#3a8e9c] px-2 py-0.5 text-xs text-white">
                            {snapshot.milestone} Files Milestone
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#9b8baf]">
                        {new Date(snapshot.createdAt).toLocaleDateString()} •{" "}
                        {snapshot.fileCount} files trained
                      </p>
                      {snapshot.snapshotData && (
                        <div className="mt-2 flex gap-4 text-xs text-[#9b8baf]">
                          <span>
                            Tone: {snapshot.snapshotData.dominantTone}
                          </span>
                          <span>
                            Temp:{" "}
                            {snapshot.snapshotData.avgTemperature.toFixed(1)}
                          </span>
                          <span>
                            Content:{" "}
                            {Object.values(
                              snapshot.snapshotData.contentBreakdown
                            ).reduce((a, b) => a + b, 0)}{" "}
                            items
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSnapshot(snapshot.id)}
                        className={
                          selectedSnapshot === snapshot.id
                            ? "border-[#3a8e9c] bg-[#3a8e9c]/10 text-[#3a8e9c]"
                            : "border-[#d5d2cc] text-[#9b8baf]"
                        }
                      >
                        {selectedSnapshot === snapshot.id
                          ? "Selected"
                          : "Select"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          /* Restore snapshot */
                        }}
                        className="border-[#9b8baf] text-[#9b8baf] hover:bg-[#9b8baf]/10"
                      >
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Compare Snapshots Section */}
          {snapshots.length >= 2 && (
            <div className="mt-6 rounded-[10px] border-2 border-dashed border-[#d5d2cc] p-4">
              <h4 className="mb-3 text-sm font-medium text-[#1c1c1e]">
                Compare Snapshots
              </h4>
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedSnapshot || ""}
                  onChange={(e) => setSelectedSnapshot(e.target.value)}
                  className="rounded-[10px] border border-[#d5d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1e]"
                >
                  <option value="">Select first snapshot</option>
                  {snapshots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label || `${s.fileCount} files`} (
                      {new Date(s.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <span className="flex items-center text-[#9b8baf]">vs</span>
                <select
                  value={compareWith || ""}
                  onChange={(e) => setCompareWith(e.target.value)}
                  className="rounded-[10px] border border-[#d5d2cc] bg-white px-3 py-2 text-sm text-[#1c1c1e]"
                >
                  <option value="">Select second snapshot</option>
                  {snapshots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label || `${s.fileCount} files`} (
                      {new Date(s.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleCompare}
                  disabled={!selectedSnapshot || !compareWith}
                  className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
                >
                  Compare
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
