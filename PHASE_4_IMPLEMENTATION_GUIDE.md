# Phase 4: Live Voice Preview & A/B Testing - Implementation Guide

## ✅ Completed Components

### Services Layer

1. **voice-comparison.ts** - Complete service for A/B testing
   - `generateMultipleVersions()` - Generate 3-5 versions simultaneously
   - `recordPreference()` - Track user votes
   - `getTasteProfile()` - Get learned preferences
   - `getRecommendedSettings()` - AI-recommended defaults

2. **voice-snapshot.ts** - Complete service for voice evolution
   - `createSnapshot()` - Save voice state at milestones
   - `compareSnapshots()` - Compare two voice versions
   - `detectVoiceDrift()` - Alert when tone shifts
   - `rollbackToSnapshot()` - Restore previous voice

3. **showcase.ts** - Complete service for before/after demos
   - `generateBeforeAfter()` - Generic AI vs Your Voice
   - `createShareCard()` - Social proof cards
   - `trackShareMetrics()` - Monitor shares & clicks

### State Management (Zustand)

1. **comparison-store.ts** - Manages A/B test state
2. **voice-evolution-store.ts** - Manages timeline & snapshots
3. **taste-profile-store.ts** - Manages user preferences

### UI Components

1. **version-comparison-grid.tsx** - Side-by-side version display with voting

## 🔧 Remaining Implementation Tasks

### Components to Create

#### 1. Before/After Slider Component

**File**: `src/components/organisms/voice-comparison/before-after-slider.tsx`

```typescript
"use client";

import React, { useState } from "react";
import { BeforeAfterComparison } from "@/services/showcase";

interface BeforeAfterSliderProps {
  comparison: BeforeAfterComparison;
  onShare?: () => void;
}

export function BeforeAfterSlider({ comparison, onShare }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative overflow-hidden rounded-[20px]">
      {/* Before (Generic AI) */}
      <div className="p-6 bg-gray-100">
        <h3>Generic AI (GPT-4)</h3>
        <p>{comparison.genericOutput}</p>
      </div>

      {/* After (Your Voice) - revealed by slider */}
      <div
        className="absolute inset-0 p-6 bg-[#3a8e9c]/10"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <h3>Your Echo Me Voice</h3>
        <p>{comparison.personalizedOutput}</p>
      </div>

      {/* Slider handle */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      />

      {/* Improvement metrics */}
      <div className="mt-4">
        <p>Improvement: +{comparison.improvementMetrics.overallImprovement}%</p>
      </div>
    </div>
  );
}
```

#### 2. Voice Card Component

**File**: `src/components/organisms/voice-comparison/voice-card.tsx`

```typescript
"use client";

import React from "react";
import { ShareCard } from "@/services/showcase";
import { Button } from "@/components/atoms/button";
import { Share2, Copy } from "lucide-react";

interface VoiceCardProps {
  card: ShareCard;
  onShare?: (platform: "twitter" | "linkedin" | "facebook") => void;
}

export function VoiceCard({ card, onShare }: VoiceCardProps) {
  return (
    <div className="rounded-[20px] border-2 border-[#3a8e9c] p-8 bg-gradient-to-br from-[#3a8e9c]/5 to-[#9b8baf]/5">
      <h2 className="text-2xl font-medium mb-4">🎯 My Echo Me Voice Card</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span>Training Data:</span>
          <span className="font-medium">{card.cardData.fileCount} files</span>
        </div>
        <div className="flex justify-between">
          <span>Voice Accuracy:</span>
          <span className="font-medium">{card.cardData.voiceAccuracy}/100</span>
        </div>
        <div className="flex justify-between">
          <span>Content Types:</span>
          <span className="font-medium">{card.cardData.contentTypes.join(", ")}</span>
        </div>
      </div>

      {card.cardData.testimonial && (
        <blockquote className="border-l-4 border-[#3a8e9c] pl-4 italic mb-6">
          "{card.cardData.testimonial}"
        </blockquote>
      )}

      <div className="flex gap-2">
        <Button onClick={() => onShare?.("twitter")}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline">
          <Copy className="w-4 h-4 mr-2" />
          Copy Link
        </Button>
      </div>

      <p className="text-xs text-[#9b8baf] mt-4">
        {card.views} views • {card.clicks} clicks
      </p>
    </div>
  );
}
```

#### 3. Taste Profile Dashboard

**File**: `src/components/organisms/voice-comparison/taste-profile-dashboard.tsx`

