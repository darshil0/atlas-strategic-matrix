// src/components/SettingsModal.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PersistenceService } from "@services/persistenceService";
import { Settings, X } from "lucide-react";
import { cn } from "@lib/utils";

interface SettingsModalProps {
  onClose: () => void;
  isOpen: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, isOpen }) => {
  // Use refs for input elements to avoid re-renders on every keystroke
  const githubTokenInputRef = useRef<HTMLInputElement>(null);
  const jiraDomainInputRef = useRef<HTMLInputElement>(null);
  const jiraEmailInputRef = useRef<HTMLInputElement>(null);
  const jiraTokenInputRef = useRef<HTMLInputElement>(null);
  const [debugMode, setDebugMode] = useState(PersistenceService.getDebugMode());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Trap focus within modal for accessibility
  useEffect(() => {
    if (!isOpen) return;

    const modalEl = modalRef.current;
    if (!modalEl) return;

    const focusableElements = modalEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    firstElement?.focus();
    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    const githubToken = githubTokenInputRef.current?.value || "";
    const jiraDomain = jiraDomainInputRef.current?.value || "";
    const jiraEmail = jiraEmailInputRef.current?.value || "";
    const jiraToken = jiraTokenInputRef.current?.value || "";

    // Required GitHub fields
    if (!githubToken.trim()) newErrors.githubToken = "GitHub token required";
    
    // Required Jira fields (if any Jira field is filled, all are required)
    const hasJiraConfig = jiraDomain.trim() || jiraEmail.trim() || jiraToken.trim();
    if (hasJiraConfig) {
      if (!jiraDomain.trim()) newErrors.jiraDomain = "Jira domain required";
      if (!jiraEmail.trim()) newErrors.jiraEmail = "Email required";
      if (!jiraToken.trim()) newErrors.jiraToken = "Jira token required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Save all settings
      PersistenceService.saveGithubApiKey(githubTokenInputRef.current?.value || "");
      PersistenceService.saveJiraDomain(jiraDomainInputRef.current?.value || "");
      PersistenceService.saveJiraEmail(jiraEmailInputRef.current?.value || "");
      PersistenceService.saveJiraApiKey(jiraTokenInputRef.current?.value || "");
      PersistenceService.saveDebugMode(debugMode);
      
      // Show success feedback
      onClose();
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 glass-2 backdrop-blur-3xl"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <motion.div 
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-1 border border-white/10 p-8 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-atlas-blue/20 rounded-2xl border border-atlas-blue/30">
              <Settings className="h-6 w-6 text-atlas-blue" />
            </div>
            <div>
              <h2 
                id="settings-modal-title"
                className="text-2xl font-display font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent"
              >
                Integration Settings
              </h2>
              <p className="text-sm text-slate-400">Configure GitHub and Jira sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-2xl transition-all backdrop-blur-sm hover:scale-105"
            aria-label="Close settings"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Security Warning */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-2 border border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-amber-500/5 text-yellow-200 px-5 py-4 rounded-2xl mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Security Notice</h4>
              <p className="text-xs leading-relaxed">Keys stored locally with Base64 obfuscation. Use backend proxy for production.</p>
            </div>
          </div>
        </motion.div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* GitHub Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
              GitHub
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <InputField
                ref={githubTokenInputRef}
                label="Personal Access Token"
                placeholder="ghp_..."
                defaultValue={PersistenceService.getGithubApiKey() || ""}
                error={errors.githubToken}
                required
              />
            </div>
          </motion.div>

          {/* Jira Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" />
              Jira Cloud
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                ref={jiraDomainInputRef}
                label="Domain"
                placeholder="yourcompany.atlassian.net"
                defaultValue={PersistenceService.getJiraDomain() || ""}
                error={errors.jiraDomain}
                type="url"
              />
              <InputField
                ref={jiraEmailInputRef}
                label="Email"
                placeholder="user@company.com"
                defaultValue={PersistenceService.getJiraEmail() || ""}
                error={errors.jiraEmail}
                type="email"
              />
              <InputField
                ref={jiraTokenInputRef}
                label="API Token"
                placeholder="ATATT3x..."
                defaultValue={PersistenceService.getJiraApiKey() || ""}
                error={errors.jiraToken}
                type="password"
              />
            </div>
          </motion.div>

          {/* Debug Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="flex items-center gap-3 p-4 glass-2 rounded-2xl border border-white/10 cursor-pointer group">
              <input
                type="checkbox"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                className="w-5 h-5 rounded-lg bg-slate-800 border-slate-700 text-atlas-blue focus:ring-atlas-blue/50 transition-all duration-200"
              />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                Enable Debug Mode
              </span>
              <span className="ml-auto text-xs text-slate-500 font-mono bg-slate-900/50 px-2 py-1 rounded-lg">
                {debugMode ? "ON" : "OFF"}
              </span>
            </label>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex justify-end gap-3 pt-6 border-t border-white/10"
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 glass-2 border border-white/20 text-slate-300 hover:border-white/40 hover:bg-white/10 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || Object.keys(errors).length > 0}
            className={cn(
              "px-6 py-3 bg-gradient-to-r from-atlas-blue to-atlas-indigo text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl active:shadow-lg border border-atlas-blue/50 transition-all duration-200 flex items-center gap-2",
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Reusable InputField component
const InputField = React.forwardRef<
  HTMLInputElement,
  {
    label: string;
    placeholder?: string;
    defaultValue?: string;
    error?: string;
    required?: boolean;
    type?: string;
  }
>(({ label, placeholder, defaultValue, error, required, type = "text" }, ref) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-300 mb-2">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue || ""}
      className={cn(
        "w-full glass-2 border rounded-2xl px-4 py-3 text-sm text-white backdrop-blur-3xl transition-all duration-200 focus:outline-none focus:ring-2",
        error 
          ? "border-rose-500/50 ring-rose-500/30 bg-rose-500/5" 
          : "border-white/20 hover:border-white/40 focus:ring-atlas-blue/50 focus:border-atlas-blue/50"
      )}
    />
    {error && (
      <p className="text-xs text-rose-400 font-mono mt-1 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
        {error}
      </p>
    )}
  </div>
));

InputField.displayName = "InputField";

export default SettingsModal;
