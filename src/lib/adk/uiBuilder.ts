/**
 * Glassmorphic UIBuilder v3.6.1 - Atlas A2UI Fluent API
 * Production-ready fluent interface for Strategist/Analyst/Critic glassmorphic UIs
 *
 * FIX v3.6.1: missionControlStatus card title now correctly reads "MissionControl v3.6.1"
 *             (was incorrectly hardcoded as "MissionControl v1.0.0").
 */

import { A2UIMessage, A2UIElement, A2UIComponentType, AgentPersona } from "@types";
import { GLASSMORPHIC_DEFAULTS, validateA2UIMessage } from "./protocol";

type ComponentProps = Record<string, unknown>;

export class UIBuilder {
  private elements: A2UIElement[] = [];
  private sessionId?: string;

  constructor(sessionId?: string) {
    this.sessionId = sessionId;
  }

  /**
   * Core fluent API
   */
  add(
    type: A2UIComponentType,
    props: ComponentProps = {},
    id?: string
  ): this {
    this.elements.push({
      id: id || `a2ui-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      type,
      props: {
        ...GLASSMORPHIC_DEFAULTS,
        ...props,
      },
    } as A2UIElement);
    return this;
  }

  /** Glassmorphic text */
  text(content: string, props: ComponentProps = {}): this {
    return this.add(A2UIComponentType.TEXT, {
      text: content,
      ...props,
    });
  }

  /** Primary button */
  button(label: string, actionData?: unknown, props: ComponentProps = {}): this {
    return this.add(A2UIComponentType.BUTTON, {
      label,
      variant: "primary",
      actionData,
      ...props,
    });
  }

  /** Glassmorphic secondary button */
  glassButton(label: string, actionData?: unknown, props: ComponentProps = {}): this {
    return this.add(A2UIComponentType.BUTTON, {
      label,
      variant: "glass",
      actionData,
      ...props,
    });
  }

  /** Danger button */
  dangerButton(label: string, actionData?: unknown, props: ComponentProps = {}): this {
    return this.add(A2UIComponentType.BUTTON, {
      label,
      variant: "danger",
      actionData,
      ...props,
    });
  }

  /** Glassmorphic card */
  card(title?: string, subtitle?: string, props: ComponentProps = {}): this {
    this.add(A2UIComponentType.CARD, {
      title,
      subtitle,
      ...props,
    });
    return this;
  }

  /** Progress bar */
  progress(label: string, value: number, props: ComponentProps = {}): this {
    return this.add(A2UIComponentType.PROGRESS, {
      label,
      value: Math.max(0, Math.min(100, value)),
      ...props,
    });
  }

  /**
   * MissionControl status dashboard.
   * FIX v3.6.1: Card title updated from "MissionControl v1.0.0" to "MissionControl v3.6.1".
   */
  missionControlStatus(
    score: number,
    iterations: number,
    q1Count: number
  ): this {
    return this
      .card("🏛️ MissionControl v3.6.1", "Strategic Synthesis Pipeline")
      .progress("Plan Quality", score)
      .text(`Q1 Critical Path: ${q1Count} HIGH priority`, { size: "sm" })
      .text(`Refinement Cycles: ${iterations + 1}`, { size: "sm" })
      .glassButton("Visualize in ReactFlow", "visualize")
      .glassButton("Export to GitHub", "sync_github");
  }

  /** Agent selector */
  agentSelector(selectedPersona?: AgentPersona): this {
    return this
      .card("🤖 Agent Swarm Switched")
      .add(A2UIComponentType.LIST, {
        items: [
          { label: "Strategist", value: "STRATEGIST", icon: "🧠", selected: selectedPersona === AgentPersona.STRATEGIST },
          { label: "Analyst", value: "ANALYST", icon: "📊", selected: selectedPersona === AgentPersona.ANALYST },
          { label: "Critic", value: "CRITIC", icon: "🔍", selected: selectedPersona === AgentPersona.CRITIC },
        ],
      });
  }

  /** Build A2UI v1.1 message */
  build(): A2UIMessage {
    const message: A2UIMessage = {
      version: "1.1",
      timestamp: Date.now(),
      sessionId: this.sessionId,
      elements: [...this.elements],
    };

    const validated = validateA2UIMessage(message);
    return validated || message;
  }
}

export const ui = (sessionId?: string) => new UIBuilder(sessionId);
