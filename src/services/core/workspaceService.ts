/**
 * ATLAS Multi-Workspace Data Separation Service (v3.6.4)
 * Provides discrete workspace data isolation for distinct business units across enterprise domains.
 */

import { Workspace } from "@types";
import { RbacAuditService } from "./rbacAuditService";

const STORAGE_KEYS = {
  WORKSPACES: "atlas_workspaces_v1",
  ACTIVE_WORKSPACE_ID: "atlas_active_workspace_id_v1",
};

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: "ws_global",
    name: "Global Strategic Headquarters",
    businessUnit: "Executive Office",
    description: "Enterprise-wide C-level strategic roadmap matrix",
    createdAt: Date.now() - 86400000 * 30,
    isDefault: true,
  },
  {
    id: "ws_cyber",
    name: "Enterprise Cyber & Resilience",
    businessUnit: "Information Security",
    description: "SOC 2, Zero-Trust Architecture, & Threat Defense matrix",
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: "ws_finance",
    name: "Financial Services & FinTech",
    businessUnit: "Banking Operations",
    description: "Core Banking transformation and ESG compliance roadmap",
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: "ws_infra",
    name: "Global Cloud & Edge Infra",
    businessUnit: "Infrastructure",
    description: "Sovereign cloud, 6G Edge networks, & datacenters",
    createdAt: Date.now() - 86400000 * 5,
  },
];

export class WorkspaceService {
  /**
   * List all available workspaces
   */
  static getWorkspaces(): Workspace[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
      if (raw) {
        const stored: Workspace[] = JSON.parse(raw);
        if (stored.length > 0) return stored;
      }
    } catch {
      // Fallback
    }

    // Initialize default workspaces if empty
    this.saveWorkspaces(DEFAULT_WORKSPACES);
    return DEFAULT_WORKSPACES;
  }

  /**
   * Save list of workspaces to storage
   */
  private static saveWorkspaces(workspaces: Workspace[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces));
    } catch (e) {
      console.error("Failed to persist workspaces:", e);
    }
  }

  /**
   * Get currently active workspace
   */
  static getActiveWorkspace(): Workspace {
    const workspaces = this.getWorkspaces();
    try {
      const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
      if (activeId) {
        const match = workspaces.find((w) => w.id === activeId);
        if (match) return match;
      }
    } catch {
      // Fallback
    }
    return workspaces[0];
  }

  /**
   * Switch active workspace
   */
  static setActiveWorkspace(workspaceId: string): Workspace {
    const workspaces = this.getWorkspaces();
    const target = workspaces.find((w) => w.id === workspaceId);
    if (!target) {
      throw new Error(`Workspace with ID '${workspaceId}' not found.`);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, target.id);
    } catch (e) {
      console.error("Failed to store active workspace ID:", e);
    }

    RbacAuditService.logAction(
      "WORKSPACE_SWITCH",
      `workspace:${target.id}`,
      `Switched active business unit workspace to '${target.name}'`
    );

    return target;
  }

  /**
   * Create a new discrete business unit workspace
   */
  static createWorkspace(name: string, businessUnit: string, description: string): Workspace {
    const workspaces = this.getWorkspaces();
    const id = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const newWorkspace: Workspace = {
      id,
      name,
      businessUnit,
      description,
      createdAt: Date.now(),
    };

    workspaces.push(newWorkspace);
    this.saveWorkspaces(workspaces);

    RbacAuditService.logAction(
      "WORKSPACE_SWITCH",
      `workspace:${id}`,
      `Created workspace '${name}' for business unit '${businessUnit}'`
    );

    return newWorkspace;
  }
}
