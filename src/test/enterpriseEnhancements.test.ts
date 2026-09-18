/**
 * ATLAS Enterprise Enhancements Test Suite (v3.6.4)
 * Validates 2026 Q2 - Q3 & 2026 Q4 - 2027 enterprise roadmap features:
 * - Role-Based Access Control (RBAC) & Immutable System Audit Logs
 * - Multi-Workspace Data Separation
 * - Monte Carlo Timeline Simulations
 * - Self-Healing Pipeline State
 * - Cross-Enterprise Vendor Network Mapping
 * - Sovereign Infrastructure Cluster Profiles
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  RbacAuditService,
  WorkspaceService,
  MonteCarloService,
  SelfHealingService,
  VendorNetworkService,
  SovereigntyService,
} from "../services";
import { Plan, SubTask, TaskStatus, Priority } from "../types";

describe("🏛️ ATLAS v3.6.4 Enterprise Enhancements Test Suite", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ==========================================
  // 1. RBAC & IMMUTABLE SYSTEM AUDIT LOGS
  // ==========================================
  describe("🔐 Role-Based Access Control (RBAC) & Immutable Audit Logs", () => {
    it("enforces permission checks correctly according to role matrix", () => {
      expect(RbacAuditService.hasPermission("ADMIN", "plan:create")).toBe(true);
      expect(RbacAuditService.hasPermission("ADMIN", "cluster:configure")).toBe(true);

      expect(RbacAuditService.hasPermission("STRATEGIST", "plan:create")).toBe(true);
      expect(RbacAuditService.hasPermission("STRATEGIST", "cluster:configure")).toBe(false);

      expect(RbacAuditService.hasPermission("AUDITOR", "audit:read")).toBe(true);
      expect(RbacAuditService.hasPermission("AUDITOR", "plan:create")).toBe(false);

      expect(RbacAuditService.hasPermission("VIEWER", "plan:create")).toBe(false);
    });

    it("records cryptographically chained audit log entries and verifies chain integrity", () => {
      RbacAuditService.setCurrentUserRole("ADMIN");

      RbacAuditService.logAction("PLAN_CREATE", "plan:p1", "Created strategic plan P1");
      RbacAuditService.logAction("ROLE_CHANGE", "user:u1", "Changed role to STRATEGIST");
      RbacAuditService.logAction("SIMULATION_RUN", "plan:p1", "Ran Monte Carlo simulation");

      const logs = RbacAuditService.getAuditLogs();
      expect(logs.length).toBeGreaterThanOrEqual(3);

      const verification = RbacAuditService.verifyLogIntegrity();
      expect(verification.isValid).toBe(true);
    });

    it("detects tampered audit log entries via hash chain verification", () => {
      RbacAuditService.logAction("PLAN_CREATE", "plan:p1", "Created plan P1");
      RbacAuditService.logAction("ROLE_CHANGE", "user:u1", "Role update");

      const logs = RbacAuditService.getAuditLogs();
      // Tamper with first log entry's detail
      logs[0].details = "TAMPERED DATA";
      localStorage.setItem("atlas_immutable_audit_logs_v1", JSON.stringify(logs));

      const verification = RbacAuditService.verifyLogIntegrity();
      expect(verification.isValid).toBe(false);
      expect(verification.brokenAtIndex).toBe(0);
    });
  });

  // ==========================================
  // 2. MULTI-WORKSPACE DATA SEPARATION
  // ==========================================
  describe("🏢 Multi-Workspace Data Separation", () => {
    it("lists default enterprise workspaces and supports active workspace switching", () => {
      const workspaces = WorkspaceService.getWorkspaces();
      expect(workspaces.length).toBeGreaterThanOrEqual(4);

      const globalWs = workspaces.find((w) => w.id === "ws_global");
      expect(globalWs).toBeDefined();

      const switched = WorkspaceService.setActiveWorkspace("ws_cyber");
      expect(switched.id).toBe("ws_cyber");
      expect(WorkspaceService.getActiveWorkspace().id).toBe("ws_cyber");
    });

    it("creates new discrete business unit workspaces", () => {
      const created = WorkspaceService.createWorkspace(
        "Supply Chain Transformation",
        "Logistics & Operations",
        "Strategic vendor network & edge node tracking"
      );

      expect(created.id).toBeDefined();
      expect(created.name).toBe("Supply Chain Transformation");

      const all = WorkspaceService.getWorkspaces();
      expect(all.some((w) => w.id === created.id)).toBe(true);
    });
  });

  // ==========================================
  // 3. MONTE CARLO TIMELINE SIMULATIONS
  // ==========================================
  describe("🎲 Monte Carlo Timeline Simulation Engine", () => {
    it("runs Monte Carlo probabilistic simulations and returns P50, P75, P90, P99 percentile distributions", () => {
      const mockPlan: Plan = {
        projectName: "Global Core Banking Upgrade",
        goal: "Transform legacy mainframe to cloud-native microservices",
        tasks: [
          {
            id: "TASK-01",
            description: "Core DB Migration",
            status: TaskStatus.IN_PROGRESS,
            priority: Priority.HIGH,
            estimatedEffort: 5, // story points -> ~12.5 days
            dependencies: [],
          },
          {
            id: "TASK-02",
            description: "API Layer Rollout",
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            estimatedEffort: 3,
            dependencies: ["TASK-01"],
          },
          {
            id: "TASK-03",
            description: "SOC 2 Audit & Launch",
            status: TaskStatus.PENDING,
            priority: Priority.MEDIUM,
            estimatedEffort: 4,
            dependencies: ["TASK-02"],
          },
        ],
      };

      const result = MonteCarloService.runSimulation(mockPlan, 1000);

      expect(result.iterations).toBe(1000);
      expect(result.p50Days).toBeGreaterThan(0);
      expect(result.p75Days).toBeGreaterThanOrEqual(result.p50Days);
      expect(result.p90Days).toBeGreaterThanOrEqual(result.p75Days);
      expect(result.p99Days).toBeGreaterThanOrEqual(result.p90Days);
      expect(result.criticalPathTasks).toContain("TASK-01");
      expect(result.riskDistribution.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // 4. SELF-HEALING PIPELINE STATE
  // ==========================================
  describe("🩹 Self-Healing Pipeline State & Automated Conflict Resolution", () => {
    it("diagnoses circular dependencies and invalid task references", () => {
      const brokenPlan: Plan = {
        projectName: "Broken Graph",
        goal: "Test cycle detection and broken references",
        tasks: [
          {
            id: "A",
            description: "Task A",
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: ["B", "INVALID_NODE"], // Circular reference A->B->A and missing node INVALID_NODE
          },
          {
            id: "B",
            description: "Task B",
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: ["A"],
          },
        ],
      };

      const diagnosis = SelfHealingService.diagnosePipeline(brokenPlan);
      expect(diagnosis.healthScore).toBeLessThan(100);
      expect(diagnosis.issues.length).toBeGreaterThan(0);

      const issueTypes = diagnosis.issues.map((i) => i.type);
      expect(issueTypes).toContain("CIRCULAR_DEPENDENCY");
      expect(issueTypes).toContain("INVALID_REFERENCE");
    });

    it("automatically heals pipeline DAG, breaks loops, prunes missing nodes, and restores health score", () => {
      const brokenPlan: Plan = {
        projectName: "Pipeline Auto Healing",
        goal: "Restore DAG health score to 100%",
        tasks: [
          {
            id: "NODE-1",
            description: "First Node",
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: ["NODE-2", "GHOST-NODE"],
          },
          {
            id: "NODE-2",
            description: "Second Node",
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: ["NODE-1"],
          },
        ],
      };

      const { healedPlan, result } = SelfHealingService.healPipeline(brokenPlan);

      expect(result.healedHealthScore).toBeGreaterThan(result.initialHealthScore);
      expect(result.resolvedIssues.length).toBeGreaterThan(0);

      // Verify ghost node was pruned
      const node1 = healedPlan.tasks.find((t) => t.id === "NODE-1");
      expect(node1?.dependencies).not.toContain("GHOST-NODE");

      // Verify circular cycle was broken
      const reDiagnosis = SelfHealingService.diagnosePipeline(healedPlan);
      expect(reDiagnosis.issues.filter((i) => i.type === "CIRCULAR_DEPENDENCY").length).toBe(0);
    });
  });

  // ==========================================
  // 5. CROSS-ENTERPRISE VENDOR NETWORK MAPPING
  // ==========================================
  describe("🌐 Cross-Enterprise Vendor Network Mapping", () => {
    it("returns enterprise vendor catalog and links vendor dependencies to tasks", () => {
      const catalog = VendorNetworkService.getVendorCatalog();
      expect(catalog.length).toBeGreaterThan(0);

      const awsVendor = catalog.find((v) => v.id === "vendor_aws");
      expect(awsVendor).toBeDefined();

      const task: SubTask = {
        id: "T-CLOUD",
        description: "Deploy GovCloud Infrastructure",
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
      };

      const linked = VendorNetworkService.linkVendorToTask(task, "vendor_aws");
      expect(linked.vendorIds).toContain("vendor_aws");
    });

    it("analyzes vendor supply chain exposure across a plan", () => {
      const plan: Plan = {
        projectName: "Vendor Risk Roadmap",
        goal: "Analyze supply chain exposure",
        tasks: [
          {
            id: "T-01",
            description: "LLM API Integration",
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            vendorIds: ["vendor_openai", "vendor_datadog"],
          },
          {
            id: "T-02",
            description: "ERP Finance Core Upgrade",
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            vendorIds: ["vendor_sap"],
          },
        ],
      };

      const analysis = VendorNetworkService.analyzeVendorRisk(plan);
      expect(analysis.totalVendorDependencies).toBe(3);
      expect(analysis.impactedTaskCount).toBe(2);
      expect(analysis.highestRiskLevel).toBe("HIGH"); // SAP is high risk
    });
  });

  // ==========================================
  // 6. SOVEREIGN CLUSTER PROFILES
  // ==========================================
  describe("🛡️ Sovereign Infrastructure Cluster Profiles", () => {
    it("lists sovereign cluster profiles and supports profile selection", () => {
      const profiles = SovereigntyService.getClusterProfiles();
      expect(profiles.length).toBeGreaterThanOrEqual(3);

      const fedramp = profiles.find((p) => p.id === "cluster_fedramp_high");
      expect(fedramp).toBeDefined();

      const selected = SovereigntyService.setActiveClusterProfile("cluster_fedramp_high");
      expect(selected.id).toBe("cluster_fedramp_high");
      expect(SovereigntyService.getActiveClusterProfile().id).toBe("cluster_fedramp_high");
    });

    it("verifies plan regulatory compliance posture under active sovereign cluster", () => {
      const plan: Plan = {
        projectName: "EU Healthcare Roadmap",
        goal: "Deploy GDPR & DORA compliant patient system",
        tasks: [
          {
            id: "T-GDPR",
            description: "Encrypt Patient Data at Rest",
            status: TaskStatus.COMPLETED,
            priority: Priority.HIGH,
            theme: "Cyber",
          },
        ],
      };

      SovereigntyService.setActiveClusterProfile("cluster_eu_sovereign");
      const verification = SovereigntyService.verifyPlanCompliance(plan);

      expect(verification.isCompliant).toBe(true);
      expect(verification.supportedFrameworks).toContain("GDPR");
      expect(verification.complianceScore).toBeGreaterThanOrEqual(80);
    });
  });
});
