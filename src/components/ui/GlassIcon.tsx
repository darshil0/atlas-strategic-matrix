/**
 * Atlas Glassmorphic Icon System (v3.6.1)
 * Task status icons for TaskCard, DependencyGraph, TimelineView
 * Glassmorphic containers + atlas-blue theming + perfect animations
 */

import React from "react";
import { cn } from "@lib/utils";

/**
 * Glassmorphic icon container with dynamic theming
 */
export const createGlassIcon = (
  icon: React.ReactElement<{ className?: string }>,
  color: string,
  animation?: string
): React.ReactElement => (
  <div
    className={cn(
      "glass-2 p-2 rounded-2xl border backdrop-blur-xl shadow-lg flex items-center justify-center shrink-0",
      "border-white/20 hover:border-white/40 hover:shadow-xl transition-all duration-300",
      color.includes("atlas") ? "border-atlas-blue/30 shadow-atlas-blue/20" : ""
    )}
  >
    {React.cloneElement(icon, {
      className: cn(`w-6 h-6 ${color}`, animation),
    })}
  </div>
);
