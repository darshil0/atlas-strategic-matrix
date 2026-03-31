/**
 * Atlas Gemini Service Layer (v3.4.0) - Glassmorphic Enterprise LLM
 * Production Gemini 2.0 integration for MissionControl → Agent swarm
 * JSON schema enforcement + A2UI extraction + TaskBank aware planning
 */

import { GoogleGenerativeAI, SchemaType, GenerativeModel, ResponseSchema } from "@google/generative-ai";
import { ATLAS_SYSTEM_INSTRUCTION, ENV } from "@config";
import { Plan, SubTask, TaskStatus, Priority } from "@types";
import { validateA2UIMessage, A2UIMessage, A2UI_PROTOCOL_VERSION } from "@lib/adk/protocol";
import { TASK_BANK } from "@data/taskBank";

// Production API key validation
if (!ENV.GEMINI_API_KEY) {
  throw new Error("🚨 GEMINI_API_KEY required. Set VITE_GEMINI_API_KEY=.env");
}

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

interface MissionMetrics {
  completed: number;
  total: number;
  q1Complete: number;
  q1Total: number;
  highPriorityRemaining: number;
  criticalPathRisk: number;
}

export class AtlasService {
  private static readonly modelName = "gemini-2.0-flash-exp"; // Jan 2026 production model
  private static readonly maxRetries = 3;
  private static readonly timeoutMs = 45_000; // Optimized for glassmorphic UX

