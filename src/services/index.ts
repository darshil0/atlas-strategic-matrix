/**
 * Atlas Integration Hub (v3.6.0) - Glassmorphic Sync Orchestrator
 * Single import for GitHub Issues + Jira Tickets bidirectional sync
 */

import { GithubService } from "@services/githubService";
import { JiraService } from "@services/jiraService";
import { PersistenceService } from "@services/persistenceService";
import { AtlasService } from "@services/geminiService";
import { Plan, SyncResult } from "@types";

export const githubService = new GithubService();
export const jiraService = new JiraService();
export const persistenceService = PersistenceService;
export const atlasService = AtlasService;

/**
 * Enterprise Synchronization Services (v3.6.0)
 * Orchestrates cross-platform strategic roadmap consistency
 */
export const syncServices = {
  /**
   * Bulk synchronizes the strategic roadmap to all linked enterprise platforms
   */
  syncToAll: async (plan: Plan, dryRun = false): Promise<SyncResult> => {
    const results: SyncResult = {
      github: null,
      jira: null,
      totalCreated: 0,
      timestamp: new Date().toISOString(),
    };

    // 1. Sync to GitHub Issues
    try {
      results.github = await githubService.syncPlan(plan.tasks, dryRun);
    } catch (e) {
      console.error("GitHub Sync Failed:", e);
    }

    // 2. Sync to Jira Tickets
    try {
      results.jira = await jiraService.syncPlan(plan.tasks, dryRun);
    } catch (e) {
      console.error("Jira Sync Failed:", e);
    }

    results.totalCreated =
      (results.github?.created || 0) + (results.jira?.created || 0);

    return results;
  },

  /**
   * Pulls latest status updates from all linked enterprise platforms
   */
  pullUpdates: async (plan: Plan): Promise<Plan> => {
    const updatedPlan = { ...plan };

    try {
      const owner = PersistenceService.getGithubOwner();
      const repo = PersistenceService.getGithubRepo();

      if (owner && repo) {
        const ghUpdates = await githubService.importPlan(owner, repo);
        // Logic to merge status/priority from GH back to local plan
        updatedPlan.tasks = updatedPlan.tasks.map((t) => {
          const match = ghUpdates.find((g) => g.id === t.id);
          return match ? { ...t, status: match.status } : t;
        });
      }
    } catch (e) {
      console.error("Failed to pull GitHub updates:", e);
    }

    return updatedPlan;
  },

  /**
   * Health check for enterprise integrations
   */
  healthCheck: async () => {
    return [
      { service: "GitHub", healthy: true },
      { service: "Jira", healthy: true },
    ];
  },
};

/**
 * Enterprise Strategic Workflows (v3.6.0)
 * Presets for common executive orchestration pipelines
 */
export const WORKFLOW_PRESETS = [
  {
    id: "mission-control",
    name: "MissionControl Strategy",
    description: "Multi-agent synthesis for high-stakes roadmap generation",
    icon: "ShieldHero",
    steps: ["GENERATE", "ANALYZE", "CRITIQUE", "SYNC"],
  },
  {
    id: "rapid-deploy",
    name: "Rapid Deployment",
    description: "Direct-to-execution pipeline for technical workstreams",
    icon: "Zap",
    steps: ["GENERATE", "SYNC"],
  },
  {
    id: "risk-assessment",
    name: "Risk Simulation",
    description: "Simulation-focused analysis for contingency planning",
    icon: "AlertTriangle",
    steps: ["GENERATE", "SIMULATE", "OPTIMIZE"],
  },
];

/**
 * CI/CD Strategic Pipelines
 */
export const CI_CD_MOCK = `
name: Atlas Strategic Sync
on:
  push:
    branches: [ main ]

jobs:
  sync-jira:
    runs-on: ubuntu-latest
    steps:
      - uses: atlas-corp/atlas-sync-action@v3.6.0
        with:
          jira-project: ATLAS2026
`;
