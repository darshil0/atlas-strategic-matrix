/**
 * Atlas Jira Service (v3.6.1) - Glassmorphic Jira Cloud REST API v3 Integration
 * Bidirectional sync: SubTasks ↔ Jira Issues with Q1-Q4 epics + priority mapping
 */

import {
  SubTask,
  Priority,
  TaskStatus,
  JiraTicketResult,
  JiraSyncResult,
} from "@types";
import { PersistenceService } from "@services/persistenceService";
import { TASK_BANK } from "@data/taskBank";

/**
 * Jira Cloud REST API v3 - Production enterprise integration
 */
export class JiraService {
  private static readonly API_VERSION = "3";
  private static readonly USER_AGENT = "Atlas-Strategic-Agent/3.6.1";

  /**
   * Create Jira Issue from Atlas SubTask with glassmorphic epic linking
   */
  async createTicket(task: SubTask): Promise<JiraIssueResult> {
    try {
      const config = this.getValidatedConfig();
      const issueData = this.buildGlassmorphicJiraPayload(
        task,
        config.projectKey
      );

      const response = await fetch(
        `https://${config.domain}.atlassian.net/rest/api/${JiraService.API_VERSION}/issue`,
        {
          method: "POST",
          headers: this.getHeaders(config),
          body: JSON.stringify(issueData),
        }
      );

      if (!response.ok) {
        const errorData = await this.parseJiraError(response);
        throw new Error(
          `Jira API [${response.status}]: ${errorData.errorMessages?.[0] || response.statusText}`
        );
      }

      const issue = await response.json();

      return {
        success: true,
        issueKey: issue.key,
        issueId: issue.id,
        webUrl: `https://${config.domain}.atlassian.net/browse/${issue.key}`,
        taskId: task.id,
      };
    } catch (error) {
      return {
        success: false,
        taskId: task.id,
        error: error instanceof Error ? error.message : "Unknown Jira error",
      };
    }
  }

  /**
   * Update Jira Issue with Atlas status/priority changes + transition
   */
  async updateTicket(
    issueKey: string,
    updates: Partial<SubTask>
  ): Promise<void> {
    const config = this.getValidatedConfig();

    const fieldUpdate = this.buildFieldUpdate(updates);

    const fieldResponse = await fetch(
      `https://${config.domain}.atlassian.net/rest/api/${JiraService.API_VERSION}/issue/${issueKey}`,
      {
        method: "PUT",
        headers: this.getHeaders(config),
        body: JSON.stringify({ fields: fieldUpdate }),
      }
    );

    if (!fieldResponse.ok) {
      throw new Error(`Failed to update Jira fields for ${issueKey}`);
    }

    if (updates.status) {
      await this.transitionIssue(config, issueKey, updates.status);
    }
  }

  /**
   * Bulk sync 2026 roadmap to Jira Epics + Stories
   */
  async syncPlan(tasks: SubTask[], dryRun = false): Promise<JiraSyncResult> {
    const config = this.getValidatedConfig();
    const results: JiraSyncResult = {
      created: 0,
      skipped: 0,
      failed: [] as JiraTicketResult[],
      epics: {},
    };

    if (dryRun) {
      console.log(
        `[JiraService] Dry-run: Would sync ${tasks.length} tasks to ${config.projectKey}`
      );
      return results;
    }

    await this.ensureQuarterlyEpics(config);

    for (const task of tasks) {
      try {
        const existing = await this.findExistingTicket(config, task.id);
        if (existing) {
          results.skipped++;
          continue;
        }

        const result = await this.createTicket(task);
        if (result.success) {
          results.created++;

          if (task.priority === Priority.HIGH && task.category) {
            const epicKey = await this.getEpicKey(config, task.category);
            if (epicKey) {
              await this.linkToEpic(config, result.issueKey!, epicKey);
            }
          }
        } else {
          results.failed.push(result);
        }
      } catch (error) {
        results.failed.push({
          success: false,
          taskId: task.id,
          error: (error as Error).message,
        });
      }
    }

    return results;
  }

