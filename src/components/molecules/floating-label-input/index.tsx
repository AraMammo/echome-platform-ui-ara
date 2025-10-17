"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/utils/cn";

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: boolean;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
  required = false,
  className,
  error = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = isFocused || value.length > 0;

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isActive ? placeholder : ""}
        disabled={disabled}
        required={required}
        className={cn(
          "w-full px-3 py-3 border rounded-md transition-all duration-200 bg-white",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          "disabled:bg-gray-50 disabled:cursor-not-allowed",
          error
            ? "border-red-500 focus:ring-red-500/20"
            : "border-gray-300 focus:border-primary",
          className
        )}
      />
      <label
        className={cn(
          "absolute left-3 transition-all duration-200 pointer-events-none",
          "text-gray-500",
          isActive ? "top-1 text-xs text-primary" : "top-3 text-base",
          error && isActive ? "text-red-500" : ""
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    </div>
  );
};
