/**
 * Atlas Integration Tests (v3.6.1)
 * Validates MissionControl swarm, Failure cascades, and Persistence
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MissionControl } from '../lib/adk/orchestrator';
import { PersistenceService } from '../services/persistenceService';
import { AgentFactory } from '../lib/adk/factory';
import { AgentPersona, Priority, TaskStatus, Plan, Message } from '@types';

describe('Atlas Strategic Integration', () => {
  let mission: MissionControl;

  beforeEach(() => {
    mission = new MissionControl();
    vi.clearAllMocks();
    PersistenceService.clearAll();
    // Reset agent pool for clean tests
    AgentFactory.dispose();
  });

  const mockPlan: Plan = {
    projectName: "Test Project",
    goal: "2026 AI Roadmap",
    tasks: [
      {
        id: "AI-26-Q1-001",
        description: "Task 1",
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        category: "2026 Q1",
        dependencies: []
      },
      {
        id: "AI-26-Q1-002",
        description: "Task 2",
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        category: "2026 Q1",
        dependencies: ["AI-26-Q1-001"]
      }
    ]
  };

  describe('MissionControl Orchestration', () => {
    it('should execute complete MissionControl pipeline', async () => {
      const result = await mission.processCollaborativeInput("2026 AI roadmap");

      expect(result.validation.finalScore).toBeGreaterThan(0);
      expect(result.plan?.tasks.length).toBeGreaterThan(0);
      expect(result.a2ui).toBeDefined();
      expect(result.text).toContain("Strategic plan synthesized");
    });

    it('should model failure cascades correctly', async () => {
      const cascade = await mission.simulateFailure("AI-26-Q1-001", mockPlan);

      expect(cascade.cascade).toContain("AI-26-Q1-001");
      expect(cascade.cascade).toContain("AI-26-Q1-002");
      expect(cascade.impactedHighPriority).toBe(2);
      expect(cascade.riskScore).toBe(100);
      expect(cascade.a2ui).toBeDefined();
    });
  });

  describe('PersistenceService Logic', () => {
    it('should persist and restore plan with encryption', async () => {
      PersistenceService.savePlan(mockPlan);

      // Wait for mutex
      await new Promise(r => setTimeout(r, 50));
      const loaded = PersistenceService.getPlan();
      expect(loaded).toMatchObject(mockPlan);
    });

    it('should handle concurrent writes using mutex', async () => {
      const plans = Array(10).fill(null).map((_, i) => ({
        ...mockPlan,
        goal: `Goal ${i}`
      }));

      plans.forEach(p => {
        PersistenceService.savePlan(p);
      });

      // Allow some time for operations to complete since they use setTimeout
      await new Promise(r => setTimeout(r, 500));

      const loaded = PersistenceService.getPlan();
      expect(loaded?.goal).toBe("Goal 9");
    });

    it('should persist and load messages', () => {
      const messages: Message[] = [
        { id: "1", role: "user", content: "Hello", timestamp: Date.now() },
        { id: "2", role: "assistant", content: "Hi", timestamp: Date.now() }
      ];
      PersistenceService.saveMessages(messages);
      const loaded = PersistenceService.getMessages();
      expect(loaded).toHaveLength(2);
      expect(loaded[0].content).toBe("Hello");
    });

    it('should manage secrets securely', () => {
      PersistenceService.saveGithubApiKey("ghp_test123");
      expect(PersistenceService.getGithubApiKey()).toBe("ghp_test123");

      PersistenceService.saveJiraApiKey("jira_test456");
      expect(PersistenceService.getJiraApiKey()).toBe("jira_test456");
    });
  });

  describe('AgentFactory Lifecycle', () => {
    it('should pool agents and dispose them', () => {
      const strategist1 = AgentFactory.getOrCreate(AgentPersona.STRATEGIST);
      const strategist2 = AgentFactory.getOrCreate(AgentPersona.STRATEGIST);

      expect(strategist1).toBe(strategist2);

      AgentFactory.dispose();
      const strategist3 = AgentFactory.getOrCreate(AgentPersona.STRATEGIST);
      expect(strategist3).not.toBe(strategist1);
    });

    it('should respect MAX_POOL_SIZE', () => {
      [AgentPersona.STRATEGIST, AgentPersona.ANALYST, AgentPersona.CRITIC, AgentPersona.ARCHITECT].forEach(p => {
        AgentFactory.getOrCreate(p);
      });
      expect(AgentFactory["poolSize"]).toBe(4);
    });
  });
});
