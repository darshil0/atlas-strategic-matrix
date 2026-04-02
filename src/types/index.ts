/**
 * ATLAS Core Types (v3.5.1) - Production Type System
 * Comprehensive typing for MissionControl ADK, ReactFlow, GitHub/Jira sync
 * Enterprise-grade 2026 strategic planning with glassmorphic A2UI protocol
 */

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  BLOCKED = "BLOCKED",
  WAITING = "WAITING",
}

export enum Priority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export interface Citation {
  uri: string;
  title?: string;
  excerpt?: string;
  confidence?: number;
}

export interface SubTask {
  id: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  category?: string;        // "2026 Q1", "2026 Q2", etc.
  theme?: string;          // "AI", "Cyber", "Infra", "Growth"
  result?: string;
  dependencies?: string[];
  citations?: Citation[];
  parentId?: string;
  duration?: string;       // "2w", "1d", "4h"
  output?: string;
  assignee?: string;       // GitHub username
  labels?: string[];       // ["atlas-strategic", "q1-critical"]
  quarter?: "Q1" | "Q2" | "Q3" | "Q4"; // 2026 quarters
  estimatedEffort?: number; // story points
}

export interface Plan {
  id?: string;
  name?: string;
  projectName: string;
  goal: string;
  tasks: SubTask[];
  groundingData?: string[];
  metadata?: {
    created: number;
    updated: number;
    version: string;
    q1HighPriorityCount: number;
    totalEffort: number;
  };
  validation?: {
    qualityScore: number;
    iterations: number;
    agentConsensus: boolean;
  };
}

export interface AnalystResult {
  feasibility: number;
  confidence: number;
  risks: string[];
  recommendations: string[];
}

export interface CriticIssue {
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
}

export interface CriticResult {
  score: number;
  graphValid: boolean;
  issues: CriticIssue[];
  optimizations: string[];
}

export type MessageRole = "user" | "assistant" | "system" | "agent";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  a2ui?: string;           // JSON-stringified A2UIMessage
  agentPersona?: string;   // "STRATEGIST", "ANALYST", "CRITIC"
  citations?: Citation[];
}

// === AGENT DEVELOPMENT KIT (ADK) ===
export enum AgentPersona {
  STRATEGIST = "STRATEGIST",
  ANALYST = "ANALYST",
  CRITIC = "CRITIC",
  ARCHITECT = "ARCHITECT",
}

export enum AgentMode {
  AUTONOMOUS = "AUTONOMOUS",
  COLLABORATIVE = "COLLABORATIVE",
  SUPERVISED = "SUPERVISED",
}

export interface AgentExecutionContext {
  sessionId?: string;
  metadata?: Record<string, unknown>;
  goal?: string;                    // C-level strategic objective
  activeTaskId?: string;            // DependencyGraph focus
  plan?: Plan | null;               // Current roadmap state
  previousPlan?: Plan | null;       // Iteration history
  criticFeedback?: CriticResult;    // Refinement input
  taskBank?: BankTask[];            // 90+ enterprise objectives
  [key: string]: unknown;
}

export interface AgentRuntimeContext extends AgentExecutionContext {
  sessionId: string;
  metadata: Record<string, unknown>;
}

export interface AgentResponse {
  text: string;
  a2ui?: A2UIMessage;
  validation?: {
    iterations: number;
    finalScore: number;
    graphReady: boolean;
    q1HighCount: number;
  };
}

export interface MissionResult {
  text: string;
  a2ui?: A2UIMessage;
  plan?: Plan;
  validation: {
    iterations: number;
    finalScore: number;
    graphReady: boolean;
    q1HighCount: number;
  };
}

export interface FailureCascadeResult {
  cascade: string[];
  riskScore: number;
  impactedHighPriority: number;
}

// === A2UI GLASSMORPHIC PROTOCOL ===
export enum A2UIComponentType {
  CONTAINER = "container",
  TEXT = "text",
  BUTTON = "button",
  INPUT = "input",
  CARD = "card",
  LIST = "list",
  CHART = "chart",
  PROGRESS = "progress",
  CHECKBOX = "checkbox",
  SELECT = "select",
  STAT = "stat"
}

export interface A2UIMessage {
  version: "1.1";
  elements: A2UIElement[];
  timestamp: number;
  sessionId?: string;
}

export type A2UIElement =
  | A2UIContainer
  | A2UIPanel
  | A2UICard
  | A2UIButton
  | A2UIProgress
  | A2UIStat
  | A2UIText
  | A2UIList
  | A2UIChart
  | A2UIInput
  | A2UICheckbox
  | A2UISelect;

interface A2UIElementBase {
  type: A2UIComponentType | string;
  id: string;
  className?: string;
  props?: Record<string, unknown>;
  children?: A2UIElement[];
}

