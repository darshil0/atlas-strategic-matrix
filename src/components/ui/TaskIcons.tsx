import React from "react";
import { motion } from "framer-motion";
import { TaskStatus } from "@types";
import { cn } from "@lib/utils";
import { ICONS } from "../../config/ui";
import { createGlassIcon } from "./GlassIcon";
import { Circle, AlertCircle } from "lucide-react";

/**
 * Smart icon accessor with active state enhancement
 */
export const getTaskIcon = (
  status: TaskStatus,
  isActive = false
): React.ReactElement => {
  const baseIcon =
    ICONS[status] || createGlassIcon(<AlertCircle />, "text-rose-400");

  if (isActive) {
    const baseProps = baseIcon.props as { className?: string };
    return React.cloneElement(
      baseIcon as React.ReactElement<{ className?: string }>,
      {
        className: cn(
          "scale-110 ring-2 ring-atlas-blue/50 shadow-[0_0_20px_rgba(59,130,246,0.4)]",
          baseProps?.className
        ),
      }
    );
  }

  return baseIcon;
};

/**
 * Bulk icon renderer for TimelineView markers
 */
export const getTimelineIcon = (
  status: TaskStatus,
  index: number
): React.ReactNode => {
  const colors: Partial<Record<TaskStatus, string>> = {
    [TaskStatus.COMPLETED]: "text-emerald-400 shadow-emerald/30",
    [TaskStatus.IN_PROGRESS]:
      "text-atlas-blue shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse",
    [TaskStatus.PENDING]: "text-slate-400",
  };

  const IconComponent = (ICONS[status]?.type as React.ElementType) || Circle;

  return (
    <motion.div
      className={cn(
        "glass-1 w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl border-2",
        colors[status] || "text-slate-400 border-white/20",
        "backdrop-blur-3xl hover:shadow-3xl transition-all duration-500"
      )}
      animate={{
        scale: [1, 1.05, 1],
        rotate: [0, 2, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay: index * 0.1,
      }}
    >
      <IconComponent className="w-8 h-8 drop-shadow-lg" />
    </motion.div>
  );
};