```typescript
"use client";

import React from "react";
import { TasteProfile } from "@/services/voice-comparison";
import { Button } from "@/components/atoms/button";

interface TasteProfileDashboardProps {
  profile: TasteProfile;
  onApplyDefaults?: () => void;
}

export function TasteProfileDashboard({ profile, onApplyDefaults }: TasteProfileDashboardProps) {
  return (
    <div className="rounded-[20px] border border-[#d5d2cc] p-6">
      <h2 className="text-xl font-medium mb-4">Your Output Preferences</h2>
      <p className="text-sm text-[#9b8baf] mb-6">
        Based on {profile.totalComparisons} comparisons
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span>Temperature Preference:</span>
          <span className="font-medium">
            {profile.patterns.temperaturePreference.value.toFixed(1)}
            ({profile.patterns.temperaturePreference.percentage}%)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Length Preference:</span>
          <span className="font-medium capitalize">
            {profile.patterns.lengthPreference.value}
            ({profile.patterns.lengthPreference.percentage}%)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Tone Preference:</span>
          <span className="font-medium capitalize">
            {profile.patterns.tonePreference.value}
            ({profile.patterns.tonePreference.percentage}%)
          </span>
        </div>
      </div>

      <div className="bg-[#3a8e9c]/10 rounded-[10px] p-4 mb-4">
        <h3 className="font-medium mb-2">🎯 Recommended Default Settings:</h3>
        <p className="text-sm">
          Temperature: {profile.preferredTemperature} |
          Length: {profile.preferredLength} |
          Tone: {profile.preferredTone}
        </p>
      </div>

      <Button onClick={onApplyDefaults} className="w-full">
        Apply These Defaults
      </Button>
    </div>
  );
}
```

#### 4. Voice Timeline Component

**File**: `src/components/organisms/voice-comparison/voice-timeline.tsx`

```typescript
"use client";

import React from "react";
import { VoiceTimeline } from "@/services/voice-snapshot";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";

interface VoiceTimelineProps {
  timeline: VoiceTimeline;
  onCompare?: (snapshotA: string, snapshotB: string) => void;
  onRollback?: (snapshotId: string) => void;
}

export function VoiceTimelineComponent({ timeline }: VoiceTimelineProps) {
  return (
    <div className="rounded-[20px] border border-[#d5d2cc] p-8">
      <h2 className="text-2xl font-medium mb-6">Voice Timeline</h2>

      {/* Timeline visualization */}
      <div className="mb-8">
        <div className="relative h-2 bg-[#d5d2cc] rounded-full">
          {timeline.snapshots.map((snapshot, idx) => (
            <div
              key={snapshot.id}
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#3a8e9c] rounded-full"
              style={{ left: `${(snapshot.fileCount / timeline.currentFileCount) * 100}%` }}
              title={`${snapshot.fileCount} files`}
            />
          ))}
        </div>

        <div className="flex justify-between mt-2 text-sm text-[#9b8baf]">
          <span>Start</span>
          <span>{timeline.currentFileCount} files</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#3a8e9c]/10 rounded-[10px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-[#3a8e9c]" />
            <span className="text-sm text-[#9b8baf]">Consistency Score</span>
          </div>
          <p className="text-2xl font-medium">{timeline.consistencyScore}/100</p>
        </div>

        <div className="bg-[#9b8baf]/10 rounded-[10px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#9b8baf]" />
            <span className="text-sm text-[#9b8baf]">Improvement</span>
          </div>
          <p className="text-2xl font-medium">+{timeline.improvementSinceStart}%</p>
        </div>
      </div>

      {/* Recent changes */}
      <div>
        <h3 className="font-medium mb-3">Recent Changes:</h3>
        <div className="space-y-2">
          {timeline.recentChanges.map((change, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-[#f3f1ec] rounded-[10px]">
              <span className="text-lg">📊</span>
              <div>
                <p className="text-sm">
                  Added {change.filesAdded} files → {change.impact}
                </p>
                <p className="text-xs text-[#9b8baf]">{change.metric}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Pages to Create

#### 1. Comparison Studio Page

**File**: `src/app/(base)/compare/page.tsx`

```typescript
"use client";

import React, { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Textarea } from "@/components/atoms/textarea";
import { useComparisonStore } from "@/stores/comparison-store";
import { VersionComparisonGrid } from "@/components/organisms/voice-comparison/version-comparison-grid";

