/**
 * ATLAS Monte Carlo Timeline Simulation Engine (v3.6.4)
 * Runs probabilistic simulations across strategic task DAGs to model timeline risk distributions (P50, P75, P90, P99).
 */

import { Plan, SubTask, MonteCarloResult, MonteCarloTrial } from "@types";
import { RbacAuditService } from "./rbacAuditService";

export class MonteCarloService {
  /**
   * Run Monte Carlo simulation on the plan's schedule and dependencies
   */
  static runSimulation(plan: Plan, iterations = 2000): MonteCarloResult {
    if (!plan.tasks || plan.tasks.length === 0) {
      return {
        iterations: 0,
        p50Days: 0,
        p75Days: 0,
        p90Days: 0,
        p99Days: 0,
        minDays: 0,
        maxDays: 0,
        meanDays: 0,
        stdDevDays: 0,
        criticalPathTasks: [],
        riskDistribution: [],
      };
    }

    const trials: MonteCarloTrial[] = [];
    const taskFrequency: Record<string, number> = {};

    // Map base duration in days for each task
    const baseDurations: Record<string, number> = {};
    plan.tasks.forEach((task) => {
      baseDurations[task.id] = this.parseDurationInDays(task);
    });

    for (let i = 0; i < iterations; i++) {
      const trialResult = this.simulateSingleTrial(plan.tasks, baseDurations);
      trials.push({
        trialIndex: i,
        totalDurationDays: trialResult.totalDays,
        completionDate: this.calculateCompletionDate(trialResult.totalDays),
      });

      trialResult.criticalPath.forEach((taskId) => {
        taskFrequency[taskId] = (taskFrequency[taskId] || 0) + 1;
      });
    }

    // Sort trials by total duration
    trials.sort((a, b) => a.totalDurationDays - b.totalDurationDays);

    const getPercentile = (p: number) => {
      const index = Math.min(
        Math.floor((p / 100) * trials.length),
        trials.length - 1
      );
      return Math.round(trials[index].totalDurationDays);
    };

    const totalDurationSum = trials.reduce((acc, t) => acc + t.totalDurationDays, 0);
    const meanDays = Math.round(totalDurationSum / trials.length);

    const variance =
      trials.reduce((acc, t) => acc + Math.pow(t.totalDurationDays - meanDays, 2), 0) /
      trials.length;
    const stdDevDays = Math.round(Math.sqrt(variance));

    // Sort tasks by frequency on critical path
    const criticalPathTasks = Object.entries(taskFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([taskId]) => taskId);

    // Build risk distribution buckets
    const minDays = Math.round(trials[0].totalDurationDays);
    const maxDays = Math.round(trials[trials.length - 1].totalDurationDays);
    const bucketCount = 6;
    const bucketSize = Math.max(1, Math.ceil((maxDays - minDays) / bucketCount));

    const distributionMap: Record<string, number> = {};
    for (let b = 0; b < bucketCount; b++) {
      const start = minDays + b * bucketSize;
      const end = start + bucketSize - 1;
      const label = `${start}-${end}d`;
      distributionMap[label] = 0;
    }

    trials.forEach((t) => {
      const bIndex = Math.min(
        Math.floor((t.totalDurationDays - minDays) / bucketSize),
        bucketCount - 1
      );
      const start = minDays + bIndex * bucketSize;
      const end = start + bucketSize - 1;
      const label = `${start}-${end}d`;
      if (distributionMap[label] !== undefined) {
        distributionMap[label]++;
      }
    });

    const riskDistribution = Object.entries(distributionMap).map(([label, count]) => ({
      durationBucket: label,
      count,
    }));

    RbacAuditService.logAction(
      "SIMULATION_RUN",
      `plan:${plan.id || "current"}`,
      `Executed Monte Carlo simulation with ${iterations} iterations (P50: ${getPercentile(
        50
      )}d, P90: ${getPercentile(90)}d)`
    );

    return {
      iterations,
      p50Days: getPercentile(50),
      p75Days: getPercentile(75),
      p90Days: getPercentile(90),
      p99Days: getPercentile(99),
      minDays,
      maxDays,
      meanDays,
      stdDevDays,
      criticalPathTasks,
      riskDistribution,
    };
  }

