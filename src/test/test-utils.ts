/**
 * Atlas Test Utilities (v3.6.3)
 * Shared mocks and helpers for the strategic test suite
 */

import { TaskStatus, Priority } from '@types';
import type { Plan } from "@types";

export const ATLAS_TEST_UTILS = {
  /**
   * Create mock 2026 Q1 plan for testing
   */
  createMockPlan: (): Plan => ({
    projectName: "Test Project",
    goal: "AI Transformation Q1 2026",
    tasks: [
      {
        id: "AI-26-Q1-001",
        description: "Deploy Multi-Modal Agent Orchestration",
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        category: "2026 Q1",
        theme: "AI",
        dependencies: [],
      },
      {
        id: "CY-26-Q1-001",
        description: "Deploy Zero-Trust Identity Fabric",
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        category: "2026 Q1",
        theme: "Cyber",
        dependencies: ["AI-26-Q1-001"],
      },
    ],
  }),

  /**
   * Mock MissionControl response
   */
  mockMissionControlResponse: (): unknown => ({
    text: '🏛️ ATLAS v3.6.3 SYNTHESIS COMPLETE\nQuality Score: 92/100',
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
    // vi is global
    vi.clearAllMocks();
    localStorage.clear();
    vi.restoreAllMocks();
  },
};
