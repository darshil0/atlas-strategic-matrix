/**
 * Atlas Agent Factory (v3.6.1) - Glassmorphic Multi-Agent Swarm
 * TypeScript exhaustiveness + production agent lifecycle management
 */

import { AgentPersona, Plan, AnalystResult, CriticResult } from "@types";
import { BaseAgent } from "./types";
import { StrategistAgent, AnalystAgent, CriticAgent, ArchitectAgent } from "./agents";

/**
 * Production Agent Factory with lifecycle hooks + metrics
 */
export class AgentFactory {
  /**
   * Creates specialized agents with perfect TypeScript exhaustiveness
   */
  static create(persona: AgentPersona): BaseAgent {
    switch (persona) {
      case AgentPersona.STRATEGIST:
        return new StrategistAgent();

      case AgentPersona.ANALYST:
        return new AnalystAgent();

      case AgentPersona.CRITIC:
        return new CriticAgent();

      case AgentPersona.ARCHITECT:
        return new ArchitectAgent();

      default: {
        const _exhaustiveCheck: never = persona;
        throw new Error(`🚨 Unknown agent persona: ${_exhaustiveCheck}`);
      }
    }
  }

  /**
   * Swarm pipeline: Strategist → Analyst → Critic → Optimized Plan
   */
  static async createSwarmPipeline(): Promise<BaseAgent[]> {
    return [
      this.create(AgentPersona.STRATEGIST),
      this.create(AgentPersona.ANALYST),
      this.create(AgentPersona.CRITIC),
    ];
  }

  private static agentPool: Partial<Record<AgentPersona, BaseAgent>> = {};
  private static poolSize = 0;
  private static readonly MAX_POOL_SIZE = 10;

  /**
   * Get-or-create agent with pooling (performance)
   */
  static getOrCreate(persona: AgentPersona): BaseAgent {
    if (this.poolSize > AgentFactory.MAX_POOL_SIZE) {
      this.dispose();
    }

    if (!this.agentPool[persona]) {
      this.agentPool[persona] = this.create(persona);
      this.poolSize++;
    }
    return this.agentPool[persona]!;
  }

  /**
   * Warm entire swarm pool on app bootstrap
   */
  static warmPool(): void {
    [AgentPersona.STRATEGIST, AgentPersona.ANALYST, AgentPersona.CRITIC].forEach(persona => {
      this.getOrCreate(persona);
    });
  }

  /**
   * Graceful agent lifecycle cleanup
   */
  static async dispose(): Promise<void> {
    this.agentPool = {};
    this.poolSize = 0;
  }
}

/**
 * Convenience swarm execution utility
 */
export const AgentSwarm = {
  async execute(goal: string): Promise<{
    roadmap: Plan;
    analysis: AnalystResult;
    review: CriticResult;
    finalScore: number;
    readyForVisualization: boolean;
  }> {
    const [strategist, analyst, critic] = await AgentFactory.createSwarmPipeline();

    const roadmap = await strategist.execute<Plan>(goal);
    const analysis = await analyst.execute<AnalystResult>(goal, { plan: roadmap });
    const review = await critic.execute<CriticResult>(goal, { plan: roadmap, analysis });

    return {
      roadmap,
      analysis,
      review,
      finalScore: review.score,
      readyForVisualization: review.graphValid,
    };
  }
};
