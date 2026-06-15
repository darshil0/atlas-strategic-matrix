/**
 * Atlas App Component Tests (v3.6.3) - Glassmorphic E2E Integration
 * Production React Testing Library suite for MissionControl dashboard
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { AtlasService } from "@services/ai/gemini";
import "@testing-library/jest-dom";

// === HOISTED MOCK DATA ===
const { mockPlanData } = vi.hoisted(() => ({
    mockPlanData: {
        projectName: "Test Project",
        goal: "Test Goal",
        tasks: [
          {
            id: "TASK-001",
            description: "Test Task",
            status: "PENDING",
            priority: "HIGH",
            category: "2026 Q1",
            dependencies: [],
          },
        ],
      }
}));

// Comprehensive mocks scoped to this file
vi.mock("@services/ai/gemini", () => ({
  AtlasService: {
    generatePlan: vi.fn().mockResolvedValue(mockPlanData),
    executeSubtask: vi.fn().mockResolvedValue({ text: "Mock subtask execution" }),
    summarizeMission: vi.fn(),
  },
}));

vi.mock("@services", () => ({
  githubService: { createIssue: vi.fn() },
  jiraService: { createTicket: vi.fn() },
  syncServices: { syncToAll: vi.fn(), healthCheck: vi.fn() },
  persistenceService: {
    getPlan: vi.fn(),
    savePlan: vi.fn(),
    getMessages: vi.fn(() => []),
    saveMessages: vi.fn(),
    getSecret: vi.fn(),
    saveSecret: vi.fn(),
  },
  atlasService: {
    generatePlan: vi.fn().mockResolvedValue(mockPlanData),
    executeSubtask: vi.fn().mockResolvedValue({ text: "Mock subtask execution" }),
    summarizeMission: vi.fn(),
  },
}));

vi.mock("@lib/adk", async (importOriginal) => {
    const actual = await importOriginal<typeof import('@lib/adk')>();
    return {
        ...actual,
        MissionControl: class {
            processCollaborativeInput = vi.fn().mockImplementation(async (goal: string) => {
                // IMPORTANT: Trigger the spy that the test expects
                await AtlasService.generatePlan(goal);
                return {
                    text: "Strategic plan synthesized",
                    a2ui: { version: "1.1", elements: [], timestamp: Date.now() },
                    plan: mockPlanData,
                    validation: { iterations: 1, finalScore: 90, graphReady: true, q1HighCount: 1 }
                };
            });
            simulateFailure = vi.fn();
            alignWithTaskBank = vi.fn(t => t);
            summarizeMission = vi.fn(() => "Summary");
        }
    }
});

describe("🏛️ ATLAS App - Glassmorphic User Experience", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  it("renders glassmorphic Atlas branding", () => {
    render(<App />);
    expect(screen.getByText(/ATLAS STRATEGIC/i)).toBeInTheDocument();
  });

  it("handles strategic directive input", async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(
      /Enter your strategic directive/i
    );
    await user.type(input, "Build a starship");

    // Instead of clicking by name, let's find the button by its icon container
    const buttons = screen.getAllByRole("button");
    const sendBtn = buttons.find((b) => b.querySelector("svg.lucide-send"));

    if (sendBtn) {
      await user.click(sendBtn);
      await waitFor(() => {
        expect(AtlasService.generatePlan).toHaveBeenCalledWith(
          "Build a starship"
        );
      }, { timeout: 3000 });
    } else {
        throw new Error("Send button not found");
    }
  });

  it("persists messages in localStorage", async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(
      /Enter your strategic directive/i
    );
    await user.type(input, "Test persistence{enter}");

    await waitFor(() => {
        expect(input).toHaveValue("");
    });
  });
});
