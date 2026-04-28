/**
 * Centralized system constants for Atlas Strategic Agent (v3.6.1)
 */

export const SYSTEM_CONSTANTS = {
  // AI Metrics & Thresholds
  CRITIC_ACCEPTANCE_SCORE: 85,
  Q1_TASK_CAPACITY: 12,
  PLAN_MIN_TASKS: 8,
  PLAN_MAX_TASKS: 30,

  // Timeouts & Retries
  GEMINI_TIMEOUT_MS: 45_000,
  DEFAULT_RETRY_COUNT: 3,
  INITIAL_BACKOFF_MS: 1000,

  // TaskBank Configuration
  TASKBANK_SIZE: 92,

  // Integrations
  MAX_CONCURRENT_API_CALLS: 3,
  GITHUB_API_VERSION: "2022-11-28",
  JIRA_API_VERSION: "3",

  // UI
  MESSAGE_HISTORY_LIMIT: 200,
  BOOT_LOADER_DELAY_MS: 2600,
} as const;
