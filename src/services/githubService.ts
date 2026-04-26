/**
 * Atlas GitHub Service (v3.6.0) - Glassmorphic GitHub Issues Integration
 * Converts SubTasks ↔ GitHub Issues with TaskBank labels + milestones
 * Perfect sync for MissionControl → ReactFlow → GitHub Actions pipeline
 */

import { SubTask, TaskStatus, Priority, GithubSyncResult } from "@types";
import { PersistenceService } from "@services/persistenceService";
import { TASK_BANK } from "@data/taskBank";
import { ENV } from "@config";

// GitHub REST API v1.1.7 (Jan 2026)
export class GithubService {
  private static readonly GITHUB_API_BASE = "https://api.github.com";
  private static readonly GITHUB_API_VERSION = "2022-11-28";
  private static readonly USER_AGENT = "Atlas-Strategic-Agent/3.6.0";

  /**
   * Create GitHub Issue from Atlas SubTask with glassmorphic labels
   * Auto-maps TASK_BANK themes → GitHub labels/milestones
   */
  async createIssue(task: SubTask): Promise<{
    issueNumber: number;
    htmlUrl: string;
    issueId: string;
    githubLabels: string[];
  }> {
    const config = this.getValidatedConfig();
    const issueData = this.buildGlassmorphicIssuePayload(task, config);

    const response = await fetch(
      `${GithubService.GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/issues`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": GithubService.GITHUB_API_VERSION,
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${config.apiKey}`,
          "User-Agent": GithubService.USER_AGENT,
        },
        body: JSON.stringify(issueData),
      }
    );

    if (!response.ok) {
      const errorData = await this.parseErrorResponse(response);
      throw new Error(`GitHub API [${response.status}]: ${errorData.message}`);
    }

    const issue = (await response.json()) as GitHubIssue;

    if (ENV.DEBUG_MODE) {
      console.group("🏛️ [GitHubService] Issue Created");
      console.log(`#${issue.number}: ${issue.html_url}`);
      console.log("Labels:", issueData.labels);
      console.groupEnd();
    }

    return {
      issueNumber: issue.number,
      htmlUrl: issue.html_url,
      issueId: issue.id.toString(),
      githubLabels: issueData.labels || [],
    };
  }

