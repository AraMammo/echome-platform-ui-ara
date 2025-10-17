import React from "react";
import { cn } from "@/utils/cn";

interface FilterBadgeProps {
  label: string;
  value: string;
  color: string;
  baseColor: string;
  isSelected: boolean;
  onClick: () => void;
}

const FilterBadge: React.FC<FilterBadgeProps> = ({
  label,
  value,
  color,
  baseColor,
  isSelected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
        isSelected ? "ring-2 ring-offset-2" : "hover:ring-1 hover:ring-offset-1"
      )}
      style={{
        backgroundColor: isSelected ? `${color}20` : `${baseColor}20`,
        color: color,
        borderColor: color,
      }}
    >
      <span className="capitalize">{label}</span>
      <span className="ml-1 text-xs opacity-75">({value}%)</span>
    </button>
  );
};

export default FilterBadge;