export interface A2UIContainer extends A2UIElementBase {
  type: A2UIComponentType.CONTAINER;
  children: A2UIElement[];
}

export interface A2UIPanel extends A2UIElementBase {
  type: "panel";
  title: string;
  variant?: "info" | "success" | "warning" | "error";
  children: A2UIElement[];
}

export interface A2UICard extends A2UIElementBase {
  type: A2UIComponentType.CARD;
  title?: string;
  subtitle?: string;
  children?: A2UIElement[];
}

export interface A2UIButton extends A2UIElementBase {
  type: A2UIComponentType.BUTTON;
  label: string;
  actionData: unknown;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "glass";
  disabled?: boolean;
}

export interface A2UIProgress extends A2UIElementBase {
  type: A2UIComponentType.PROGRESS;
  label: string;
  value: number;
  max?: number;
}

export interface A2UIStat extends A2UIElementBase {
  type: A2UIComponentType.STAT;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "stable";
}

export interface A2UIText extends A2UIElementBase {
  type: A2UIComponentType.TEXT;
  text: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl";
}

export interface A2UIList extends A2UIElementBase {
  type: A2UIComponentType.LIST;
  items: {
    label: string;
    value?: string;
    icon?: string;
    selected?: boolean;
  }[];
}

export interface A2UIChart extends A2UIElementBase {
  type: A2UIComponentType.CHART;
  title: string;
  data: { label: string; value: number }[];
  maxValue?: number;
}

export interface A2UIInput extends A2UIElementBase {
  type: A2UIComponentType.INPUT;
  label?: string;
  placeholder?: string;
  value?: string;
  inputType?: string;
}

export interface A2UICheckbox extends A2UIElementBase {
  type: A2UIComponentType.CHECKBOX;
  label: string;
  checked: boolean;
}

export interface A2UISelect extends A2UIElementBase {
  type: A2UIComponentType.SELECT;
  label?: string;
  options: { value: string; label: string }[];
  value?: string;
}

// === ENTERPRISE INTEGRATION ===
export interface GithubIssueResult {
  success: boolean;
  issueNumber?: number;
  htmlUrl?: string;
  taskId?: string;
  error?: string;
}

export interface JiraTicketResult {
  success: boolean;
  issueKey?: string;
  issueId?: string;
  webUrl?: string;
  taskId?: string;
  error?: string;
}

export interface SyncResult {
  github: GithubSyncResult | null;
  jira: JiraSyncResult | null;
  totalCreated: number;
  timestamp: string;
}

export interface GithubSyncResult {
  created: number;
  skipped: number;
  failed: GithubIssueResult[];
  epics: Record<string, string>;
}

export interface JiraSyncResult {
  created: number;
  skipped: number;
  failed: JiraTicketResult[];
  epics: Record<string, string>;
}

// === TASKBANK SYSTEM ===
export interface BankTask {
  id: string;
  description: string;
  priority: Priority;
  category: string;
  theme: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  effort: number;        // story points
  dependencies: string[];
}

// === A2UI EVENT PROTOCOL ===
export interface AGUIEvent {
  action: AGUIAction | string;
  elementId: string;
  payload?: Record<string, unknown>;
  timestamp: number;
  data?: unknown;
}

export type AGUIAction =
  | "click"
  | "input_blur"
  | "input_submit"
  | "input_change"
  | "item_click"
  | "toggle"
  | "select_change"
  | "task_select"
  | "decompose"
  | "export_github"
  | "export_jira"
  | "sync_github"
  | "sync_jira"
  | "visualize"
  | "task_bank";

// === REACT COMPONENT PROPS ===
export interface TaskCardProps {
  task: SubTask;
  isActive: boolean;
  isBlocked: boolean;
  onClick?: () => void;
  onDecompose?: (id: string) => void;
  onExport?: (id: string, type: "github" | "jira") => void;
  exported?: { github?: string; jira?: string };
  onSimulateFailure?: (id: string) => void;
}

export interface DependencyGraphProps {
  tasks: SubTask[];
  activeTaskId?: string | null;
  onTaskSelect: (id: string) => void;
  isTaskBlocked: (task: SubTask, allTasks: SubTask[]) => boolean;
  onConnect: (source: string, target: string) => void;
  isWhatIfEnabled: boolean;
  simulationResult?: {
    cascade: string[];
    riskScore: number;
    impactedHighPriority: number;
  } | null;
  onSimulateFailure: (taskId: string) => Promise<void>;
}

// === PERSISTENCE TYPES ===
export interface PersistenceConfig {
  github: {
    apiKey: string;
    owner: string;
    repo: string;
  } | null;
  jira: {
    apiKey: string;
    domain: string;
    projectKey: string;
    email: string;
  } | null;
}

// === UTILITY TYPES ===
export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export type Theme = "AI" | "Cyber" | "Infra" | "Growth" | "Ops" | "Legal";
