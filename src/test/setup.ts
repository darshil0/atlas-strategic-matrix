/**
 * Atlas Vitest Setup (v3.6.3) - Glassmorphic Test Environment
 */

import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

const {
  mockPlan,
  mockPersistence,
  mockSync,
  mockAtlasService,
  mockAgents,
  mockState
} = vi.hoisted(() => {
  const plan = {
    projectName: "Test Project",
    goal: "AI Transformation Q1 2026",
    tasks: [
      {
        id: "AI-26-Q1-001",
        description: "Deploy Multi-Modal Agent Orchestration",
        status: "PENDING",
        priority: "HIGH",
        category: "2026 Q1",
        theme: "AI",
        dependencies: [],
      },
      {
        id: "CY-26-Q1-001",
        description: "Deploy Zero-Trust Identity Fabric",
        status: "PENDING",
        priority: "HIGH",
        category: "2026 Q1",
        theme: "Cyber",
        dependencies: ["AI-26-Q1-001"],
      },
    ],
  };

  const mockState = {
    plan: { ...plan } as any,
    messages: [] as any[],
    secrets: {} as Record<string, string>,
  };

  const persistence = {
    getPlan: vi.fn(() => mockState.plan),
    savePlan: vi.fn((p) => { mockState.plan = p; }),
    getSecret: vi.fn((k) => mockState.secrets[k]),
    saveSecret: vi.fn((k, v) => { mockState.secrets[k] = v; }),
    getMessages: vi.fn(() => mockState.messages),
    saveMessages: vi.fn((m) => { mockState.messages = m; }),
    getSettings: vi.fn(() => ({})),
    saveSettings: vi.fn(),
    getStorageStats: vi.fn(() => ({ used: 100, quota: 5242880, percent: 0.002, remaining: 5242780 })),
    clearAll: vi.fn(() => {
      mockState.plan = { ...plan };
      mockState.messages = [];
      mockState.secrets = {};
    }),
    getGithubApiKey: vi.fn(() => mockState.secrets["github_api_key_enc_v3.2"]),
    saveGithubApiKey: vi.fn((k) => { mockState.secrets["github_api_key_enc_v3.2"] = k; }),
    getJiraApiKey: vi.fn(() => mockState.secrets["jira_api_key_enc_v3.2"]),
    saveJiraApiKey: vi.fn((k) => { mockState.secrets["jira_api_key_enc_v3.2"] = k; }),
    getJiraDomain: vi.fn(() => "test"),
    getJiraEmail: vi.fn(() => "test"),
    getJiraProjectKey: vi.fn(() => "test"),
    getGithubOwner: vi.fn(() => "test"),
    getGithubRepo: vi.fn(() => "test"),
    getDebugMode: vi.fn(() => false),
    saveDebugMode: vi.fn(),
    getGithubConfig: vi.fn().mockReturnValue(null),
    saveGithubConfig: vi.fn(),
    getJiraConfig: vi.fn().mockReturnValue(null),
    saveJiraConfig: vi.fn(),
    saveWorkflow: vi.fn(),
  };

  const sync = {
    syncToAll: vi.fn().mockResolvedValue({ 
        totalCreated: 8,
        github: { created: 5, skipped: 0, failed: [], epics: {} },
        jira: { created: 3, skipped: 0, failed: [], epics: {} },
        timestamp: new Date().toISOString()
    }),
    healthCheck: vi.fn().mockResolvedValue([
      { service: "GitHub", healthy: true },
      { service: "Jira", healthy: true },
    ]),
  };

  const atlas = {
    generatePlan: vi.fn().mockResolvedValue(plan),
    executeSubtask: vi.fn().mockResolvedValue({ text: "Done" }),
    summarizeMission: vi.fn().mockResolvedValue("Summary"),
  };

  const createMockAgent = (name: string) => ({
    name,
    description: `Mock ${name} Agent`,
    execute: vi.fn().mockImplementation(async (goal, context) => {
      if (name === "ANALYST") return { feasibility: 90, risks: [], confidence: 95, recommendations: [] };
      if (name === "CRITIC") return { score: 90, issues: [], optimizations: [], graphValid: true };
      return mockState.plan;
    }),
    getInitialUI: vi.fn(() => ({ version: "1.1", elements: [] })),
    handleEvent: vi.fn().mockResolvedValue({ version: "1.1", elements: [] }),
  });

  const agents = {
    STRATEGIST: createMockAgent("STRATEGIST"),
    ANALYST: createMockAgent("ANALYST"),
    CRITIC: createMockAgent("CRITIC"),
    ARCHITECT: createMockAgent("ARCHITECT"),
  };

  return { mockPlan: plan, mockPersistence: persistence, mockSync: sync, mockAtlasService: atlas, mockAgents: agents, mockState };
});

