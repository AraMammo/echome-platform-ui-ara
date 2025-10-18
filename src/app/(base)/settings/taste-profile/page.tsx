"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/atoms/button";
import { Download, RefreshCw, Settings } from "lucide-react";
import { useTasteProfileStore } from "@/stores/taste-profile-store";

export default function TasteProfilePage() {
  const {
    profile,
    recommendedSettings,
    appliedSettings,
    isLoadingProfile,
    loadProfile,
    loadRecommendedSettings,
    applyRecommendedSettings,
    resetToDefaults,
  } = useTasteProfileStore();

  useEffect(() => {
    loadProfile();
    loadRecommendedSettings();
  }, [loadProfile, loadRecommendedSettings]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return "bg-[#3a8e9c]";
    if (percentage >= 40) return "bg-[#9b8baf]";
    return "bg-[#b4a398]";
  };

  const handleExportData = () => {
    if (!profile) return;

    const exportData = {
      profile,
      recommendedSettings,
      appliedSettings,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taste-profile-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-medium text-[#1c1c1e]">
              Your Taste Profile
            </h1>
            <p className="text-lg text-[#9b8baf]">
              AI-learned preferences from your voting history
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="border-[#d5d2cc] text-[#9b8baf]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={!profile}
              className="border-[#3a8e9c] text-[#3a8e9c] hover:bg-[#3a8e9c]/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingProfile && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#3a8e9c] border-t-transparent" />
              <p className="text-[#9b8baf]">Loading your taste profile...</p>
            </div>
          </div>
        )}

        {/* Profile Data */}
        {!isLoadingProfile && profile && (
          <>
            {/* Learning Status */}
            <div className="mb-8 rounded-[20px] border border-[#3a8e9c]/20 bg-[#3a8e9c]/5 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="mb-1 text-xl font-medium text-[#1c1c1e]">
                    Learning Status
                  </h2>
                  <p className="text-sm text-[#9b8baf]">
                    Based on {profile.totalComparisons} comparison
                    {profile.totalComparisons !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-medium text-[#3a8e9c]">
                    {profile.confidenceScore}%
                  </p>
                  <p className="text-sm text-[#9b8baf]">Confidence</p>
                </div>
              </div>

              {profile.confidenceScore < 50 && (
                <div className="mt-4 rounded-[10px] border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm text-orange-900">
                    Keep voting on comparisons to improve accuracy. We recommend
                    at least 10 comparisons for reliable recommendations.
                  </p>
                </div>
              )}
            </div>

            {/* Preference Breakdown */}
            <div className="mb-8 rounded-[20px] border border-[#d5d2cc] bg-white p-6">
              <h2 className="mb-6 text-xl font-medium text-[#1c1c1e]">
                Your Preferences
              </h2>

              {/* Temperature Preference */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-[#1c1c1e]">
                    Temperature
                  </label>
                  <span className="text-sm text-[#9b8baf]">
                    {profile.patterns.temperaturePreference.value.toFixed(1)} (
                    {profile.patterns.temperaturePreference.percentage}%
                    confidence)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#f3f1ec]">
                  <div
                    className={`h-full ${getProgressColor(profile.patterns.temperaturePreference.percentage)}`}
                    style={{
                      width: `${profile.patterns.temperaturePreference.percentage}%`,
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-[#9b8baf]">
                  <span>0.0 (Precise)</span>
                  <span>1.0 (Creative)</span>
                </div>
              </div>

              {/* Length Preference */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-[#1c1c1e]">
                    Length Preference
                  </label>
                  <span className="text-sm text-[#9b8baf]">
                    {profile.patterns.lengthPreference.value} (
                    {profile.patterns.lengthPreference.percentage}% confidence)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#f3f1ec]">
                  <div
                    className={`h-full ${getProgressColor(profile.patterns.lengthPreference.percentage)}`}
                    style={{
                      width: `${profile.patterns.lengthPreference.percentage}%`,
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-[#9b8baf]">
                  <span>Short</span>
                  <span>Medium</span>
                  <span>Long</span>
                </div>
              </div>

              {/* Tone Preference */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-[#1c1c1e]">
                    Tone Preference
                  </label>
                  <span className="text-sm text-[#9b8baf]">
                    {profile.patterns.tonePreference.value} (
                    {profile.patterns.tonePreference.percentage}% confidence)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#f3f1ec]">
                  <div
                    className={`h-full ${getProgressColor(profile.patterns.tonePreference.percentage)}`}
                    style={{
                      width: `${profile.patterns.tonePreference.percentage}%`,
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-[#9b8baf]">
                  <span>Casual</span>
                  <span>Professional</span>
                  <span>Friendly</span>
                  <span>Authoritative</span>
                </div>
              </div>
            </div>

            {/* Recommended Settings */}
            {recommendedSettings && (
              <div className="mb-8 rounded-[20px] border border-[#9b8baf]/20 bg-[#9b8baf]/5 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="mb-1 text-xl font-medium text-[#1c1c1e]">
                      Recommended Settings
                    </h2>
                    <p className="text-sm text-[#9b8baf]">
                      Based on your voting patterns
                    </p>
                  </div>
                  <Button
                    onClick={applyRecommendedSettings}
                    className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Apply Settings
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-[10px] border border-[#d5d2cc] bg-white p-4">
                    <p className="mb-2 text-sm text-[#9b8baf]">Temperature</p>
                    <p className="text-2xl font-medium text-[#1c1c1e]">
                      {recommendedSettings.temperature.toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-[10px] border border-[#d5d2cc] bg-white p-4">
                    <p className="mb-2 text-sm text-[#9b8baf]">Length</p>
                    <p className="text-2xl font-medium text-[#1c1c1e]">
                      {recommendedSettings.length}
                    </p>
                  </div>
                  <div className="rounded-[10px] border border-[#d5d2cc] bg-white p-4">
                    <p className="mb-2 text-sm text-[#9b8baf]">Tone</p>
                    <p className="text-2xl font-medium text-[#1c1c1e]">
                      {recommendedSettings.tone}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-[#9b8baf]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3a8e9c] text-xs text-white">
                    ✓
                  </span>
                  {recommendedSettings.confidenceScore}% confidence in these
                  recommendations
                </div>
              </div>
            )}

            {/* Current Applied Settings */}
            {appliedSettings && (
              <div className="mb-8 rounded-[20px] border border-[#d5d2cc] bg-white p-6">
                <h2 className="mb-4 text-xl font-medium text-[#1c1c1e]">
                  Currently Applied Settings
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-[10px] bg-[#f3f1ec] p-4">
                    <p className="mb-2 text-sm text-[#9b8baf]">Temperature</p>
                    <p className="text-2xl font-medium text-[#1c1c1e]">
                      {appliedSettings.temperature.toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-[10px] bg-[#f3f1ec] p-4">
                    <p className="mb-2 text-sm text-[#9b8baf]">Length</p>
                    <p className="text-2xl font-medium text-[#1c1c1e]">
                      {appliedSettings.length}
                    </p>
                  </div>
                  <div className="rounded-[10px] bg-[#f3f1ec] p-4">
                    <p className="mb-2 text-sm text-[#9b8baf]">Tone</p>
                    <p className="text-2xl font-medium text-[#1c1c1e]">
                      {appliedSettings.tone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Statistics */}
            <div className="rounded-[20px] border border-[#d5d2cc] bg-white p-6">
              <h2 className="mb-4 text-xl font-medium text-[#1c1c1e]">
                Activity Statistics
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-2xl font-medium text-[#3a8e9c]">
                    {profile.totalComparisons}
                  </p>
                  <p className="text-sm text-[#9b8baf]">Total Comparisons</p>
                </div>
                <div>
                  <p className="text-2xl font-medium text-[#9b8baf]">
                    {profile.confidenceScore}%
                  </p>
                  <p className="text-sm text-[#9b8baf]">Confidence Score</p>
                </div>
                <div>
                  <p className="text-2xl font-medium text-[#b4a398]">
                    {profile.preferredTemperature.toFixed(1)}
                  </p>
                  <p className="text-sm text-[#9b8baf]">Avg Temperature</p>
                </div>
                <div>
                  <p className="text-2xl font-medium text-[#3a8e9c]">
                    {profile.preferredTone}
                  </p>
                  <p className="text-sm text-[#9b8baf]">Preferred Tone</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoadingProfile && !profile && (
          <div className="flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#d5d2cc] py-16">
            <div className="mb-4 text-6xl">📊</div>
            <h3 className="mb-2 text-xl font-medium text-[#1c1c1e]">
              No Taste Profile Yet
            </h3>
            <p className="mb-6 max-w-md text-center text-[#9b8baf]">
              Start comparing outputs in the Comparison Studio to build your
              taste profile. We&apos;ll learn what settings work best for you!
            </p>
            <Button
              onClick={() => (window.location.href = "/compare")}
              className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
            >
              Go to Comparison Studio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
