/**
 * Environment Configuration - Atlas Edition
 * TypeScript-first, glassmorphic-ready environment management for your AI planning app.
 * Integrates with GitHub/Jira settings, Gemini AI, and your glassmorphic design system.
 */

import { PersistenceService } from "../services/persistenceService";

interface EnvConfig {
  /** Gemini API Key - Powers AI task generation & decomposition */
  GEMINI_API_KEY: string;
  /** GitHub integration - PAT for issue creation */
  GITHUB_TOKEN?: string;
  /** Jira integration - Domain, email, token */
  JIRA_DOMAIN?: string;
  JIRA_EMAIL?: string;
  JIRA_TOKEN?: string;
  /** Debug mode - Verbose logging + dev overlays */
  DEBUG_MODE: boolean;
  /** App metadata */
  APP_VERSION: string;
  APP_NAME: string;
  TASKBANK_SIZE: string;
}

const getEnvVar = (key: string): string | undefined => {
  // Vite client-side (import.meta.env.VITE_*)
  if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
    return import.meta.env[key] as string;
  }
  
  // Fallback to PersistenceService for GitHub/Jira (user-configurable)
  if (key === "VITE_GITHUB_TOKEN") {
    return PersistenceService.getGithubApiKey() ?? undefined;
  }
  if (key === "VITE_JIRA_DOMAIN") {
    return PersistenceService.getJiraDomain() ?? undefined;
  }
  if (key === "VITE_JIRA_EMAIL") {
    return PersistenceService.getJiraEmail() ?? undefined;
  }
  if (key === "VITE_JIRA_TOKEN") {
    return PersistenceService.getJiraApiKey() ?? undefined;
  }
  
  return undefined;
};

/**
 * Production-ready typed environment with smart fallbacks
 */
export const ENV: EnvConfig = {
  GEMINI_API_KEY: getEnvVar("VITE_GEMINI_API_KEY") ?? "",
  GITHUB_TOKEN: getEnvVar("VITE_GITHUB_TOKEN"),
  JIRA_DOMAIN: getEnvVar("VITE_JIRA_DOMAIN"),
  JIRA_EMAIL: getEnvVar("VITE_JIRA_EMAIL"),
  JIRA_TOKEN: getEnvVar("VITE_JIRA_TOKEN"),
  DEBUG_MODE: getEnvVar("VITE_DEBUG_MODE") === "true",
  APP_VERSION: getEnvVar("VITE_APP_VERSION") ?? "3.5.0",
  APP_NAME: "Atlas AI Planner",
  TASKBANK_SIZE: getEnvVar("VITE_TASKBANK_SIZE") ?? "92",
} as const;

/**
 * Comprehensive environment validation with actionable feedback
 */
export const validateEnv = (): boolean => {
  const issues: string[] = [];
  
  // Critical: AI operations
  if (!ENV.GEMINI_API_KEY.trim()) {
    issues.push("❌ VITE_GEMINI_API_KEY required for AI task generation");
  }

  // Optional but recommended: GitHub/Jira
  if (!ENV.GITHUB_TOKEN && !ENV.JIRA_DOMAIN) {
    console.warn("⚠️  No GitHub/Jira integration configured. Use Settings modal.");
  }

  if (issues.length > 0) {
    console.error("\n🚨 ATLAS ENV VALIDATION FAILED:");
    console.error("═══════════════════════════════════════");
    issues.forEach((issue, i) => console.error(`${i + 1}. ${issue}`));
    console.error("\n📝 Quick Fix - Create .env in project root:");
    console.error(`VITE_GEMINI_API_KEY=your_gemini_key_here`);
    console.error(`VITE_DEBUG_MODE=true  # for dev`);
    console.error("\n🛡️  Or use Settings → GitHub/Jira for optional integrations");
    console.error("⚠️  Add .env* to .gitignore - NEVER commit secrets!");
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

/**
 * Complete .env template for your Atlas project
 */
export const ENV_TEMPLATE = `# Atlas AI Planner - .env.example
# Copy to .env and NEVER commit! (.env* in .gitignore)

# REQUIRED: Gemini AI (powers task generation)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# OPTIONAL: GitHub Issues integration (Settings modal)
# VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OPTIONAL: Jira Cloud integration (Settings modal)
# VITE_JIRA_DOMAIN=yourcompany.atlassian.net
# VITE_JIRA_EMAIL=user@company.com  
# VITE_JIRA_TOKEN=ATATT3xAaGF...

# DEVELOPMENT
VITE_DEBUG_MODE=true
VITE_APP_VERSION=3.5.0
VITE_TASKBANK_SIZE=92

# SECURITY: VITE_* vars visible in browser DevTools
# Production: Use backend proxy for secrets
`;

/**
 * Initialize environment on app load
 */
export const initializeEnv = async (): Promise<boolean> => {
  const isValid = validateEnv();
  
  if (ENV.DEBUG_MODE && import.meta.env?.DEV) {
    console.warn("\n🔒 ATLAS SECURITY NOTICE:");
    console.warn("• VITE_* vars visible in browser DevTools");
    console.warn("• GitHub/Jira tokens stored in localStorage (Settings)");
    console.warn("• Production: Use /api proxy endpoints");
    console.warn("• Secrets never committed (.env* → .gitignore)\n");
  }
  
  return isValid;
};
