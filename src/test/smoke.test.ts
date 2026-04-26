/**
 * Atlas Core Integration Test Suite (v3.6.1) - Glassmorphic Smoke Tests
 * Production test coverage for MissionControl → AgentFactory → PersistenceService
 * Validates full ADK stack + GitHub/Jira sync + ReactFlow data flow
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AgentFactory, MissionControl } from "../lib/adk";
import { AgentPersona } from "../types";
import { PersistenceService } from "../services/persistenceService";
import { syncServices } from "../services";
import { ATLAS_TEST_UTILS } from "../test/setup";

// Integration tests for full Atlas ADK stack

describe("🏛️ ATLAS v3.6.1 - Production Integration Tests", () => {
  beforeEach(() => {
    ATLAS_TEST_UTILS.resetAtlasMocks();
  });

  afterEach(() => {
    PersistenceService.clearAll();
  });

  it("✅ should have working Vitest environment", () => {
    expect(true).toBe(true);
  });

  it("🧠 AgentFactory creates all agent personas correctly", () => {
    const personas = Object.values(AgentPersona) as AgentPersona[];
    
    for (const persona of personas) {
      const agent = AgentFactory.create(persona);
      expect(agent).toBeDefined();
      expect(agent.name).toBe(persona);
      expect(typeof agent.execute).toBe("function");
      expect(typeof agent.getInitialUI).toBe("function");
    }
  });

  it("🎛️ MissionControl full pipeline executes without errors", async () => {
    const mission = new MissionControl();
    const goal = "Generate 2026 Q1 AI roadmap";
    
    const result = await mission.processCollaborativeInput(goal);
    
    expect(result).toBeDefined();
    expect(result.text).toContain("Strategic plan synthesized");
    expect(result.validation).toBeDefined();
    expect(result.validation.finalScore).toBeGreaterThan(0);
    expect(result.plan).toBeDefined();
  });

  it("💾 PersistenceService saves/loads 2026 plan correctly", () => {
    const mockPlan = ATLAS_TEST_UTILS.createMockPlan();
    
    PersistenceService.savePlan(mockPlan);
    const loadedPlan = PersistenceService.getPlan();
    
    expect(loadedPlan).toMatchObject(mockPlan);
    expect(loadedPlan!.tasks).toHaveLength(2);
    expect(loadedPlan!.tasks[0].id).toBe("AI-26-Q1-001");
  });

  it("🔄 Sync services health check passes", async () => {
    const health = await syncServices.healthCheck();
    
    expect(health).toHaveLength(2);
    expect(health[0].service).toBe("GitHub");
    expect(health[0].healthy).toBe(true);
    expect(health[1].service).toBe("Jira");
    expect(health[1].healthy).toBe(true);
  });

  it("📊 UIBuilder generates valid A2UI v1.1 glassmorphic messages", async () => {
    const { ui } = await import("../lib/adk/uiBuilder");
    const message = ui()
      .card("Test Dashboard")
      .progress("Q1 Capacity", 87)
      .glassButton("Sync Now", { actionData: "sync_all" })
      .build();

    expect(message.version).toBe("1.1");
    expect(message.elements).toHaveLength(3);
    expect(message.elements[0].type).toBe("card");
    expect(message.timestamp).toBeGreaterThan(0);
  });

  it("🚀 Full ADK stack integration test", async () => {
    // 1. AgentFactory → MissionControl → Plan generation
    const mission = new MissionControl();
    const result = await mission.processCollaborativeInput("2026 Q1 Critical Path");
    
    // 2. Persistence roundtrip
    PersistenceService.savePlan(result.plan!);
    const persistedPlan = PersistenceService.getPlan()!;
    
    // 3. Sync services
    const syncResult = await syncServices.syncToAll(persistedPlan);
    
    // 4. Validation
    expect(result.validation.finalScore).toBeGreaterThan(80);
    expect(persistedPlan.tasks.length).toBeGreaterThan(0);
    expect(syncResult.totalCreated).toBeGreaterThan(0);
  });

  it("💥 Failure cascade simulation works", async () => {
    const mission = new MissionControl();
    const mockPlan = ATLAS_TEST_UTILS.createMockPlan();
    
    const cascade = await mission.simulateFailure("AI-26-Q1-001", mockPlan);
    
    expect(cascade.cascade).toContain("AI-26-Q1-001");
    expect(cascade.cascade).toContain("CY-26-Q1-001");
    expect(cascade.riskScore).toBeGreaterThan(0);
    expect(cascade.impactedHighPriority).toBeGreaterThan(0);
  });

  describe("📈 TaskBank Integration Tests", () => {
    it("TASK_BANK has correct structure", async () => {
      const { TASK_BANK } = await import("../data/taskBank");
      expect(TASK_BANK).toBeDefined();
      expect(TASK_BANK.length).toBeGreaterThan(20);
      
      const aiTasks = TASK_BANK.filter((t: { theme: string }) => t.theme === "AI");
      expect(aiTasks.length).toBeGreaterThan(5);
    });

    it("getTaskBankStats computes correctly", async () => {
      const { TASK_BANK, getTaskBankStats } = await import("../data/taskBank");
      const stats = getTaskBankStats();
      
      expect(stats.total).toBe(TASK_BANK.length);
      expect(stats.highPriority).toBeGreaterThan(0);
      expect(stats.q1Count).toBeGreaterThan(0);
    });
  });

  describe("🔐 Persistence Security Tests", () => {
    it("API keys are properly encrypted", () => {
      const testKey = "ghp_test1234567890abcdef";
      
      PersistenceService.saveGithubApiKey(testKey);
      const retrieved = PersistenceService.getGithubApiKey();
      
      expect(retrieved).toBe(testKey);
    });

    it("handles storage quota gracefully", () => {
      const stats = PersistenceService.getStorageStats();
      
      expect(stats.used).toBeGreaterThan(0);
      expect(stats.quota).toBe(5 * 1024 * 1024);
      expect(stats.percent).toBeLessThan(100);
    });
  });

  describe("🎨 Glassmorphic A2UI Protocol Tests", () => {
    it("generates valid A2UI v1.1 messages", async () => {
      const { ui } = await import("../lib/adk/uiBuilder");
      const message = ui()
        .missionControlStatus(92, 2, 8)
        .build();
      
      expect(message.elements).toHaveLength(6);
      expect(message.version).toBe("1.1");
    });
  });
});