export default function ComparePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<string>();

  const {
    currentComparison,
    isGenerating,
    generateComparison,
    recordVote,
    votes,
  } = useComparisonStore();

  const handleGenerate = async (versionCount: number) => {
    if (!prompt.trim()) return;
    await generateComparison(prompt, versionCount);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-medium mb-2">Voice Comparison Studio</h1>
      <p className="text-[#9b8baf] mb-8">
        Test different versions to find your perfect voice
      </p>

      {/* Prompt input */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Enter a prompt to test:</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Write a LinkedIn post about productivity hacks"
          rows={3}
          className="w-full"
        />
      </div>

      {/* Generate buttons */}
      <div className="flex gap-3 mb-8">
        <Button
          onClick={() => handleGenerate(3)}
          disabled={isGenerating || !prompt.trim()}
          className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
        >
          Generate 3 Versions
        </Button>
        <Button
          onClick={() => handleGenerate(5)}
          disabled={isGenerating || !prompt.trim()}
          variant="outline"
        >
          Generate 5 Versions
        </Button>
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[#3a8e9c] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#9b8baf]">Generating versions...</p>
        </div>
      )}

      {/* Comparison grid */}
      {currentComparison && !isGenerating && (
        <VersionComparisonGrid
          outputs={currentComparison.outputs}
          onVote={recordVote}
          onSelectVersion={setSelectedVersion}
          votes={votes}
          selectedVersion={selectedVersion}
        />
      )}
    </div>
  );
}
```

#### 2. Voice Evolution Page

**File**: `src/app/(base)/evolution/page.tsx`

```typescript
"use client";

import React, { useEffect } from "react";
import { useVoiceEvolutionStore } from "@/stores/voice-evolution-store";
import { VoiceTimelineComponent } from "@/components/organisms/voice-comparison/voice-timeline";
import { Button } from "@/components/atoms/button";
import { AlertTriangle } from "lucide-react";

