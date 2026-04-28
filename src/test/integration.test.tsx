/**
 * Atlas Integration Tests (v3.6.1)
 * Validates MissionControl swarm, Failure cascades, and Persistence
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MissionControl } from '../lib/adk/orchestrator';
import { PersistenceService } from '../services/core/persistence';
import { AgentFactory } from '../lib/adk/factory';
import { AgentPersona, Priority, TaskStatus, Plan, Message } from '@types';
import { GithubService } from '../services/integrations/github';
import { JiraService } from '../services/integrations/jira';

describe('Atlas Strategic Integration', () => {
  let mission: MissionControl;

  beforeEach(() => {
    mission = new MissionControl();
    vi.clearAllMocks();
    PersistenceService.clearAll();
    // Reset agent pool for clean tests
    AgentFactory.dispose();

    // Mock global fetch
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    }));
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
      await new Promise(r => setTimeout(r, 100));
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
      await new Promise(r => setTimeout(r, 1000));

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

  describe('Integration Services (GitHub/Jira)', () => {
    beforeEach(() => {
        vi.mocked(PersistenceService.getGithubApiKey).mockReturnValue('ghp_test');
        vi.mocked(PersistenceService.getGithubOwner).mockReturnValue('test-owner');
        vi.mocked(PersistenceService.getGithubRepo).mockReturnValue('test-repo');

        vi.mocked(PersistenceService.getJiraApiKey).mockReturnValue('jira_test');
        vi.mocked(PersistenceService.getJiraDomain).mockReturnValue('test-domain');
        vi.mocked(PersistenceService.getJiraProjectKey).mockReturnValue('ATLAS');
        vi.mocked(PersistenceService.getJiraEmail).mockReturnValue('test@example.com');
    });

    it('should handle GitHub API retries on 500 error', async () => {
        const github = new GithubService();
        const task = mockPlan.tasks[0];

        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: async () => ({ message: 'Server crashed' }),
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ id: 1, number: 101, html_url: 'url' }),
            } as Response));

        const result = await github.createIssue(task);
        expect(result.issueNumber).toBe(101);
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle Jira API retries on 429 Too Many Requests', async () => {
        const jira = new JiraService();
        const task = mockPlan.tasks[0];

        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce({
                ok: false,
                status: 429,
                statusText: 'Too Many Requests',
                json: async () => ({ errorMessages: ['Rate limit exceeded'] }),
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ id: '10001', key: 'ATLAS-1' }),
            } as Response));

        const result = await jira.createTicket(task);
        expect(result.success).toBe(true);
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should skip existing GitHub issues during syncPlan', async () => {
        const github = new GithubService();

        vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url) => {
            const urlStr = String(url);
            if (urlStr.includes('/milestones')) return { ok: true, status: 200, json: async () => [] } as Response;
            if (urlStr.includes('/issues?labels=')) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => [{ id: 1, number: 101, title: '[AI-26-Q1-001] Test', state: 'open', labels: ['AI-26-Q1-001'] }]
                } as Response;
            }
            return { ok: true, status: 200, json: async () => ({}) } as Response;
        }));

        const result = await github.syncPlan(mockPlan.tasks);
        expect(result.skipped).toBe(2); // Both tasks exist in this mock implementation
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
      // @ts-expect-error - accessing private field for test
      expect(AgentFactory.poolSize).toBe(4);
    });
  });
});
