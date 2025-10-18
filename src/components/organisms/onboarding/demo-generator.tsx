"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/atoms/button";

interface DemoGeneratorProps {
  onClose: () => void;
}

type DemoStep = "intro" | "generating" | "results";

interface GeneratedContent {
  instagram: string;
  email: string;
  blog: string;
}

export function DemoGenerator({ onClose }: DemoGeneratorProps) {
  const [step, setStep] = useState<DemoStep>("intro");
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);

  useEffect(() => {
    // Store that user has seen the demo
    if (step === "results") {
      localStorage.setItem("echome_demo_seen", "true");
    }
  }, [step]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const runDemo = async () => {
    setStep("generating");

    // Simulate generation with realistic delays
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setGeneratedContent({
      instagram: `🏡 JUST LISTED: Stunning 4BR colonial in prime Brookline location!

This architectural gem features:
✨ Chef's kitchen with marble counters
✨ Sun-drenched master suite
✨ Private backyard oasis
✨ Walk to shops & restaurants

Open house this Sunday 1-3pm. DM for details!

#BrooklineRealEstate #JustListed #DreamHome`,

      email: `Subject: You Won't Believe What Just Hit the Market

Hi Sarah,

I know you've been waiting for the perfect family home in Brookline, and I think I just found it.

This stunning 4-bedroom colonial just came on the market this morning. The kitchen alone is worth the visit - marble countertops, professional-grade appliances, and enough space to host your entire extended family for the holidays.

The master suite gets morning sunlight that'll make you actually want to wake up early. And the backyard? It's your own private retreat in the middle of the city.

I'm hosting an open house Sunday 1-3pm, but between you and me, I think this one's going to move fast. Want to see it before then?

Let me know,
[Your Name]`,

      blog: `## Why This Brookline Colonial Is Different From Every Other Listing

**The Problem With Most Listings:**
They show you a house. Four walls, a roof, some rooms.

**What This Property Actually Offers:**
A completely different lifestyle.

**Blog Outline:**

1. **The Kitchen Story** - Why this isn't just another renovation
   - The marble counters that took 6 months to source
   - Professional appliances that actually get used
   - The morning coffee ritual you'll actually look forward to

2. **The Master Suite Philosophy** - Designing for how you actually live
   - East-facing windows for natural wake-up
   - The reading nook that becomes your favorite spot
   - Storage that actually makes sense

3. **The Backyard Revolution** - Private outdoor space in the city
   - How 0.3 acres feels like an estate
   - The existing landscape design (maintained, not manicured)
   - Why your dinner parties will never be the same

4. **The Brookline Advantage** - Location beyond the listing
   - Walk score of 95 (but what that actually means)
   - The coffee shop you'll become a regular at
   - Schools that parents actually fight over

**Call to Action:**
Open house Sunday 1-3pm, or schedule a private showing before it's gone.`,
    });

    setStep("results");
  };

  const handleClose = () => {
    setTimeout(onClose, 150); // Small delay for animation
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-title"
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#9b8baf] hover:text-[#1c1c1e] transition-colors p-2 rounded-lg hover:bg-[#f3f1ec] focus:outline-none focus:ring-2 focus:ring-[#3a8e9c] focus:ring-offset-2"
          aria-label="Close demo"
        >
          <X size={24} />
        </button>

        {step === "intro" && (
          <div>
            <h2
              id="demo-title"
              className="text-2xl font-medium text-[#1c1c1e] mb-4"
            >
              Watch Echo Me Work
            </h2>
            <p className="text-[#9b8baf] mb-6">
              We&apos;ve loaded some sample real estate content. Watch what
              happens when Echo Me generates content based on a property
              listing.
            </p>
            <div className="bg-[#f3f1ec] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#1c1c1e] font-medium mb-2">
                Sample Input:
              </p>
              <p className="text-sm text-[#9b8baf]">
                &quot;4-bedroom colonial in Brookline with chef&apos;s kitchen,
                marble counters, master suite with morning light, and private
                backyard. Open house Sunday 1-3pm.&quot;
              </p>
            </div>
            <Button
              onClick={runDemo}
              className="w-full bg-[#3a8e9c] hover:bg-[#2d7a85] text-white"
            >
              Generate Sample Content
            </Button>
          </div>
        )}

        {step === "generating" && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3a8e9c] border-t-transparent mx-auto mb-4"></div>
            <p className="text-[#1c1c1e] font-medium text-lg mb-2">
              Generating content...
            </p>
            <p className="text-sm text-[#9b8baf]">This takes 3-8 seconds</p>
          </div>
        )}

        {step === "results" && generatedContent && (
          <div>
            <h2 className="text-2xl font-medium text-[#1c1c1e] mb-4">
              ✨ Here&apos;s What Echo Me Created
            </h2>

            <div className="space-y-4 mb-6">
              {/* Instagram Post */}
              <div className="p-4 border border-[#d5d2cc] rounded-lg bg-white hover:border-[#3a8e9c] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#1c1c1e]">
                    Instagram Post
                  </p>
                  <span className="text-xs text-[#9b8baf] bg-[#3a8e9c]/10 px-2 py-1 rounded">
                    3 seconds
                  </span>
                </div>
                <p className="text-sm text-[#6b7280] whitespace-pre-line">
                  {generatedContent.instagram}
                </p>
              </div>

              {/* Email */}
              <div className="p-4 border border-[#d5d2cc] rounded-lg bg-white hover:border-[#3a8e9c] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#1c1c1e]">
                    Personal Email
                  </p>
                  <span className="text-xs text-[#9b8baf] bg-[#9b8baf]/10 px-2 py-1 rounded">
                    5 seconds
                  </span>
                </div>
                <p className="text-sm text-[#6b7280] whitespace-pre-line">
                  {generatedContent.email}
                </p>
              </div>

              {/* Blog Outline */}
              <div className="p-4 border border-[#d5d2cc] rounded-lg bg-white hover:border-[#3a8e9c] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#1c1c1e]">
                    Blog Outline
                  </p>
                  <span className="text-xs text-[#9b8baf] bg-[#b4a398]/10 px-2 py-1 rounded">
                    8 seconds
                  </span>
                </div>
                <p className="text-sm text-[#6b7280] whitespace-pre-line">
                  {generatedContent.blog}
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="p-4 bg-[#3a8e9c]/10 rounded-lg mb-6">
              <p className="text-sm text-[#1c1c1e]">
                Pretty cool, right? Now imagine this using{" "}
                <strong>YOUR voice</strong>, <strong>YOUR expertise</strong>,{" "}
                <strong>YOUR past wins</strong>.
              </p>
              <p className="text-sm text-[#9b8baf] mt-2">
                The more content you upload, the more Echo Me sounds exactly
                like you.
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-[#3a8e9c] hover:bg-[#2d7a85] text-white"
            >
              Upload My Content to Make This Mine
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
