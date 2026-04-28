/**
 * Atlas ADK Core (v3.6.3) - Glassmorphic Agent Foundations
 * Re-exports core types and defines BaseAgent contract
 */

import {
  AgentPersona,
  AgentExecutionContext,
  A2UIMessage,
  AGUIEvent,
  MissionResult,
  FailureCascadeResult,
} from "@types";

export { AgentPersona };
export type { AgentExecutionContext, MissionResult, FailureCascadeResult };

/**
 * Production BaseAgent - Glassmorphic agent contract
 */
export abstract class BaseAgent {
  /**
   * Unique agent identifier for MissionControl routing
   */
  abstract readonly name: string;

  /**
   * Capabilities description for A2UI agent selector
   */
  abstract readonly description: string;

  /**
   * Handle glassmorphic UI events from A2UIRenderer
   * task_select → decompose → export_github workflow
   */
  abstract handleEvent(event: AGUIEvent): Promise<A2UIMessage>;

  /**
   * Execute core agent reasoning with full context
   * @returns ReactFlow-ready Plan or analysis result
   */
  abstract execute<R = unknown>(
    prompt: string,
    context?: AgentExecutionContext
  ): Promise<R>;

  /**
   * Initial glassmorphic UI for agent activation
   * Renders in A2UIRenderer with glass-1/2 containers
   */
  abstract getInitialUI(): A2UIMessage;
}
