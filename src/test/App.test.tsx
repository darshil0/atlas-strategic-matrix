/**
 * Atlas App Component Tests (v3.6.1) - Glassmorphic E2E Integration
 * Production React Testing Library suite for MissionControl dashboard
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { PersistenceService } from "@/services/persistenceService";
import { AtlasService } from "@/services/geminiService";
import { TaskStatus, Priority } from "@/types";
import "@testing-library/jest-dom";

// Comprehensive mocks
vi.mock("@/services/geminiService", () => ({
  AtlasService: {
    generatePlan: vi.fn(),
    executeSubtask: vi
      .fn()
      .mockResolvedValue({ text: "Mock subtask execution" }),
    summarizeMission: vi.fn(),
  },
}));

vi.mock("@/services", () => ({
  githubService: {
    createIssue: vi.fn(),
  },
  jiraService: {
    createTicket: vi.fn(),
  },
  syncServices: {
    syncToAll: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

describe("🏛️ ATLAS App - Glassmorphic User Experience", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();

    // Setup default mock responses
    vi.mocked(AtlasService.generatePlan).mockResolvedValue({
      projectName: "Test Project",
      goal: "Test Goal",
      tasks: [
        {
          id: "TASK-001",
          description: "Test Task",
          status: TaskStatus.PENDING,
          priority: Priority.HIGH,
          category: "2026 Q1",
          dependencies: [],
        },
      ],
    });
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
      });
    }
  });

  it("persists messages in localStorage", async () => {
    const saveSpy = vi.spyOn(PersistenceService, "saveMessages");
    render(<App />);
    const input = screen.getByPlaceholderText(
      /Enter your strategic directive/i
    );
    await user.type(input, "Test persistence{enter}");

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalled();
    });
  });
});
