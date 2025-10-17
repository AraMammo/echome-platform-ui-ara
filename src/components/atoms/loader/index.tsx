import { LoaderCircle } from "lucide-react";
import { cn } from "@/utils/cn";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  className,
  size = "md",
  fullScreen = false,
}) => {
  const spinner = (
    <LoaderCircle
      color="#8350ff"
      size={size === "sm" ? 16 : size === "md" ? 36 : 48}
      className={cn("animate-spin stroke-primary", className)}
    />
  );

  if (fullScreen) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export { Loader };
