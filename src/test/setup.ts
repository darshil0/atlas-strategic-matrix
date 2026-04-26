/**
 * Atlas Vitest Setup (v3.6.1) - Glassmorphic Test Environment
 * Production test configuration for MissionControl → AgentFactory → ReactFlow
 * Perfect mocks for PersistenceService, GitHub/Jira sync, localStorage encryption
 */

// src/test/setup.ts
import { expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { TaskStatus, Priority } from '@types';
import type { Plan, Message } from "@types";

// Extend Vitest expect with jest-dom matchers
expect.extend(matchers);

// Cleanup React components after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// === BROWSER ENVIRONMENT MOCKS ===
Element.prototype.scrollIntoView = vi.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),      // deprecated
    removeListener: vi.fn(),   // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn().mockReturnValue(true),
  })),
});

// === PRODUCTION LOCALSTORAGE MOCK ===
class AtlasLocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value.toString();
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

const localStorageMock = new AtlasLocalStorageMock();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// === ATLAS-SPECIFIC MOCKS ===
const mockState = {
  plan: null as Plan | null,
  secrets: {} as Record<string, string>,
  messages: [] as Message[],
};

vi.mock('@config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@config')>();
  return {
    ...actual,
    ENV: {
      ...actual.ENV,
      GEMINI_API_KEY: 'test-api-key-12345',
      DEBUG_MODE: false,
    },
  };
});

// Mock PersistenceService
vi.mock('@services/persistenceService', () => ({
  PersistenceService: {
    getPlan: vi.fn(() => mockState.plan),
    savePlan: vi.fn((plan) => { mockState.plan = plan; }),
    getSecret: vi.fn((key) => mockState.secrets[key]),
    saveSecret: vi.fn((key, val) => { mockState.secrets[key] = val; }),
    getMessages: vi.fn(() => mockState.messages),
    saveMessages: vi.fn((msgs) => { mockState.messages = msgs; }),
    getSettings: vi.fn().mockReturnValue({}),
    saveSettings: vi.fn(),
    getGithubConfig: vi.fn().mockReturnValue(null),
    saveGithubConfig: vi.fn(),
    getJiraConfig: vi.fn().mockReturnValue(null),
    saveJiraConfig: vi.fn(),
    saveWorkflow: vi.fn(),
    getStorageStats: vi.fn().mockReturnValue({ used: 100, quota: 5242880, percent: 0.002 }),
    clearAll: vi.fn(() => {
      mockState.plan = null;
      mockState.secrets = {};
      mockState.messages = [];
    }),
    getGithubApiKey: vi.fn(() => mockState.secrets["github_api_key_enc_v3.2"]),
    saveGithubApiKey: vi.fn((key) => { mockState.secrets["github_api_key_enc_v3.2"] = key; }),
    getJiraApiKey: vi.fn(() => mockState.secrets["jira_api_key_enc_v3.2"]),
    saveJiraApiKey: vi.fn((key) => { mockState.secrets["jira_api_key_enc_v3.2"] = key; }),
    getJiraDomain: vi.fn(),
    getJiraEmail: vi.fn(),
    getGithubOwner: vi.fn(),
    getGithubRepo: vi.fn(),
  },
}));

// Mock AtlasService
vi.mock('@services/geminiService', () => ({
  AtlasService: {
    generatePlan: vi.fn().mockImplementation(async () => ATLAS_TEST_UTILS.createMockPlan()),
    executeSubtask: vi.fn().mockResolvedValue({ text: 'Subtask executed' }),
    summarizeMission: vi.fn().mockResolvedValue('Mission summary'),
  },
}));

// Mock sync services
vi.mock('@services', () => ({
  githubService: {
    createIssue: vi.fn().mockResolvedValue({ issueNumber: 123, htmlUrl: 'https://github.com/test' }),
    syncPlan: vi.fn().mockResolvedValue({ created: 5, skipped: 0, failed: [] }),
  },
  jiraService: {
    createTicket: vi.fn().mockResolvedValue({ success: true, issueKey: 'ATLAS-123' }),
    syncPlan: vi.fn().mockResolvedValue({ created: 3, skipped: 0, failed: [] }),
  },
  syncServices: {
    syncToAll: vi.fn().mockResolvedValue({ totalCreated: 8 }),
    healthCheck: vi.fn().mockResolvedValue([{ service: 'GitHub', healthy: true }, { service: 'Jira', healthy: true }]),
  },
}));

beforeEach(() => {
  // Reset localStorage for each test
  localStorageMock.clear();

  // Mock IntersectionObserver for ReactFlow
  const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }));

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
});

// === CONSOLE MOCKING ===
const originalConsoleError = console.error;
global.console = {
  ...console,
  error: (...args: unknown[]) => {
    // Suppress React error boundaries and Vitest warnings
    const errorMsg = args[0]?.toString?.();
    if (
      errorMsg?.includes('Error: Uncaught') ||
      errorMsg?.includes('Warning:') ||
      errorMsg?.includes('act') ||
      errorMsg?.includes('findBy') ||
      errorMsg?.includes('PersistenceService')
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  },
  warn: vi.fn(), // Suppress warnings in tests
  log: vi.fn(),  // Optional: suppress logs
} as unknown as Console;

// === ATLAS-SPECIFIC TEST UTILITIES ===
export const ATLAS_TEST_UTILS = {
  /**
   * Create mock 2026 Q1 plan for testing
   */
  createMockPlan: (): Plan => ({
    projectName: "Test Project",
    goal: 'AI Transformation Q1 2026',
    tasks: [
      {
        id: 'AI-26-Q1-001',
        description: 'Deploy Multi-Modal Agent Orchestration',
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        category: '2026 Q1',
        theme: 'AI',
        dependencies: [],
      },
      {
        id: 'CY-26-Q1-001',
        description: 'Deploy Zero-Trust Identity Fabric',
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        category: '2026 Q1',
        theme: 'Cyber',
        dependencies: ['AI-26-Q1-001'],
      },
    ],
  }),

  /**
   * Mock MissionControl response
   */
  mockMissionControlResponse: (): unknown => ({
    text: '🏛️ ATLAS v3.6.1 SYNTHESIS COMPLETE\nQuality Score: 92/100',
    validation: {
      iterations: 2,
      finalScore: 92,
      graphReady: true,
      q1HighCount: 8,
    },
    plan: ATLAS_TEST_UTILS.createMockPlan(),
  }),

  /**
   * Clear all Atlas mocks and reset
   */
  resetAtlasMocks: (): void => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.restoreAllMocks();
  },
};

// === GLASSMORPHIC CSS MOCKS ===
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(),
  writable: true,
});

// Mock ResizeObserver for glassmorphic charts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock crypto.randomUUID for consistent test IDs
let uuidCounter = 0;
vi.stubGlobal('crypto', {
  getRandomValues: vi.fn(() => new Uint8Array(32)),
  randomUUID: vi.fn(() => `12345678-1234-1234-1234-12345678901${uuidCounter++ % 10}`),
});

// Vitest snapshot serializer for A2UI messages
expect.addSnapshotSerializer({
  test: (val: unknown) => {
    const v = val as { version?: string; elements?: unknown[] };
    return v?.version === '1.1' && Array.isArray(v.elements);
  },
  serialize: (val: unknown) => {
    const v = val as { elements: unknown[] };
    return `A2UIMessage(v1.1, ${v.elements.length} elements)`;
  },
});

(globalThis as Record<string, unknown>).ATLAS_TEST_UTILS = ATLAS_TEST_UTILS;
