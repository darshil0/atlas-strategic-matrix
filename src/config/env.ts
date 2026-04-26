/**
 * Runtime environment helper for Atlas Strategic Agent (v3.6.1)
 * - Coerces import.meta.env values to known ENV keys safely.
 * - Integrates PersistenceService for user-configurable settings.
 * - Provides validation with actionable feedback.
 */

import { PersistenceService } from "../services/core/persistence";

interface EnvShape {
  GEMINI_API_KEY: string;
  GITHUB_TOKEN?: string;
  JIRA_DOMAIN?: string;
  JIRA_EMAIL?: string;
  JIRA_API_TOKEN?: string;
  DEBUG_MODE: boolean;
  APP_VERSION: string;
  APP_NAME: string;
  TASKBANK_SIZE: string;
}

/**
 * Vite exposes typed import.meta.env via vite/client; access through the
 * declared ImportMeta interface rather than casting to `any`.
 */
type ImportMetaEnv = Record<string, string | boolean | undefined>;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const getEnvVar = (key: string): string | undefined => {
  // Vite client-side (import.meta.env.VITE_*)
  const viteEnv = (import.meta as unknown as ImportMeta).env;
  const val = viteEnv[key];
  if (val !== undefined && val !== "") {
    return String(val);
  }

  // Fallback to PersistenceService for user-configurable settings
  if (key === "VITE_GITHUB_TOKEN") {
    return PersistenceService.getGithubApiKey() ?? undefined;
  }
  if (key === "VITE_JIRA_DOMAIN") {
    return PersistenceService.getJiraDomain() ?? undefined;
  }
  if (key === "VITE_JIRA_EMAIL") {
    return PersistenceService.getJiraEmail() ?? undefined;
  }
  if (key === "VITE_JIRA_API_TOKEN") {
    return PersistenceService.getJiraApiKey() ?? undefined;
  }

  return undefined;
};

// Coerce and normalize runtime environment variables
export const ENV: EnvShape = {
  GEMINI_API_KEY: String(getEnvVar("VITE_GEMINI_API_KEY") ?? "").trim(),
  GITHUB_TOKEN: getEnvVar("VITE_GITHUB_TOKEN")?.trim(),
  JIRA_DOMAIN: getEnvVar("VITE_JIRA_DOMAIN")?.trim(),
  JIRA_EMAIL: getEnvVar("VITE_JIRA_EMAIL")?.trim(),
  JIRA_API_TOKEN: getEnvVar("VITE_JIRA_API_TOKEN")?.trim(),
  DEBUG_MODE: String(getEnvVar("VITE_DEBUG_MODE") ?? "false").toLowerCase() === "true",
  APP_VERSION: String(getEnvVar("VITE_APP_VERSION") ?? "3.6.1").trim(),
  APP_NAME: "Atlas AI Planner",
  TASKBANK_SIZE: String(getEnvVar("VITE_TASKBANK_SIZE") ?? "92"),
} as const;

/**
 * Comprehensive environment validation with actionable feedback
 */
export const validateEnv = (): boolean => {
  const issues: string[] = [];

  // Required: Gemini API
  if (!ENV.GEMINI_API_KEY) {
    issues.push("❌ VITE_GEMINI_API_KEY required for AI task generation");
  }

  // Optional warning: Integrations
  if (!ENV.GITHUB_TOKEN && !ENV.JIRA_DOMAIN) {
    console.warn(
      "⚠️  No GitHub/Jira integration configured. Use Settings modal."
    );
  }

  if (issues.length > 0) {
    console.error("\n🚨 ATLAS ENV VALIDATION FAILED:");
    console.error("═══════════════════════════════════════");
    issues.forEach((issue, i) => console.error(`${i + 1}. ${issue}`));
    console.error(
      "\n📝 Quick Fix - Create .env in project root (copy .env.example):"
    );
    console.error(`VITE_GEMINI_API_KEY=your_gemini_key_here`);
    console.error("\n⚠️  Add .env* to .gitignore - NEVER commit secrets!");
    return false;
  }

  if (ENV.DEBUG_MODE) {
    console.log("\n✅ ATLAS ENVIRONMENT READY");
    console.log("═══════════════════════════════════════");
    console.log("🎯 AI:", ENV.GEMINI_API_KEY ? "✅ Ready" : "❌ Missing");
    console.log(
      "🐙 GitHub:",
      ENV.GITHUB_TOKEN ? "✅ Configured" : "⚪ Optional"
    );
    console.log("🎫 Jira:", ENV.JIRA_DOMAIN ? "✅ Configured" : "⚪ Optional");
    console.log("🔧 Debug:", ENV.DEBUG_MODE ? "ON" : "OFF");
    console.log(`📱 v${ENV.APP_VERSION}`);
  }

  return true;
};

export const ENV_TEMPLATE = `# Atlas AI Planner - .env.example
# Copy to .env and NEVER commit! (.env* in .gitignore)

# REQUIRED: Gemini AI (powers task generation)
VITE_GEMINI_API_KEY=your_gemini_key_here

# OPTIONAL: GitHub Issues integration (Settings modal)
# VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OPTIONAL: Jira Cloud integration (Settings modal)
# VITE_JIRA_DOMAIN=yourcompany.atlassian.net
# VITE_JIRA_EMAIL=user@company.com
# VITE_JIRA_API_TOKEN=your_jira_api_token_here

# DEVELOPMENT
VITE_DEBUG_MODE=true
VITE_APP_VERSION=3.6.1
VITE_TASKBANK_SIZE=92
`;

/**
 * Initialize environment on app load
 */
export const initializeEnv = async (): Promise<boolean> => {
  const ok = validateEnv();
  const viteEnv = (import.meta as unknown as ImportMeta).env;
  if (ENV.DEBUG_MODE && viteEnv.DEV) {
    console.warn("\n🔒 ATLAS SECURITY NOTICE:");
    console.warn("• VITE_* vars visible in browser DevTools");
    console.warn(
      "• GitHub/Jira tokens stored in localStorage (Settings) by design"
    );
    console.warn("• Production: Use /api proxy endpoints for secrets");
    console.warn("• Secrets never committed (.env* → .gitignore)\n");
  }
  return ok;
};