  /**
   * Helper: Parses human duration string or effort estimation into days
   */
  private static parseDurationInDays(task: SubTask): number {
    if (task.estimatedEffort) {
      // 1 story point ~= 2.5 days
      return task.estimatedEffort * 2.5;
    }
    const dStr = task.duration?.toLowerCase().trim();
    if (!dStr) return 14; // Default 2 weeks

    if (dStr.endsWith("w")) return (parseFloat(dStr) || 2) * 7;
    if (dStr.endsWith("d")) return parseFloat(dStr) || 5;
    if (dStr.endsWith("m")) return (parseFloat(dStr) || 1) * 30;
    if (dStr.endsWith("h")) return (parseFloat(dStr) || 8) / 8;

    return 14;
  }

  /**
   * Helper: Simulates 1 trial using PERT triangular distribution
   */
  private static simulateSingleTrial(
    tasks: SubTask[],
    baseDurations: Record<string, number>
  ): { totalDays: number; criticalPath: string[] } {
    const taskEndTimes: Record<string, number> = {};
    const taskStartTimes: Record<string, number> = {};

    // Compute stochastic duration for each task using Triangular distribution (Optimistic: 0.8x, Most Likely: 1.0x, Pessimistic: 1.6x)
    const trialDurations: Record<string, number> = {};
    tasks.forEach((t) => {
      const base = baseDurations[t.id] || 14;
      const opt = base * 0.8;
      const ml = base * 1.0;
      const pess = base * 1.6;

      // Triangular distribution sample
      const u = Math.random();
      const fc = (ml - opt) / (pess - opt);
      let duration: number;
      if (u < fc) {
        duration = opt + Math.sqrt(u * (pess - opt) * (ml - opt));
      } else {
        duration = pess - Math.sqrt((1 - u) * (pess - opt) * (pess - ml));
      }

      trialDurations[t.id] = duration;
    });

    // Topological DAG path calculation
    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    const getEarliestStart = (taskId: string, visited = new Set<string>()): number => {
      if (visited.has(taskId)) return 0; // Prevent cyclic hang
      visited.add(taskId);

      const task = taskMap.get(taskId);
      if (!task || !task.dependencies || task.dependencies.length === 0) return 0;

      let maxDepEnd = 0;
      task.dependencies.forEach((depId) => {
        if (taskEndTimes[depId] !== undefined) {
          maxDepEnd = Math.max(maxDepEnd, taskEndTimes[depId]);
        } else {
          const depStart = getEarliestStart(depId, new Set(visited));
          const depDuration = trialDurations[depId] || 14;
          const depEnd = depStart + depDuration;
          taskEndTimes[depId] = depEnd;
          maxDepEnd = Math.max(maxDepEnd, depEnd);
        }
      });
      return maxDepEnd;
    };

    tasks.forEach((t) => {
      const start = getEarliestStart(t.id);
      taskStartTimes[t.id] = start;
      taskEndTimes[t.id] = start + trialDurations[t.id];
    });

    let totalDays = 0;
    let endNodeId = "";
    Object.entries(taskEndTimes).forEach(([id, endTime]) => {
      if (endTime > totalDays) {
        totalDays = endTime;
        endNodeId = id;
      }
    });

    // Backtrack critical path
    const criticalPath: string[] = [];
    let curr: string | undefined = endNodeId;
    while (curr) {
      criticalPath.unshift(curr);
      const currTask = taskMap.get(curr);
      if (!currTask || !currTask.dependencies || currTask.dependencies.length === 0) break;

      let prevBest: string | undefined;
      let maxEnd = -1;
      currTask.dependencies.forEach((depId) => {
        if ((taskEndTimes[depId] || 0) > maxEnd) {
          maxEnd = taskEndTimes[depId] || 0;
          prevBest = depId;
        }
      });
      curr = prevBest;
    }

    return { totalDays, criticalPath };
  }

  private static calculateCompletionDate(daysFromNow: number): string {
    const target = new Date(Date.now() + daysFromNow * 86400000);
    return target.toISOString().split("T")[0];
  }
}