export default function EvolutionPage() {
  const {
    timeline,
    driftAlert,
    isDriftDismissed,
    isLoadingTimeline,
    loadTimeline,
    checkDrift,
    dismissDriftAlert,
  } = useVoiceEvolutionStore();

  useEffect(() => {
    loadTimeline();
    checkDrift();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-medium mb-2">Your Voice Evolution</h1>
      <p className="text-[#9b8baf] mb-8">
        Track how your AI voice has changed over time
      </p>

      {/* Drift alert */}
      {driftAlert && driftAlert.detected && !isDriftDismissed && (
        <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-[20px]">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-900 mb-2">
                Voice Alert: Your tone has shifted
              </h3>
              <p className="text-sm text-amber-800 mb-4">
                {driftAlert.recommendation}
              </p>
              <Button
                onClick={dismissDriftAlert}
                size="sm"
                variant="outline"
                className="border-amber-600 text-amber-600"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {isLoadingTimeline ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[#3a8e9c] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#9b8baf]">Loading timeline...</p>
        </div>
      ) : timeline ? (
        <VoiceTimelineComponent timeline={timeline} />
      ) : (
        <p className="text-center text-[#9b8baf] py-12">
          No voice timeline available yet. Upload more content to start tracking!
        </p>
      )}
    </div>
  );
}
```

#### 3. Showcase Page

**File**: `src/app/(base)/showcase/page.tsx`

```typescript
"use client";

import React, { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { showcaseService } from "@/services/showcase";
import { BeforeAfterSlider } from "@/components/organisms/voice-comparison/before-after-slider";

export default function ShowcasePage() {
  const [prompt, setPrompt] = useState("");
  const [comparison, setComparison] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await showcaseService.generateBeforeAfter({
        prompt,
        includeMetrics: true,
      });

      if (response.success) {
        setComparison(response.data);
      }
    } catch (error) {
      console.error("Error generating comparison:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-medium mb-2">Voice Showcase</h1>
      <p className="text-[#9b8baf] mb-8">
        See how your voice compares to generic AI
      </p>

      <div className="mb-6">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to test..."
          className="mb-3"
        />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? "Generating..." : "Generate Comparison"}
        </Button>
      </div>

      {comparison && (
        <BeforeAfterSlider comparison={comparison} />
      )}
    </div>
  );
}
```

### Dashboard Integration

Add to `src/app/(base)/page.tsx` in RegularDashboard:

```typescript
{/* Voice Testing CTA - Show for users with 10+ files */}
{fileCount >= 10 && (
  <div className="bg-gradient-to-r from-[#3a8e9c]/10 to-[#9b8baf]/10 rounded-[20px] p-6 border border-[#3a8e9c]/20">
    <h3 className="text-lg font-medium mb-2">Test Your Voice</h3>
    <p className="text-sm text-[#9b8baf] mb-4">
      See if Echo Me sounds like you. Compare different versions and find your perfect settings.
    </p>
    <Button
      onClick={() => router.push("/compare")}
      className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
    >
      Try Voice Comparison →
    </Button>
  </div>
)}
```

### Sidebar Navigation

Add to `src/components/organisms/app-sidebar/index.tsx`:

```typescript
{
  title: "Voice Testing",
  icon: Zap,
  url: "/compare",
  minFilesRequired: 10,
  badge: "New",
},
{
  title: "Voice Evolution",
  icon: TrendingUp,
  url: "/evolution",
  minFilesRequired: 25,
},
{
  title: "Showcase",
  icon: Share2,
  url: "/showcase",
  minFilesRequired: 10,
},
```

## 🔄 Integration Checklist

- [ ] Create all component files listed above
- [ ] Create all page files (/compare, /evolution, /showcase)
- [ ] Add navigation items to sidebar
- [ ] Integrate voice testing CTA into dashboard
- [ ] Add route metadata for new pages
- [ ] Test build (`npm run build`)
- [ ] Test all user flows end-to-end

## 🎯 Key User Flows

### First-time Comparison Flow

1. User with 10+ files sees "Test Your Voice" on dashboard
2. Clicks → Goes to /compare
3. Enters prompt → Generates 3-5 versions
4. Votes on favorites → System learns preferences
5. Can view taste profile showing learned patterns

### Voice Evolution Flow

1. User uploads more content over time
2. System auto-creates snapshots at milestones (10, 25, 50, 100 files)
3. User visits /evolution to see timeline
4. Gets drift alert if tone shifts significantly
5. Can compare old vs new voice
6. Can rollback to previous snapshot if desired

### Showcase Flow

1. User generates before/after comparison
2. Slides between generic AI vs personalized output
3. Sees improvement metrics
4. Can create shareable voice card
5. Shares to LinkedIn/Twitter with tracking link
6. Views share metrics (views, clicks, CTR)

## 📊 Backend Requirements

The backend needs to implement these endpoints:

### Voice Comparison Endpoints

- `POST /voice-comparison/generate` - Generate multiple versions
- `POST /voice-comparison/preference` - Record vote
- `GET /voice-comparison/taste-profile` - Get learned preferences
- `GET /voice-comparison/recommended-settings` - Get AI recommendations
- `GET /voice-comparison/history` - Get comparison history

### Voice Snapshot Endpoints

- `POST /voice-snapshot/create` - Create snapshot
- `POST /voice-snapshot/compare` - Compare two snapshots
- `GET /voice-snapshot/drift` - Detect voice drift
- `GET /voice-snapshot/timeline` - Get voice timeline
- `POST /voice-snapshot/rollback` - Rollback to snapshot

### Showcase Endpoints

- `POST /showcase/before-after` - Generate before/after
- `POST /showcase/share-card` - Create share card
- `GET /showcase/share-card/:id/metrics` - Get share metrics
- `POST /showcase/share-card/:id/view` - Track view
- `POST /showcase/share-card/:id/click` - Track click

## 🎨 Design Tokens

All components use the existing design system:

**Colors:**

- Primary: `#3a8e9c` (Deep Cyan)
- Secondary: `#9b8baf` (Slate Lavender)
- Accent: `#b4a398` (Clay Taupe)
- Neutral: `#d5d2cc` (Concrete Gray)
- Text: `#1c1c1e` (Graphite Black)
- Background: `#f3f1ec` (Warm Off-White)

**Border Radius:** `--radius: 0.625rem` (10px for cards, 20px for containers)

**Font:** Satoshi (custom local font)

**Max Font Weight:** `font-medium` (500)

## 🚀 Launch Strategy

1. **Soft Launch** - Release to users with 25+ files first
2. **Beta Feedback** - Collect feedback on comparison accuracy
3. **Taste Profile Refinement** - Improve recommendation algorithm based on voting data
4. **Social Proof Campaign** - Encourage users to share voice cards
5. **Full Release** - Open to all users with 10+ files

## 📈 Success Metrics

- **Engagement:** % of users who try voice comparison
- **Retention:** Users who return to compare again
- **Preference Learning:** Accuracy of taste profile recommendations
- **Social Sharing:** Voice card shares and click-through rate
- **Voice Consistency:** Average consistency score across users
- **Drift Detection:** % of users who respond to drift alerts
