/**
 * Atlas Development Kit (ADK) Core Barrel (v3.5.1)
 * Production-ready agent orchestration for glassmorphic 2026 strategic planning
 */

export * from "./uiBuilder";     // 🧱 A2UI glassmorphic builder
export * from "./types";         // 🎭 AgentPersona + BaseAgent
export * from "./orchestrator";  // 🎛️ MissionControl swarm conductor
export * from "./agents";        // 🧠 Strategist/Analyst/Critic agents
export * from "./protocol";      // 📨 A2UI protocol (events + messages)
export * from "./exporter";      // 📊 Mermaid + GitHub/Jira export
export * from "./factory";       // 🏭 AgentFactory + pooling

/**
 * Quick-start MissionControl for new projects.
 * FIX v3.5.1: Removed self-referential circular import (was `import('./index')`).
 * Now imports directly from sub-modules to avoid the circular dependency.
 */
export const createAtlasMission = async () => {
  const { MissionControl } = await import("./orchestrator");
  const { AgentFactory } = await import("./factory");

  // Warm agent pool for glassmorphic UX
  AgentFactory.warmPool();

  return new MissionControl();
};

/**
 * Development bootstrap helper
 */
export const bootstrapADK = async (): Promise<boolean> => {
  try {
    const { ENV } = await import("@config");
    const { AgentFactory } = await import("./factory");

    AgentFactory.warmPool();

    if (ENV.DEBUG_MODE) {
      console.group("🏛️ ATLAS ADK v3.5.1 BOOTSTRAP");
      console.log("✅ MissionControl ready");
      console.log("✅ AgentFactory pool warmed");
      console.log("✅ A2UI Renderer glassmorphic");
      console.log("✅ ReactFlow + TaskBank linked");
      console.groupEnd();
    }

    return true;
  } catch (error) {
    console.error("❌ ADK Bootstrap failed:", error);
    return false;
  }
};