  /**
   * Import Jira Issues → Atlas SubTasks (reverse sync)
   */
  async importPlan(): Promise<SubTask[]> {
    const config = this.getValidatedConfig();

    const response = await fetch(
      `https://${config.domain}.atlassian.net/rest/api/${JiraService.API_VERSION}/search?jql=labels=atlas-strategic`,
      {
        headers: this.getHeaders(config),
      }
    );

    if (!response.ok) throw new Error("Failed to fetch Jira issues");

    const searchResult = await response.json();
    return (searchResult.issues || []).map(
      (issue: { key: string; fields: JiraIssueFields }) =>
        this.parseJiraIssue(issue)
    );
  }

  // === PRIVATE IMPLEMENTATION ===

  private async ensureQuarterlyEpics(config: JiraConfig): Promise<void> {
    const quarters = ["2026 Q1", "2026 Q2", "2026 Q3", "2026 Q4"];

    for (const quarter of quarters) {
      try {
        const epicPayload = {
          fields: {
            project: { key: config.projectKey },
            summary: `Epic: ${quarter} Strategic Roadmap`,
            issuetype: { name: "Epic" },
            labels: [
              "atlas-strategic",
              "roadmap",
              quarter.replace(/\s+/g, "-"),
            ],
          },
        };

        await fetch(
          `https://${config.domain}.atlassian.net/rest/api/${JiraService.API_VERSION}/issue`,
          {
            method: "POST",
            headers: this.getHeaders(config),
            body: JSON.stringify(epicPayload),
          }
        );
      } catch (error) {
        console.warn(`Failed to create epic for ${quarter}:`, error);
      }
    }
  }

  private async findExistingTicket(
    config: JiraConfig,
    taskId: string
  ): Promise<string | null> {
    const response = await fetch(
      `https://${config.domain}.atlassian.net/rest/api/${JiraService.API_VERSION}/search?jql=summary~"${taskId}"`,
      { headers: this.getHeaders(config) }
    );

    if (!response.ok) return null;

    const searchResult = await response.json();
    return searchResult.issues?.[0]?.key || null;
  }

