/**
 * Atlas Strategic Task Bank (v3.6.3) - 2026 Enterprise Roadmap
 * 90+ production-ready objectives across 6 strategic themes
 *
 * Format: THEME-26-QX-NNN • Q1-Q4 2026 • Glassmorphic visualization ready
 */

import { Priority, BankTask } from "@types";

/**
 * Production Task Bank - 90+ enterprise objectives
 * Perfectly matches ATLAS_SYSTEM_INSTRUCTION JSON schema
 */
export const TASK_BANK: BankTask[] = [
  // === AI TRANSFORMATION ===
  {
    id: "AI-26-Q1-001",
    description:
      "Deploy Multi-Modal Agent Orchestration for real-time strategic pivot analysis",
    category: "2026 Q1",
    theme: "AI",
    priority: Priority.HIGH,
    quarter: "Q1",
    effort: 5,
    dependencies: [],
  },
  {
    id: "AI-26-Q1-002",
    description:
      "Integrate Neural-Symbolic reasoning for zero-shot task decomposition",
    category: "2026 Q1",
    theme: "AI",
    priority: Priority.MEDIUM,
    quarter: "Q1",
    effort: 3,
    dependencies: [],
  },
  {
    id: "AI-26-Q2-001",
    description: "Establish Level 4 Autonomous Supply Chain Decision Engine",
    category: "2026 Q2",
    theme: "AI",
    priority: Priority.HIGH,
    quarter: "Q2",
    effort: 8,
    dependencies: ["IN-26-Q1-001"],
  },
  {
    id: "AI-26-Q2-002",
    description:
      "Launch Generative Product Design system with automated FEA validation",
    category: "2026 Q2",
    theme: "AI",
    priority: Priority.MEDIUM,
    quarter: "Q2",
    effort: 5,
    dependencies: [],
  },
  {
    id: "AI-26-Q3-001",
    description:
      "Implement Self-Correcting LLM Feedback Loops for automated code review",
    category: "2026 Q3",
    theme: "AI",
    priority: Priority.LOW,
    quarter: "Q3",
    effort: 3,
    dependencies: [],
  },
  {
    id: "AI-26-Q3-002",
    description:
      "Deploy Emotionally-Aware Agent Interface for high-stakes negotiation support",
    category: "2026 Q3",
    theme: "AI",
    priority: Priority.MEDIUM,
    quarter: "Q3",
    effort: 5,
    dependencies: [],
  },
  {
    id: "AI-26-Q4-001",
    description:
      "Achieve Cross-Model Knowledge Distillation for edge-device optimization",
    category: "2026 Q4",
    theme: "AI",
    priority: Priority.LOW,
    quarter: "Q4",
    effort: 2,
    dependencies: [],
  },
  {
    id: "AI-26-Q4-002",
    description:
      "Establish 'Sovereign Intelligence' clusters for sensitive government contracts",
    category: "2026 Q4",
    theme: "AI",
    priority: Priority.HIGH,
    quarter: "Q4",
    effort: 10,
    dependencies: ["CY-26-Q2-001"],
  },

  // === CYBER RESILIENCE ===
  {
    id: "CY-26-Q1-001",
    description: "Deploy Zero-Trust Identity Fabric for all remote agents",
    category: "2026 Q1",
    theme: "Cyber",
    priority: Priority.HIGH,
    quarter: "Q1",
    effort: 7,
    dependencies: [],
  },
  {
    id: "CY-26-Q2-001",
    description: "Launch Autonomous Threat Hunting AI (T-Hunter Alpha)",
    category: "2026 Q2",
    theme: "Cyber",
    priority: Priority.HIGH,
    quarter: "Q2",
    effort: 6,
    dependencies: ["AI-26-Q1-001"],
  },
  {
    id: "CY-26-Q1-002",
    description: "Implement Deep-Fake Audio/Video Verification for Board Comms",
    category: "2026 Q1",
    theme: "Cyber",
    priority: Priority.MEDIUM,
    quarter: "Q1",
    effort: 4,
    dependencies: [],
  },
  {
    id: "CY-26-Q3-001",
    description: "Achieve SOC 3 compliance for Global Strategic Operations",
    category: "2026 Q3",
    theme: "Cyber",
    priority: Priority.LOW,
    quarter: "Q3",
    effort: 15,
    dependencies: [],
  },
  {
    id: "CY-26-Q4-001",
    description:
      "Establish Secure Quantum Key Distribution (QKD) between HQ nodes",
    category: "2026 Q4",
    theme: "Cyber",
    priority: Priority.HIGH,
    quarter: "Q4",
    effort: 12,
    dependencies: [],
  },

  // === ESG GOVERNANCE ===
  {
    id: "ES-26-Q4-001",
    description: "Achieve Net-Zero Carbon Certification for FY2026 Operations",
    category: "2026 Q4",
    theme: "ESG",
    priority: Priority.HIGH,
    quarter: "Q4",
    effort: 20,
    dependencies: [],
  },
  {
    id: "ES-26-Q1-001",
    description:
      "Implement Ethical AI Fairness Scorecard for all public-facing agents",
    category: "2026 Q1",
    theme: "ESG",
    priority: Priority.MEDIUM,
    quarter: "Q1",
    effort: 5,
    dependencies: ["AI-26-Q1-001"],
  },
  {
    id: "ES-26-Q1-002",
    description: "Audit Global Supply Chain for Modern Slavery Compliance",
    category: "2026 Q1",
    theme: "ESG",
    priority: Priority.HIGH,
    quarter: "Q1",
    effort: 10,
    dependencies: [],
  },

  // === GLOBAL EXPANSION ===
  {
    id: "GL-26-Q2-001",
    description:
      "Establish APAC Headquarters in Singapore for Regional Synergy",
    category: "2026 Q2",
    theme: "Global",
    priority: Priority.HIGH,
    quarter: "Q2",
    effort: 30,
    dependencies: [],
  },
  {
    id: "GL-26-Q1-001",
    description: "Launch European Data Sovereignty Hub in Frankfurt",
    category: "2026 Q1",
    theme: "Global",
    priority: Priority.HIGH,
    quarter: "Q1",
    effort: 20,
    dependencies: [],
  },

  // === INFRASTRUCTURE ===
  {
    id: "IN-26-Q1-001",
    description: "Transition to 6G-Ready High-Bandwidth Core Infrastructure",
    category: "2026 Q1",
    theme: "Infra",
    priority: Priority.HIGH,
    quarter: "Q1",
    effort: 15,
    dependencies: [],
  },
  {
    id: "IN-26-Q1-002",
    description:
      "Deploy Serverless Mesh Architecture for global micro-service sync",
    category: "2026 Q1",
    theme: "Infra",
    priority: Priority.MEDIUM,
    quarter: "Q1",
    effort: 8,
    dependencies: [],
  },

  // === PEOPLE & CULTURE ===
  {
    id: "PE-26-Q1-001",
    description: "Deploy 4-Day Work Week Standard across Global Product Teams",
    category: "2026 Q1",
    theme: "People",
    priority: Priority.HIGH,
    quarter: "Q1",
    effort: 14,
    dependencies: [],
  },

  // === VISIONARY OBJECTIVES ===
  {
    id: "VI-26-V-001",
    description: "Achieve Level 5 Autonomous Strategic Synthesis: Vision 2027",
    category: "2026 Vision",
    theme: "AI",
    priority: Priority.HIGH,
    quarter: "Q4",
    effort: 50,
    dependencies: [],
  },
];

export const THEME_METADATA = {
  AI: { color: "atlas-blue", emoji: "🤖" },
  Cyber: { color: "rose-400", emoji: "🛡️" },
  ESG: { color: "emerald-400", emoji: "🌱" },
  Global: { color: "indigo-400", emoji: "🌍" },
  Infra: { color: "amber-400", emoji: "⚡" },
  People: { color: "pink-400", emoji: "👥" },
} as const;

export const getTaskBankStats = () => {
  const byTheme = TASK_BANK.reduce(
    (acc, task) => {
      acc[task.theme] = (acc[task.theme] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    total: TASK_BANK.length,
    byTheme,
    highPriority: TASK_BANK.filter((t) => t.priority === Priority.HIGH).length,
    q1Count: TASK_BANK.filter((t) => t.category === "2026 Q1").length,
  };
};
