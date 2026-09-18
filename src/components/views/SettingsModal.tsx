// src/components/views/SettingsModal.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PersistenceService } from "@services/core/persistence";
import {
  RbacAuditService,
  WorkspaceService,
  SovereigntyService,
} from "@services";
import { UserRole } from "@types";
import {
  Settings,
  X,
  Shield,
  Layers,
  Globe,
  Lock,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { cn } from "@lib/utils";

interface SettingsModalProps {
  onClose: () => void;
  isOpen: boolean;
}

type SettingsTab = "integrations" | "rbac_audit" | "workspaces" | "sovereign";

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, isOpen }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("integrations");

  // Inputs
  const githubTokenInputRef = useRef<HTMLInputElement>(null);
  const jiraDomainInputRef = useRef<HTMLInputElement>(null);
  const jiraEmailInputRef = useRef<HTMLInputElement>(null);
  const jiraTokenInputRef = useRef<HTMLInputElement>(null);
  const [debugMode, setDebugMode] = useState(PersistenceService.getDebugMode());

  // RBAC State
  const [currentUser, setCurrentUser] = useState(RbacAuditService.getCurrentUser());
  const [auditLogs, setAuditLogs] = useState(RbacAuditService.getAuditLogs());
  const [integrityStatus, setIntegrityStatus] = useState(RbacAuditService.verifyLogIntegrity());

  // Workspace State
  const [workspaces, setWorkspaces] = useState(WorkspaceService.getWorkspaces());
  const [activeWorkspace, setActiveWorkspace] = useState(WorkspaceService.getActiveWorkspace());
  const [newWsName, setNewWsName] = useState("");
  const [newWsUnit, setNewWsUnit] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");
  const [showCreateWs, setShowCreateWs] = useState(false);

  // Sovereign Cluster Profile State
  const [profiles] = useState(SovereigntyService.getClusterProfiles());
  const [activeProfile, setActiveProfile] = useState(SovereigntyService.getActiveClusterProfile());

  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const modalEl = modalRef.current;
    if (!modalEl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleRoleChange = (role: UserRole) => {
    const updated = RbacAuditService.setCurrentUserRole(role);
    setCurrentUser(updated);
    setAuditLogs(RbacAuditService.getAuditLogs());
    setIntegrityStatus(RbacAuditService.verifyLogIntegrity());
  };

  const handleWorkspaceSwitch = (wsId: string) => {
    const switched = WorkspaceService.setActiveWorkspace(wsId);
    setActiveWorkspace(switched);
    setAuditLogs(RbacAuditService.getAuditLogs());
  };

  const handleCreateWorkspace = () => {
    if (!newWsName.trim() || !newWsUnit.trim()) return;
    const created = WorkspaceService.createWorkspace(newWsName, newWsUnit, newWsDesc);
    setWorkspaces(WorkspaceService.getWorkspaces());
    setActiveWorkspace(created);
    setNewWsName("");
    setNewWsUnit("");
    setNewWsDesc("");
    setShowCreateWs(false);
    setAuditLogs(RbacAuditService.getAuditLogs());
  };

  const handleSelectSovereignProfile = (profileId: string) => {
    const selected = SovereigntyService.setActiveClusterProfile(profileId);
    setActiveProfile(selected);
    setAuditLogs(RbacAuditService.getAuditLogs());
  };

  const handleSaveIntegrations = useCallback(async () => {
    setIsLoading(true);
    try {
      PersistenceService.saveGithubApiKey(githubTokenInputRef.current?.value || "");
      PersistenceService.saveJiraDomain(jiraDomainInputRef.current?.value || "");
      PersistenceService.saveJiraEmail(jiraEmailInputRef.current?.value || "");
      PersistenceService.saveJiraApiKey(jiraTokenInputRef.current?.value || "");
      PersistenceService.saveDebugMode(debugMode);
      onClose();
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [onClose, debugMode]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 glass-2 backdrop-blur-3xl"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-1 border border-white/10 p-8 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-atlas-blue/20 rounded-2xl border border-atlas-blue/30 shadow-lg shadow-atlas-blue/20">
              <Settings className="h-6 w-6 text-atlas-blue animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Enterprise Settings & Governance
              </h2>
              <p className="text-xs font-mono text-slate-400">
                RBAC • Multi-Workspace • Audit Logs • Sovereign Clusters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-2xl transition-all backdrop-blur-sm"
          >
            <X className="h-5 w-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 glass-2 rounded-2xl border border-white/10 my-6">
          {[
            { id: "integrations", label: "Integrations", icon: Settings },
            { id: "rbac_audit", label: "RBAC & Audit", icon: Shield },
            { id: "workspaces", label: "Workspaces", icon: Layers },
            { id: "sovereign", label: "Sovereign Clusters", icon: Globe },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all",
                activeTab === tab.id
                  ? "glass-2 text-atlas-blue shadow-lg ring-1 ring-atlas-blue/30"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
          {/* TAB 1: INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <div className="glass-2 border border-yellow-500/20 bg-yellow-500/5 text-yellow-200 p-4 rounded-2xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold">Encrypted Credentials:</span> OAuth and personal access tokens are stored in local client state with obfuscation.
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  GitHub Integration
                </h3>
                <InputField
                  ref={githubTokenInputRef}
                  label="Personal Access Token"
                  placeholder="ghp_..."
                  defaultValue={PersistenceService.getGithubApiKey() || ""}
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Jira Cloud Integration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    ref={jiraDomainInputRef}
                    label="Domain"
                    placeholder="company.atlassian.net"
                    defaultValue={PersistenceService.getJiraDomain() || ""}
                  />
                  <InputField
                    ref={jiraEmailInputRef}
                    label="Account Email"
                    placeholder="user@company.com"
                    defaultValue={PersistenceService.getJiraEmail() || ""}
                  />
                </div>
                <InputField
                  ref={jiraTokenInputRef}
                  label="API Token"
                  placeholder="ATATT3x..."
                  type="password"
                  defaultValue={PersistenceService.getJiraApiKey() || ""}
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <label className="flex items-center gap-3 p-4 glass-2 rounded-2xl border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={debugMode}
                    onChange={(e) => setDebugMode(e.target.checked)}
                    className="w-4 h-4 rounded text-atlas-blue focus:ring-0"
                  />
                  <span className="text-sm font-medium text-slate-300">
                    Enable Developer Debug Mode
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: RBAC & SYSTEM AUDIT LOGS */}
          {activeTab === "rbac_audit" && (
            <div className="space-y-6">
              {/* Role Selector */}
              <div className="glass-2 p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Role-Based Access Control (RBAC)</h3>
                    <p className="text-xs text-slate-400">Current User: {currentUser.name} ({currentUser.email})</p>
                  </div>
                  <span className="px-3 py-1 bg-atlas-blue/20 text-atlas-blue border border-atlas-blue/30 rounded-xl text-xs font-mono font-bold uppercase">
                    Role: {currentUser.role}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-2">
                  {(["ADMIN", "STRATEGIST", "ANALYST", "AUDITOR", "VIEWER"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all border",
                        currentUser.role === r
                          ? "bg-atlas-blue/20 text-white border-atlas-blue"
                          : "glass-1 border-white/5 text-slate-400 hover:text-white"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audit Trail Viewer */}
              <div className="glass-2 p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-atlas-blue" />
                    <h3 className="text-sm font-bold text-white">Immutable System Audit Log Chain</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    {integrityStatus.isValid ? (
                      <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle className="w-3.5 h-3.5" /> Chain Intact
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                        <AlertCircle className="w-3.5 h-3.5" /> Hash Mismatch
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-hide">
                  {auditLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 font-mono py-4 text-center">No system audit records logged yet.</p>
                  ) : (
                    auditLogs.slice().reverse().map((log) => (
                      <div key={log.id} className="p-3 glass-1 rounded-xl border border-white/5 text-xs font-mono space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span className="text-atlas-blue font-bold">[{log.action}]</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-200">{log.details}</p>
                        <div className="text-[10px] text-slate-500 truncate font-mono">
                          Hash: {log.hash}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKSPACES */}
          {activeTab === "workspaces" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white">Discrete Business Unit Workspaces</h3>
                  <p className="text-xs text-slate-400">Switch workspace context to isolate roadmaps by division.</p>
                </div>
                <button
                  onClick={() => setShowCreateWs(!showCreateWs)}
                  className="px-3 py-1.5 glass-2 rounded-xl border border-white/20 text-xs font-mono text-atlas-blue flex items-center gap-1 hover:bg-white/10"
                >
                  <Plus className="w-3.5 h-3.5" /> New Workspace
                </button>
              </div>

              {showCreateWs && (
                <div className="glass-2 p-4 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200">Create Discrete Business Workspace</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Workspace Name"
                      value={newWsName}
                      onChange={(e) => setNewWsName(e.target.value)}
                      className="glass-1 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    />
                    <input
                      placeholder="Business Unit (e.g., Security)"
                      value={newWsUnit}
                      onChange={(e) => setNewWsUnit(e.target.value)}
                      className="glass-1 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <input
                    placeholder="Description"
                    value={newWsDesc}
                    onChange={(e) => setNewWsDesc(e.target.value)}
                    className="w-full glass-1 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowCreateWs(false)}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateWorkspace}
                      className="px-4 py-1.5 bg-atlas-blue text-white rounded-xl text-xs font-semibold"
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    onClick={() => handleWorkspaceSwitch(ws.id)}
                    className={cn(
                      "p-4 glass-2 rounded-2xl border transition-all cursor-pointer space-y-2",
                      activeWorkspace.id === ws.id
                        ? "border-atlas-blue bg-atlas-blue/10 shadow-lg"
                        : "border-white/5 hover:border-white/20"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-white">{ws.name}</h4>
                      {activeWorkspace.id === ws.id && (
                        <span className="w-2 h-2 rounded-full bg-atlas-blue animate-ping" />
                      )}
                    </div>
                    <span className="inline-block px-2 py-0.5 glass-1 rounded-lg text-[10px] font-mono text-slate-400 uppercase">
                      {ws.businessUnit}
                    </span>
                    <p className="text-xs text-slate-400 line-clamp-2">{ws.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SOVEREIGN CLUSTER PROFILES */}
          {activeTab === "sovereign" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Sovereign Infrastructure Cluster Profiles</h3>
                <p className="text-xs text-slate-400">Strict compliance profiles for regulated deployments (GDPR, FedRAMP High, DORA).</p>
              </div>

              <div className="space-y-3">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectSovereignProfile(p.id)}
                    className={cn(
                      "p-5 glass-2 rounded-2xl border transition-all cursor-pointer space-y-3",
                      activeProfile.id === p.id
                        ? "border-purple-500 bg-purple-500/10 shadow-xl"
                        : "border-white/5 hover:border-white/20"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <h4 className="font-bold text-sm text-white">{p.name}</h4>
                      </div>
                      <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-[10px] font-mono font-bold">
                        {p.isolationLevel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                      <div><span className="text-slate-500">Region:</span> {p.region}</div>
                      <div><span className="text-slate-500">Provider:</span> {p.provider}</div>
                      <div><span className="text-slate-500">Residency:</span> {p.dataResidencyRegion}</div>
                      <div><span className="text-slate-500">Encryption:</span> {p.encryptionStandard}</div>
                    </div>

                    <div className="flex gap-2 flex-wrap pt-1">
                      {p.complianceFrameworks.map((framework) => (
                        <span key={framework} className="px-2 py-0.5 glass-1 rounded-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                          ✓ {framework}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/10 flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 glass-2 border border-white/20 text-slate-300 hover:text-white rounded-2xl text-xs font-mono font-bold uppercase transition-all"
          >
            Close
          </button>
          {activeTab === "integrations" && (
            <button
              onClick={handleSaveIntegrations}
              disabled={isLoading}
              className="px-6 py-2.5 bg-atlas-blue text-white rounded-2xl text-xs font-mono font-bold uppercase shadow-lg hover:shadow-atlas-blue/30 transition-all"
            >
              {isLoading ? "Saving..." : "Save Configuration"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const InputField = React.forwardRef<
  HTMLInputElement,
  {
    label: string;
    placeholder?: string;
    defaultValue?: string;
    type?: string;
  }
>(({ label, placeholder, defaultValue, type = "text" }, ref) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-mono font-medium text-slate-300">
      {label}
    </label>
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue || ""}
      className="w-full glass-2 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-atlas-blue/50"
    />
  </div>
));

InputField.displayName = "InputField";

export default SettingsModal;
