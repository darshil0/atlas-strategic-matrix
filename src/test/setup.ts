/**
 * Atlas Vitest Setup (v3.6.3) - Glassmorphic Test Environment
 */

import { vi, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// === BROWSER ENVIRONMENT MOCKS ===
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
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => { localStorageMock.store[key] = String(value); }),
  removeItem: vi.fn((key: string) => { delete localStorageMock.store[key]; }),
  clear: vi.fn(() => { localStorageMock.store = {}; }),
  length: 0,
  key: vi.fn((i: number) => Object.keys(localStorageMock.store)[i] || null),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

global.ResizeObserver = vi.fn(() => ({ observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }));

vi.stubGlobal("crypto", {
  getRandomValues: vi.fn(() => new Uint8Array(32)),
  randomUUID: vi.fn(() => "12345678-1234-1234-1234-123456789012"),
});

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn();
}

// === GLOBAL SERVICE MOCKS (STRUCTURAL) ===
// We mock the module paths globally to prevent actual network/logic,
// but keep implementations minimal so tests can override them.

vi.mock("@config", () => ({
  ENV: { GEMINI_API_KEY: "test-key", DEBUG_MODE: false, APP_VERSION: "3.6.3" },
  SYSTEM_CONSTANTS: {
    CRITIC_ACCEPTANCE_SCORE: 85,
    Q1_TASK_CAPACITY: 12,
    BOOT_LOADER_DELAY_MS: 0,
    DEFAULT_RETRY_COUNT: 3,
    INITIAL_BACKOFF_MS: 1,
    MAX_CONCURRENT_API_CALLS: 3,
    GITHUB_API_VERSION: "2022-11-28",
    JIRA_API_VERSION: "3",
    GEMINI_TIMEOUT_MS: 45000
  },
  ATLAS_SYSTEM_INSTRUCTION: "Mock Instruction",
  ICONS: { STRATEGIC: "icon" },
  validateAtlasPrompt: vi.fn(() => true),
  bootstrapConfig: vi.fn().mockResolvedValue(true),
  logConfig: vi.fn(),
}));

// Provide basic mocks for core modules used across many tests
vi.mock("@services/core/persistence", () => ({
  PersistenceService: {
    getPlan: vi.fn(),
    savePlan: vi.fn(),
    getMessages: vi.fn(() => []),
    saveMessages: vi.fn(),
    getSecret: vi.fn(),
    saveSecret: vi.fn(),
    clearAll: vi.fn(),
    getGithubApiKey: vi.fn(),
    getJiraApiKey: vi.fn(),
    getStorageStats: vi.fn(() => ({ used: 0, quota: 5242880, percent: 0, remaining: 5242880 })),
  },
  default: {
    getPlan: vi.fn(),
    savePlan: vi.fn(),
    getMessages: vi.fn(() => []),
    saveMessages: vi.fn(),
    clearAll: vi.fn(),
  }
}));

vi.mock("@services/ai/gemini", () => ({
  AtlasService: {
    generatePlan: vi.fn(),
    executeSubtask: vi.fn(),
    summarizeMission: vi.fn(),
  },
  default: {
    generatePlan: vi.fn(),
  }
}));

// === CLEANUP ===
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
