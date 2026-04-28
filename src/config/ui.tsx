/**
 * Atlas Glassmorphic Icon System (v3.6.3)
 * Task status icons for TaskCard, DependencyGraph, TimelineView
 * Glassmorphic containers + atlas-blue theming + perfect animations
 */

import React from "react";
import { TaskStatus } from "@types";
import {
  Circle,
  Loader2,
  CheckCircle2,
  XCircle,
  Lock,
  Clock,
  Zap,
} from "lucide-react";
import { createGlassIcon } from "../components/ui/GlassIcon";

/**
 * Production-ready icon registry with glassmorphic enhancement
 */
export const ICONS: Record<
  TaskStatus | "BLOCKED" | "STRATEGIC",
  React.ReactElement
> = {
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
