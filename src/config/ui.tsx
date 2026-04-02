/**
 * Atlas Glassmorphic Icon System (v3.5.1)
 * Task status icons for TaskCard, DependencyGraph, TimelineView
 * Glassmorphic containers + atlas-blue theming + perfect animations
 */

import React from "react";
import { motion } from "framer-motion";
import { TaskStatus } from "@types";
import { cn } from "@lib/utils";
import {
  Circle,
  Loader2,
  CheckCircle2,
  XCircle,
  Lock,
  Clock,
  AlertCircle,
  Zap,
} from "lucide-react";

/**
 * Glassmorphic icon container with dynamic theming
 */
const createGlassIcon = (
  icon: React.ReactElement<{ className?: string }>,
  color: string,
  animation?: string
): React.ReactElement => (
  <div className={cn(
    "glass-2 p-2 rounded-2xl border backdrop-blur-xl shadow-lg flex items-center justify-center shrink-0",
    "border-white/20 hover:border-white/40 hover:shadow-xl transition-all duration-300",
    color.includes("atlas") ? "border-atlas-blue/30 shadow-atlas-blue/20" : ""
  )}>
    {React.cloneElement(icon, { 
      className: cn(`w-6 h-6 ${color}`, animation) 
    })}
  </div>
);

/**
 * Production-ready icon registry with glassmorphic enhancement
 */
export const ICONS: Record<TaskStatus | "BLOCKED" | "STRATEGIC", React.ReactElement> = {
  [TaskStatus.PENDING]: createGlassIcon(<Circle />, "text-slate-400"),
  [TaskStatus.IN_PROGRESS]: createGlassIcon(
    <Loader2 />,
    "text-atlas-blue",
    "animate-spin"
  ),
  [TaskStatus.COMPLETED]: createGlassIcon(<CheckCircle2 />, "text-emerald-400"),
  [TaskStatus.FAILED]: createGlassIcon(<XCircle />, "text-rose-400"),
  [TaskStatus.BLOCKED]: createGlassIcon(<Lock />, "text-slate-600"),
  [TaskStatus.WAITING]: createGlassIcon(<Clock />, "text-amber-400"),
  // Bonus: Strategic zap for TaskBank
  STRATEGIC: createGlassIcon(<Zap />, "text-atlas-blue drop-shadow-lg"),
} as const;

/**
 * Smart icon accessor with active state enhancement
 */
export const getTaskIcon = (status: TaskStatus, isActive = false): React.ReactElement => {
  const baseIcon = ICONS[status] || createGlassIcon(<AlertCircle />, "text-rose-400");
  
  if (isActive) {
    const baseProps = baseIcon.props as { className?: string };
    return React.cloneElement(baseIcon as React.ReactElement<{ className?: string }>, {
      className: cn(
        "scale-110 ring-2 ring-atlas-blue/50 shadow-[0_0_20px_rgba(59,130,246,0.4)]",
        baseProps?.className
      )
    });
  }
  
  return baseIcon;
};

/**
 * Bulk icon renderer for TimelineView markers
 */
export const getTimelineIcon = (status: TaskStatus, index: number): React.ReactNode => {
  const colors: Partial<Record<TaskStatus, string>> = {
    [TaskStatus.COMPLETED]: "text-emerald-400 shadow-emerald/30",
    [TaskStatus.IN_PROGRESS]: "text-atlas-blue shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse",
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
        rotate: [0, 2, 0]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        delay: index * 0.1 
      }}
    >
      <IconComponent className="w-8 h-8 drop-shadow-lg" />
    </motion.div>
  );
};
