/**
 * Runtime environment helper for Atlas Strategic Agent
 * - Coerces import.meta.env values to known ENV keys safely.
 * - Provides a validateEnv() that won't call .trim() on undefined.
 */

type EnvShape = {
  GEMINI_API_KEY: string;
  GITHUB_TOKEN: string;
  JIRA_DOMAIN: string;
  JIRA_EMAIL: string;
  JIRA_API_TOKEN: string;
  DEBUG_MODE: boolean;
  APP_VERSION: string;
  TASKBANK_SIZE?: number;
};

const raw = (import.meta as any).env || {};

// Coerce and normalize runtime environment variables
export const ENV: EnvShape = {
  GEMINI_API_KEY: String(raw.VITE_GEMINI_API_KEY ?? "").trim(),
  GITHUB_TOKEN: String(raw.VITE_GITHUB_TOKEN ?? "").trim(),
  JIRA_DOMAIN: String(raw.VITE_JIRA_DOMAIN ?? "").trim(),
  JIRA_EMAIL: String(raw.VITE_JIRA_EMAIL ?? "").trim(),
  JIRA_API_TOKEN: String(raw.VITE_JIRA_API_TOKEN ?? "").trim(),
  DEBUG_MODE: String(raw.VITE_DEBUG_MODE ?? "false").toLowerCase() === "true",
  APP_VERSION: String(raw.VITE_APP_VERSION ?? "3.5.0").trim(),
  TASKBANK_SIZE: raw.VITE_TASKBANK_SIZE ? Number(raw.VITE_TASKBANK_SIZE) : undefined,
};

export const validateEnv = (): boolean => {
  const issues: string[] = [];

  // Required: Gemini API
  if (!ENV.GEMINI_API_KEY) {
    issues.push("❌ VITE_GEMINI_API_KEY required for AI task generation");
  }

  // Optional warning: Integrations
  if (!ENV.GITHUB_TOKEN && !ENV.JIRA_DOMAIN) {
    console.warn("⚠️  No GitHub/Jira integration configured. Use Settings modal.");
  }

  if (issues.length > 0) {
    console.error("\n🚨 ATLAS ENV VALIDATION FAILED:");
    console.error("═══════════════════════════════════════");
    issues.forEach((issue, i) => console.error(`${i + 1}. ${issue}`));
    console.error("\n📝 Quick Fix - Create .env in project root (copy .env.example):");
    console.error(`VITE_GEMINI_API_KEY=your_gemini_key_here`);
    console.error("\n⚠️  Add .env* to .gitignore - NEVER commit secrets!");
    return false;
  }

  if (ENV.DEBUG_MODE) {
    console.log("\n✅ ATLAS ENVIRONMENT READY");
    console.log("═══════════════════════════════════════");
    console.log("🎯 AI:", ENV.GEMINI_API_KEY ? "✅ Ready" : "❌ Missing");
    console.log("🐙 GitHub:", ENV.GITHUB_TOKEN ? "✅ Configured" : "⚪ Optional");
    console.log("🎫 Jira:", ENV.JIRA_DOMAIN ? "✅ Configured" : "⚪ Optional");
    console.log("🔧 Debug:", ENV.DEBUG_MODE ? "ON" : "OFF");
    console.log(`📱 v${ENV.APP_VERSION}`);
  }

  return true;
};

export const ENV_TEMPLATE = `# Atlas AI Planner - .env.example
# Copy to .env and NEVER commit! (.env* in .gitignore)

# REQUIRED: Gemini AI (powers task generation)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# OPTIONAL: GitHub Issues integration (Settings modal)
# VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OPTIONAL: Jira Cloud integration (Settings modal)
# VITE_JIRA_DOMAIN=yourcompany.atlassian.net
# VITE_JIRA_EMAIL=user@company.com
# VITE_JIRA_API_TOKEN=your_jira_api_token_here

# DEVELOPMENT
VITE_DEBUG_MODE=true
VITE_APP_VERSION=3.5.0
VITE_TASKBANK_SIZE=92
`;

export const initializeEnv = async (): Promise<boolean> => {
  const ok = validateEnv();
  if (ENV.DEBUG_MODE && (import.meta as any).env?.DEV) {
    console.warn("\n🔒 ATLAS SECURITY NOTICE:");
    console.warn("• VITE_* vars visible in browser DevTools");
    console.warn("• GitHub/Jira tokens stored in localStorage (Settings) by design");
    console.warn("• Production: use backend proxy endpoints for secrets\n");
  }
  return ok;
};