// === CONFIG MOCK ===
vi.mock("@config", () => ({
  ENV: { GEMINI_API_KEY: "test", DEBUG_MODE: false, APP_VERSION: "3.6.3" },
  SYSTEM_CONSTANTS: { CRITIC_ACCEPTANCE_SCORE: 85, Q1_TASK_CAPACITY: 12, BOOT_LOADER_DELAY_MS: 0 },
  ATLAS_SYSTEM_INSTRUCTION: "Test",
  ICONS: { STRATEGIC: "icon" },
  validateAtlasPrompt: vi.fn(() => true),
  bootstrapConfig: vi.fn().mockResolvedValue(true),
  logConfig: vi.fn(),
}));

// Mock PersistenceService
vi.mock("@services/core/persistence", () => ({
  default: mockPersistence,
  PersistenceService: mockPersistence,
  AgentSwarm: { execute: vi.fn().mockResolvedValue({ roadmap: mockPlan, finalScore: 90 }) },
}));

// Mock AtlasService
vi.mock("@services/ai/gemini", () => ({
  default: mockAtlasService,
  AtlasService: mockAtlasService,
}));

// Mock Agents Factory
vi.mock("@lib/adk/factory", () => ({
  AgentFactory: {
    create: vi.fn((persona) => mockAgents[persona]),
    getOrCreate: vi.fn((persona) => mockAgents[persona]),
    createSwarmPipeline: vi.fn(() => [mockAgents.STRATEGIST, mockAgents.ANALYST, mockAgents.CRITIC]),
    warmPool: vi.fn(),
    dispose: vi.fn(),
  },
  AgentSwarm: {
    execute: vi.fn().mockResolvedValue({
      roadmap: mockPlan,
      analysis: { feasibility: 90, risks: [], confidence: 95, recommendations: [] },
      review: { score: 90, issues: [], optimizations: [], graphValid: true },
      finalScore: 90,
      readyForVisualization: true
    })
  }
}));

// Mock sync services - use relative path as well for smoke.test.ts
const mockServices = {
    githubService: {
      createIssue: vi.fn().mockResolvedValue({
        issueNumber: 123,
        htmlUrl: "https://github.com/test",
      }),
      syncPlan: vi.fn().mockResolvedValue({ created: 5, skipped: 0, failed: [] }),
    },
    jiraService: {
      createTicket: vi
        .fn()
        .mockResolvedValue({ success: true, issueKey: "ATLAS-123" }),
      syncPlan: vi.fn().mockResolvedValue({ created: 3, skipped: 0, failed: [] }),
    },
    syncServices: mockSync,
    persistenceService: mockPersistence,
    atlasService: mockAtlasService,
};

vi.mock("@services", () => ({
    ...mockServices
}));
vi.mock("../services", () => ({
    ...mockServices
}));

// Mock ADK barrel
vi.mock("@lib/adk", async (importOriginal) => {
  const actual = await importOriginal<typeof import('@lib/adk')>();
  return {
    ...actual,
    AgentFactory: {
      create: vi.fn((persona) => mockAgents[persona]),
      getOrCreate: vi.fn((persona) => mockAgents[persona]),
      createSwarmPipeline: vi.fn(() => [mockAgents.STRATEGIST, mockAgents.ANALYST, mockAgents.CRITIC]),
      warmPool: vi.fn(),
      dispose: vi.fn(),
    },
    AgentSwarm: {
      execute: vi.fn().mockResolvedValue({
        roadmap: mockPlan,
        analysis: { feasibility: 90, risks: [], confidence: 95, recommendations: [] },
        review: { score: 90, issues: [], optimizations: [], graphValid: true },
        finalScore: 90,
        readyForVisualization: true
      })
    },
    MissionControl: class {
        processCollaborativeInput = vi.fn().mockImplementation(async (goal) => {
            return {
                text: "Strategic plan synthesized",
                a2ui: { version: "1.1", elements: [], timestamp: Date.now() },
                plan: mockPlan,
                validation: {
                    iterations: 1,
                    finalScore: 90,
                    graphReady: true,
                    q1HighCount: 2
                }
            };
        });
        simulateFailure = vi.fn().mockImplementation(async (taskId, plan) => {
             return {
                cascade: [taskId, "CY-26-Q1-001"],
                riskScore: 100,
                impactedHighPriority: 2,
                a2ui: { version: "1.1", elements: [], timestamp: Date.now() }
             };
        });
        alignWithTaskBank = vi.fn().mockImplementation((tasks) => tasks);
        summarizeMission = vi.fn().mockImplementation((plan, history) => "Summary");
    },
    syncServices: mockSync,
  };
});

// === BROWSER MOCKS ===
Element.prototype.scrollIntoView = vi.fn();
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn().mockReturnValue(true),
  })),
});
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => { localStorageMock.store[key] = String(value); }),
  removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
  clear: vi.fn(() => { localStorageMock.store = {}; }),
  length: 0,
  key: vi.fn((i) => Object.keys(localStorageMock.store)[i] || null),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

global.ResizeObserver = vi.fn(() => ({ observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }));
vi.stubGlobal("crypto", {
  getRandomValues: vi.fn(() => new Uint8Array(32)),
  randomUUID: vi.fn(() => "12345678-1234-1234-1234-123456789012"),
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  mockPersistence.clearAll();
});