  private static getModel(withA2UI = false): GenerativeModel {
    const systemInstruction = withA2UI
      ? `${ATLAS_SYSTEM_INSTRUCTION}\n\nALWAYS include A2UI glassmorphic UI responses using v${A2UI_PROTOCOL_VERSION} format.`
      : ATLAS_SYSTEM_INSTRUCTION + "\n\nGenerate structured JSON matching TaskBank schema (AI-26-Q1-001 format).";

    return genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
      generationConfig: {
        temperature: 0.05,        // Production precision
        topP: 0.75,
        topK: 32,
        maxOutputTokens: 12288,   // Extended for complex roadmaps
        responseMimeType: withA2UI ? undefined : "application/json",
      },
    });
  }

  /**
   * Generate 2026 Q1-Q4 strategic roadmap with TaskBank alignment
   * Returns ReactFlow + DependencyGraph ready Plan
   */
  static async generatePlan(userPrompt: string): Promise<Plan> {
    const model = this.getModel(false);

    const responseSchema: ResponseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        goal: { type: SchemaType.STRING },
        tasks: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },                    // AI-26-Q1-001
              description: { type: SchemaType.STRING },
              status: {
                type: SchemaType.STRING,
                format: "enum",
                enum: Object.values(TaskStatus) as string[]
              },
              priority: {
                type: SchemaType.STRING,
                format: "enum",
                enum: Object.values(Priority) as string[]
              },
              category: {
                type: SchemaType.STRING,
                format: "enum",
                enum: ["2026 Q1", "2026 Q2", "2026 Q3", "2026 Q4", "2026 Vision"]
              },
              theme: {
                type: SchemaType.STRING,
                format: "enum",
                enum: ["AI", "Cyber", "ESG", "Global", "Infra", "People"]
              },
              dependencies: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
            },
            required: ["id", "description", "status", "priority", "category"],
          },
        },
      },
      required: ["goal", "tasks"],
    };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{
            role: "user",
            parts: [{
              text: `Generate 2026 enterprise roadmap for: "${userPrompt}"

TASK_BANK CONTEXT (90+ objectives):
${TASK_BANK.slice(0, 10).map(t => `${t.id}: ${t.description.slice(0, 60)}...`).join("\n")}

REQUIREMENTS:
• Use realistic Q1-Q4 categories (2026 Q1 has capacity for 12 HIGH priority)
• Match TASK_BANK ID patterns: AI-26-Q1-001, CY-26-Q2-002
• Create realistic cross-theme dependencies
• Balance Q1 workload (max 12 HIGH priority)

Return structured JSON matching schema exactly.`
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        const response = await Promise.race([
          result.response,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Generation timeout")), this.timeoutMs)
          )
        ]);

        const plan = this.parseResponse<Plan>(response.text());

        // Production quality gates
        if (this.validatePlanQuality(plan, userPrompt)) {
          if (ENV.DEBUG_MODE) {
            console.group("🏛️ [AtlasService] PLAN GENERATED");
            console.log("Q1 HIGH:", plan.tasks.filter(t => t.priority === Priority.HIGH && t.category === "2026 Q1").length);
            console.log("Total Tasks:", plan.tasks.length);
            console.log("Dependencies:", plan.tasks.filter(t => t.dependencies?.length).length);
            console.groupEnd();
          }
          return plan;
        }
      } catch (error) {
        console.warn(`[AtlasService] Attempt ${attempt}/${this.maxRetries} failed:`, error);
        if (attempt === this.maxRetries) throw error;
      }
    }

    throw new Error("Failed to generate production-quality 2026 roadmap");
  }

  /**
   * Execute SubTask with streaming + glassmorphic A2UI extraction
   * Powers MissionControl real-time feedback
   */
  static async executeSubtask(
    subtask: SubTask,
    plan: Plan,
    history = "",
    onChunk?: (chunk: string) => void
  ): Promise<{ text: string; a2ui?: A2UIMessage }> {
    const model = this.getModel(true);

    const context = this.buildSubtaskContext(subtask, plan, history);

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: context }] }],
      generationConfig: {
        maxOutputTokens: 4096,
      },
    });

    let fullText = "";
    const a2uiCandidates: string[] = [];

    // Real-time streaming with A2UI extraction
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullText += text;

      // Extract embedded A2UI glassmorphic payloads
      const a2uiMatch = text.match(/<a2ui>[\s\S]*?<\/a2ui>/gi);
      if (a2uiMatch) a2uiCandidates.push(...a2uiMatch);

      onChunk?.(text);
    }

    const a2ui = this.extractA2UI(a2uiCandidates);

    return {
      text: fullText.replace(/<a2ui>[\s\S]*?<\/a2ui>/gi, "").trim(),
      a2ui,
    };
  }

  /**
   * MissionControl completion summary with Q1-Q4 metrics
   */
  static async summarizeMission(plan: Plan, executionHistory: string): Promise<string> {
    const model = this.getModel(false);

    const metrics = this.computeMissionMetrics(plan);

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `Generate executive mission summary:

GOAL: ${plan.goal}
${this.formatMetrics(metrics)}
EXECUTION HISTORY: ${executionHistory.slice(-1500)}

Format as concise executive briefing with:
• Q1-Q4 completion status
• Critical path risks
• Next action recommendations`
        }]
      }]
    });

    return (await result.response).text();
  }

  // === PRIVATE IMPLEMENTATION ===

  private static validatePlanQuality(plan: Plan, goal: string): boolean {
    return (
      plan.tasks.length >= 8 &&           // Minimum roadmap size
      plan.tasks.length <= 30 &&           // Reasonable scope
      plan.goal.trim().toLowerCase().includes(goal.toLowerCase().slice(0, 20)) && // Goal alignment
      plan.tasks.some(t => t.category === "2026 Q1") && // Q1 coverage
      plan.tasks.filter(t => t.priority === Priority.HIGH).length >= 3 // Critical tasks
    );
  }

  private static buildSubtaskContext(subtask: SubTask, plan: Plan, history: string): string {
    const q1HighRemaining = plan.tasks.filter(
      t => t.priority === Priority.HIGH && t.category === "2026 Q1" && t.status !== TaskStatus.COMPLETED
    ).length;

    return `Execute subtask within 2026 roadmap context:

GOAL: ${plan.goal}
TASK: ${subtask.id} "${subtask.description}"
Q1 CAPACITY: ${q1HighRemaining}/12 HIGH priority remaining
DEPENDENCIES: ${subtask.dependencies?.join(", ") || "None"}
PLAN PROGRESS: ${plan.tasks.filter(t => t.status === TaskStatus.COMPLETED).length}/${plan.tasks.length}

RECENT HISTORY: ${history.slice(-800)}

Provide step-by-step execution guidance. Include glassmorphic A2UI when UI feedback needed.`;
  }

  private static computeMissionMetrics(plan: Plan): MissionMetrics {
    return {
      completed: plan.tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      total: plan.tasks.length,
      q1Complete: plan.tasks.filter(t => t.category === "2026 Q1" && t.status === TaskStatus.COMPLETED).length,
      q1Total: plan.tasks.filter(t => t.category === "2026 Q1").length,
      highPriorityRemaining: plan.tasks.filter(
        t => t.priority === Priority.HIGH && t.status !== TaskStatus.COMPLETED
      ).length,
      criticalPathRisk: plan.tasks.filter(t => t.dependencies?.length && t.status === TaskStatus.PENDING).length,
    };
  }

  private static parseResponse<T>(text: string): T {
    const cleanText = text
      .replace(/```(?:json)?\n?|\n?```/g, "")
      .trim();

    try {
      return JSON.parse(cleanText) as T;
    } catch {
      console.error("[AtlasService] JSON parse failed:", cleanText.slice(0, 200));
      throw new Error("Failed to parse structured Gemini response");
    }
  }

  private static extractA2UI(candidates: string[]): A2UIMessage | undefined {
    for (const candidate of candidates) {
      try {
        const payload = candidate.slice(6, -8).trim(); // Remove <a2ui> tags
        const parsed = JSON.parse(payload);
        const validated = validateA2UIMessage(parsed);
        if (validated) return validated;
      } catch {
        continue;
      }
    }
    return undefined;
  }

  private static formatMetrics(metrics: MissionMetrics): string {
    return `
Q1: ${metrics.q1Complete}/${metrics.q1Total} (${Math.round(metrics.q1Complete / (metrics.q1Total || 1) * 100) || 0}%)
Total: ${metrics.completed}/${metrics.total}
HIGH Priority Remaining: ${metrics.highPriorityRemaining}
Critical Path Risk: ${metrics.criticalPathRisk}`;
  }
}
