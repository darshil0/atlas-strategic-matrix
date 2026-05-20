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
  mockAgents
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

  const state = {
    plan: { ...plan },
    messages: [] as any[],
    secrets: {} as Record<string, string>,
  };

  const persistence = {
    getPlan: vi.fn(() => state.plan),
    savePlan: vi.fn((p) => { state.plan = p; }),
    getSecret: vi.fn((k) => state.secrets[k]),
    saveSecret: vi.fn((k, v) => { state.secrets[k] = v; }),
    getMessages: vi.fn(() => state.messages),
    saveMessages: vi.fn((m) => { state.messages = m; }),
    getSettings: vi.fn(() => ({})),
    saveSettings: vi.fn(),
    getStorageStats: vi.fn(() => ({ used: 100, quota: 5242880, percent: 0.002 })),
    clearAll: vi.fn(() => {
      state.plan = { ...plan };
      state.messages = [];
      state.secrets = {};
    }),
    getGithubApiKey: vi.fn(() => state.secrets["github_api_key_enc_v3.2"]),
    saveGithubApiKey: vi.fn((k) => { state.secrets["github_api_key_enc_v3.2"] = k; }),
    getJiraApiKey: vi.fn(() => state.secrets["jira_api_key_enc_v3.2"]),
    saveJiraApiKey: vi.fn((k) => { state.secrets["jira_api_key_enc_v3.2"] = k; }),
    getJiraDomain: vi.fn(() => "test"),
    getJiraEmail: vi.fn(() => "test"),
    getJiraProjectKey: vi.fn(() => "test"),
    getGithubOwner: vi.fn(() => "test"),
    getGithubRepo: vi.fn(() => "test"),
    getDebugMode: vi.fn(() => false),
    saveDebugMode: vi.fn(),
  };

  const sync = {
    syncToAll: vi.fn().mockResolvedValue({ totalCreated: 8 }),
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
      return plan;
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

  return { mockPlan: plan, mockPersistence: persistence, mockSync: sync, mockAtlasService: atlas, mockAgents: agents };
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

// === PERSISTENCE MOCK ===
vi.mock("@services/core/persistence", () => ({ PersistenceService: mockPersistence, default: mockPersistence }));
vi.mock("../services/core/persistence", () => ({ PersistenceService: mockPersistence, default: mockPersistence }));

// === AI MOCK ===
vi.mock("@services/ai/gemini", () => ({ AtlasService: mockAtlasService, default: mockAtlasService }));

// === AGENT FACTORY MOCK ===
vi.mock("../lib/adk/factory", () => ({
  AgentFactory: {
    getOrCreate: vi.fn((p) => mockAgents[p] || mockAgents.STRATEGIST),
    create: vi.fn((p) => mockAgents[p] || mockAgents.STRATEGIST),
    warmPool: vi.fn(),
    dispose: vi.fn(),
    poolSize: 4,
  },
  AgentSwarm: { execute: vi.fn().mockResolvedValue({ roadmap: mockPlan, finalScore: 90 }) },
}));

// === SERVICES MOCK ===
vi.mock("@services", () => ({
  syncServices: mockSync,
  githubService: { syncPlan: vi.fn() },
  jiraService: { syncPlan: vi.fn() },
  PersistenceService: mockPersistence,
  persistenceService: mockPersistence,
}));

vi.mock("../services", () => ({
  syncServices: mockSync,
  githubService: { syncPlan: vi.fn() },
  jiraService: { syncPlan: vi.fn() },
  PersistenceService: mockPersistence,
  persistenceService: mockPersistence,
}));

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
