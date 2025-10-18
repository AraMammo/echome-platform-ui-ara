"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

export interface Step {
  number: number;
  title: string;
  description: string;
}

interface GenerationStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function GenerationStepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: GenerationStepperProps) {
  const isStepComplete = (stepNumber: number) => stepNumber < currentStep;
  const isStepCurrent = (stepNumber: number) => stepNumber === currentStep;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isComplete = isStepComplete(step.number);
          const isCurrent = isStepCurrent(step.number);
          const isClickable = onStepClick && (isComplete || isCurrent);

          return (
            <React.Fragment key={step.number}>
              {/* Step indicator */}
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => isClickable && onStepClick(step.number)}
                  disabled={!isClickable}
                  className={cn(
                    "group relative flex flex-col items-center w-full",
                    isClickable && "cursor-pointer",
                    !isClickable && "cursor-default"
                  )}
                >
                  {/* Circle with number or checkmark */}
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium transition-all",
                      "border-2",
                      isComplete && "bg-[#3a8e9c] border-[#3a8e9c] text-white",
                      isCurrent &&
                        "bg-[#3a8e9c] border-[#3a8e9c] text-white ring-4 ring-[#3a8e9c]/20",
                      !isComplete &&
                        !isCurrent &&
                        "bg-white border-stone-300 text-stone-500"
                    )}
                  >
                    {isComplete ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <span className="text-xs sm:text-sm">{step.number}</span>
                    )}
                  </div>

                  {/* Step label */}
                  <div className="mt-2 sm:mt-3 text-center px-1">
                    <div
                      className={cn(
                        "text-xs sm:text-sm font-medium",
                        (isComplete || isCurrent) && "text-zinc-900",
                        !isComplete && !isCurrent && "text-stone-500"
                      )}
                    >
                      {step.title}
                    </div>
                    {/* Hide description on mobile */}
                    <div
                      className={cn(
                        "text-xs mt-1 hidden sm:block",
                        (isComplete || isCurrent) && "text-stone-600",
                        !isComplete && !isCurrent && "text-stone-400"
                      )}
                    >
                      {step.description}
                    </div>
                  </div>
                </button>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] bg-stone-200 mx-2 sm:mx-4 mt-[-40px] sm:mt-[-60px]">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      isComplete ? "bg-[#3a8e9c]" : "bg-stone-200"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