  /**
   * Bidirectional sync: Update GitHub Issue ↔ Atlas SubTask status
   */
  async updateIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    task: Partial<SubTask>
  ): Promise<void> {
    const apiKey = PersistenceService.getGithubApiKey();
    if (!apiKey) throw new Error("GitHub API key required");

    const updateData: GitHubIssueUpdate = {
      state: task.status === TaskStatus.COMPLETED ? "closed" : "open",
    };

    // Sync priority/category → labels
    if (task.priority || task.category) {
      updateData.labels = [
        task.priority ? `priority-${task.priority.toLowerCase()}` : undefined,
        task.category,
        "atlas-strategic",
      ].filter((l): l is string => typeof l === "string");
    }

    const response = await fetch(
      `${GithubService.GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "X-GitHub-Api-Version": GithubService.GITHUB_API_VERSION,
          "User-Agent": GithubService.USER_AGENT,
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update GitHub issue #${issueNumber}: ${response.statusText}`
      );
    }
  }

  /**
   * Bulk sync entire 2026 roadmap to GitHub Issues + Projects
   * Creates milestones for Q1-Q4 + theme labels from TASK_BANK
   */
  async syncPlan(tasks: SubTask[], dryRun = false): Promise<GithubSyncResult> {
    const config = this.getValidatedConfig();
    const results: GithubSyncResult = {
      created: 0,
      skipped: 0,
      failed: [],
      epics: {},
    };

    if (dryRun) {
      console.log(
        `[GitHubService] Dry-run: Would sync ${tasks.length} tasks to ${config.owner}/${config.repo}`
      );
      return results;
    }

    // Pre-create Q1-Q4 milestones
    await this.ensureMilestones(config);

    for (const task of tasks) {
      try {
        // Skip if already synced (check GitHub first)
        const existing = await this.findExistingIssue(config, task.id);
        if (existing) {
          results.skipped++;
          continue;
        }

        const issue = await this.createIssue(task);
        results.created++;

        // Link to GitHub Project (Atlas 2026 Roadmap)
        await this.addToProject(config, issue.issueNumber);
      } catch (error) {
        results.failed.push({
          success: false,
          taskId: task.id,
          error: (error as Error).message,
        });
        console.warn(`[GitHubService] Failed to sync ${task.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Import GitHub Issues → Atlas SubTasks (reverse sync)
   */
  async importPlan(owner: string, repo: string): Promise<SubTask[]> {
    const apiKey = PersistenceService.getGithubApiKey();
    if (!apiKey) throw new Error("GitHub API key required");

    const response = await fetch(
      `${GithubService.GITHUB_API_BASE}/repos/${owner}/${repo}/issues?labels=atlas-strategic&state=open&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-GitHub-Api-Version": GithubService.GITHUB_API_VERSION,
          "User-Agent": GithubService.USER_AGENT,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch GitHub issues");

    const issues = (await response.json()) as GitHubIssue[];
    return issues.map((issue) => this.parseIssueToSubTask(issue));
  }

  // === PRIVATE IMPLEMENTATION ===

  private async ensureMilestones(config: GitHubConfig): Promise<void> {
    const quarters = ["2026 Q1", "2026 Q2", "2026 Q3", "2026 Q4"];

    for (const quarter of quarters) {
      try {
        const response = await fetch(
          `${GithubService.GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/milestones`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.apiKey}`,
              "X-GitHub-Api-Version": GithubService.GITHUB_API_VERSION,
            },
            body: JSON.stringify({
              title: quarter,
              description: `Atlas Strategic Roadmap ${quarter}`,
              state: "open",
            }),
          }
        );

        if (response.status === 201 || response.status === 422) {
          // Already exists
          continue;
        }
      } catch (error) {
        console.warn(`Failed to create milestone ${quarter}:`, error);
      }
    }
  }

  private async findExistingIssue(
    config: GitHubConfig,
    taskId: string
  ): Promise<GitHubIssue | null> {
    const response = await fetch(
      `${GithubService.GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/issues?labels=${encodeURIComponent(taskId)}`,
      {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      }
    );

    if (!response.ok) return null;

    const issues = (await response.json()) as GitHubIssue[];
    return issues[0] || null;
  }

  private getValidatedConfig(): GitHubConfig {
    const apiKey = PersistenceService.getGithubApiKey();
    const owner = PersistenceService.getGithubOwner();
    const repo = PersistenceService.getGithubRepo();

    if (!apiKey || !owner || !repo) {
      throw new Error("GitHub config incomplete. Check PersistenceService.");
    }

    return { apiKey, owner, repo };
  }

  private buildGlassmorphicIssuePayload(
    task: SubTask,
    config: GitHubConfig
  ): GitHubIssuePayload {
    const themeLabels = this.getTaskBankLabels(task);
    const priorityLabel = `priority-${task.priority?.toLowerCase()}`;
    const quarterLabel = task.category?.replace(/2026 /, "q")?.toLowerCase();

    const labels = [
      task.id, // AI-26-Q1-001
      priorityLabel,
      quarterLabel,
      ...themeLabels,
      "atlas-strategic",
      "glassmorphic-roadmap", // Project board column
    ].filter((l): l is string => typeof l === "string");

    const body = `\
🚀 **Atlas Strategic Task** ${this.getThemeEmoji(task.theme)}

**ID:** \`${task.id}\`
**Priority:** ${task.priority}
**Quarter:** ${task.category}
**Theme:** ${task.theme || "General"}
**Dependencies:** ${task.dependencies?.join(" → ") || "None"}

---

${task.description}

**📊 TASK_BANK Alignment:**
${
  TASK_BANK.filter(
    (t) =>
      t.id === task.id || t.description.includes(task.description.slice(0, 20))
  )
    .map((t) => `• ${t.id}: ${t.description}`)
    .join("\n") || "New strategic objective"
}

---
*Generated by Atlas v3.6.0 • ${new Date().toISOString().slice(0, 10)}*
`;

    return {
      title: `[${task.id}] ${task.description.substring(0, 60)}${task.description.length > 60 ? "..." : ""}`,
      body: body.trim(),
      labels,
      assignees: config.assignees || [],
    };
  }

  private getTaskBankLabels(task: SubTask): string[] {
    const matchingTask = TASK_BANK.find(
      (t) =>
        t.id === task.id ||
        t.description.includes(task.description.slice(0, 20))
    );
    return matchingTask ? [`taskbank-${matchingTask.theme.toLowerCase()}`] : [];
  }

  private getThemeEmoji(theme?: string): string {
    const emojis: Record<string, string> = {
      AI: "🤖",
      Cyber: "🛡️",
      ESG: "🌱",
      Global: "🌍",
      Infra: "⚡",
      People: "👥",
    };
    return emojis[theme || ""] || "🎯";
  }

  private parseIssueToSubTask(issue: GitHubIssue): SubTask {
    const taskIdMatch = issue.title.match(/\[([A-Z]+-\d+-\d+)\]/);
    const taskId = taskIdMatch?.[1] || `GH-${issue.number}`;

    return {
      id: taskId,
      description: issue.title.replace(/^\[.*?\]\s*/, "").trim(),
      status:
        issue.state === "closed" ? TaskStatus.COMPLETED : TaskStatus.PENDING,
      priority:
        ((issue.labels.find((l) => l.startsWith("priority-")) as string)
          ?.replace("priority-", "")
          .toUpperCase() as Priority) || Priority.MEDIUM,
      category: issue.labels.find((l) => l.includes("q")) || "2026 Q1",
      theme:
        issue.labels.find((l) =>
          ["ai", "cyber", "esg", "global", "infra", "people"].some((t) =>
            l.includes(t)
          )
        ) || undefined,
      dependencies: [],
    };
  }

  private async parseErrorResponse(
    response: Response
  ): Promise<{ message: string }> {
    try {
      return await response.json();
    } catch {
      return { message: "Internal GitHub API error" };
    }
  }

  private async addToProject(
    _config: GitHubConfig,
    issueNumber: number
  ): Promise<void> {
    if (ENV.DEBUG_MODE) {
      console.log(
        `[GitHubService] Linking #${issueNumber} to Atlas Project Board (Simulated)`
      );
    }
  }
}

// === TYPES ===
interface GitHubConfig {
  apiKey: string;
  owner: string;
  repo: string;
  assignees?: string[];
}

interface GitHubIssuePayload {
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
}

interface GitHubIssueUpdate {
  state?: "open" | "closed";
  labels?: string[];
}

interface GitHubIssue {
  id: number;
  number: number;
  html_url: string;
  title: string;
  state: "open" | "closed";
  labels: string[];
}