  private buildGlassmorphicJiraPayload(
    task: SubTask,
    projectKey: string
  ): unknown {
    const themeComponent = this.getTaskBankComponent(task);

    return {
      fields: {
        project: { key: projectKey },
        summary: `[${task.id}] ${task.description.substring(0, 80)}${task.description.length > 80 ? "..." : ""}`,
        issuetype: { name: task.priority === Priority.HIGH ? "Story" : "Task" },
        priority: { name: this.mapPriority(task.priority || Priority.MEDIUM) },
        labels: [
          "atlas-strategic",
          "glassmorphic-roadmap",
          task.category?.replace(/\s+/g, "-"),
          `priority-${task.priority?.toLowerCase()}`,
          ...(themeComponent ? [`theme-${themeComponent.toLowerCase()}`] : []),
        ].filter(Boolean),
        components: themeComponent ? [{ name: themeComponent }] : [],
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: task.description }],
            },
          ],
        },
      },
    };
  }

  private getTaskBankComponent(task: SubTask): string | undefined {
    const matchingTask = TASK_BANK.find((t) => t.id === task.id);
    return matchingTask?.theme;
  }

  private buildFieldUpdate(updates: Partial<SubTask>): Record<string, unknown> {
    const fields: Record<string, unknown> = {};
    if (updates.priority)
      fields.priority = { name: this.mapPriority(updates.priority) };
    if (updates.category)
      fields.labels = [updates.category.replace(/\s+/g, "-"), "atlas-updated"];
    return fields;
  }

  private async transitionIssue(
    config: JiraConfig,
    issueKey: string,
    status: TaskStatus
  ): Promise<void> {
    const transitionId = await this.findTransitionId(config, issueKey, status);
    if (transitionId) {
      await fetch(
        `https://${config.domain}.atlassian.net/rest/api/${JiraService.API_VERSION}/issue/${issueKey}/transitions`,
        {
          method: "POST",
          headers: this.getHeaders(config),
          body: JSON.stringify({ transition: { id: transitionId } }),
        }
      );
    }
  }

  private async findTransitionId(
    config: JiraConfig,
    issueKey: string,
    status: TaskStatus
  ): Promise<string | null> {
    const response = await fetch(
      `https://${config.domain}.atlassian.net/rest/api/${JiraService.API_VERSION}/issue/${issueKey}/transitions`,
      { headers: this.getHeaders(config) }
    );
    if (!response.ok) return null;
    const data = (await response.json()) as {
      transitions: { id: string; name: string }[];
    };
    const transition = data.transitions?.find((t) =>
      t.name.toLowerCase().includes(status.toLowerCase())
    );
    return transition?.id || null;
  }

  private async getEpicKey(
    config: JiraConfig,
    quarter: string
  ): Promise<string | null> {
    const response = await fetch(
      `https://${config.domain}.atlassian.net/rest/api/${JiraService.API_VERSION}/search?jql=issuetype=Epic AND summary~"${quarter}"`,
      { headers: this.getHeaders(config) }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.issues?.[0]?.key || null;
  }

  private async linkToEpic(
    config: JiraConfig,
    issueKey: string,
    epicKey: string
  ): Promise<void> {
    await fetch(
      `https://${config.domain}.atlassian.net/rest/api/${JiraService.API_VERSION}/issue/${issueKey}`,
      {
        method: "PUT",
        headers: this.getHeaders(config),
        body: JSON.stringify({ fields: { customfield_10016: epicKey } }),
      }
    );
  }

  private getHeaders(config: JiraConfig) {
    return {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${config.email}:${config.apiKey}`)}`,
      "User-Agent": JiraService.USER_AGENT,
      Accept: "application/json",
    };
  }

  private mapPriority(p: Priority): string {
    const priorityMap: Record<Priority, string> = {
      [Priority.HIGH]: "Highest",
      [Priority.MEDIUM]: "High",
      [Priority.LOW]: "Medium",
    };
    return priorityMap[p];
  }

  private getValidatedConfig(): JiraConfig {
    const config = {
      apiKey: PersistenceService.getJiraApiKey(),
      domain: PersistenceService.getJiraDomain(),
      projectKey: PersistenceService.getJiraProjectKey(),
      email: PersistenceService.getJiraEmail(),
    };
    if (
      !config.apiKey ||
      !config.domain ||
      !config.projectKey ||
      !config.email
    ) {
      throw new Error("🚨 Missing Jira configuration");
    }
    return config as JiraConfig;
  }

  private parseJiraIssue(issue: {
    fields: JiraIssueFields;
    key: string;
  }): SubTask {
    const taskIdMatch = issue.fields.summary.match(/\[([A-Z]+-\d+-\d+)\]/);
    return {
      id: taskIdMatch?.[1] || issue.key,
      description: issue.fields.summary.replace(/^\[.*?\]\s*/, "").trim(),
      status: this.mapJiraStatus(issue.fields.status?.name || "To Do"),
      priority: this.mapJiraPriority(issue.fields.priority?.name || "Medium"),
      category:
        (issue.fields.labels?.find((l: string) =>
          l.includes("2026")
        ) as string) || "2026 Q1",
      theme: issue.fields.components?.[0]?.name || undefined,
      dependencies: [],
    };
  }

  private mapJiraStatus(status: string): TaskStatus {
    if (status.includes("Done")) return TaskStatus.COMPLETED;
    if (status.includes("Progress")) return TaskStatus.IN_PROGRESS;
    return TaskStatus.PENDING;
  }

  private mapJiraPriority(priority: string): Priority {
    if (priority.includes("High")) return Priority.HIGH;
    if (priority.includes("Low")) return Priority.LOW;
    return Priority.MEDIUM;
  }

  private async parseJiraError(
    response: Response
  ): Promise<{ errorMessages?: string[] }> {
    try {
      return await response.json();
    } catch {
      return { errorMessages: ["Jira API error"] };
    }
  }
}

interface JiraIssueFields {
  summary: string;
  status?: { name: string };
  priority?: { name: string };
  labels?: string[];
  components?: { name: string }[];
}

interface JiraConfig {
  apiKey: string;
  domain: string;
  projectKey: string;
  email: string;
}

interface JiraIssueResult {
  success: boolean;
  issueKey?: string;
  issueId?: string;
  webUrl?: string;
  taskId?: string;
  error?: string;
}
