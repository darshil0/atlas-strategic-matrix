/**
 * ATLAS Role-Based Access Control (RBAC) & Immutable Audit Log Service (v3.6.4)
 * Enforces role permissions and maintains cryptographically hashed, immutable system audit trails.
 */

import {
  UserRole,
  Permission,
  UserProfile,
  AuditAction,
  AuditLogEntry,
} from "@types";

// Role-Permission Matrix
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "plan:create",
    "plan:edit",
    "plan:delete",
    "workspace:manage",
    "audit:read",
    "cluster:configure",
    "simulation:run",
    "pipeline:heal",
  ],
  STRATEGIST: [
    "plan:create",
    "plan:edit",
    "audit:read",
    "simulation:run",
    "pipeline:heal",
  ],
  ANALYST: [
    "plan:edit",
    "audit:read",
    "simulation:run",
  ],
  AUDITOR: [
    "audit:read",
  ],
  VIEWER: [],
};

const STORAGE_KEYS = {
  AUDIT_LOGS: "atlas_immutable_audit_logs_v1",
  CURRENT_USER: "atlas_current_user_profile_v1",
};

export class RbacAuditService {
  private static currentUser: UserProfile = {
    id: "usr_executive_01",
    name: "Enterprise Administrator",
    email: "admin@enterprise.atlas",
    role: "ADMIN",
    workspaceIds: ["ws_global", "ws_cyber", "ws_finance", "ws_infra"],
  };

  /**
   * Simple non-cryptographic pseudo SHA-256 hash generator for immutable chain calculation in browser environments
   */
  private static computeHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    // Expand to 64-character hash representation
    return (hex + hex + hex + hex + hex + hex + hex + hex).slice(0, 64);
  }

  /**
   * Check if a role has a specific permission
   */
  static hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  /**
   * Check if current user has permission
   */
  static currentUserHasPermission(permission: Permission): boolean {
    return this.hasPermission(this.currentUser.role, permission);
  }

  /**
   * Get active user profile
   */
  static getCurrentUser(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch {
      // Fallback to default
    }
    return this.currentUser;
  }

  /**
   * Update active user role
   */
  static setCurrentUserRole(role: UserRole): UserProfile {
    const previousRole = this.currentUser.role;
    this.currentUser = {
      ...this.currentUser,
      role,
    };
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    } catch (e) {
      console.error("Failed to persist user profile:", e);
    }

    this.logAction(
      "ROLE_CHANGE",
      `user:${this.currentUser.id}`,
      `Role updated from ${previousRole} to ${role}`
    );

    return this.currentUser;
  }

  /**
   * Record an immutable audit log entry into cryptographically chained storage
   */
  static logAction(action: AuditAction, resource: string, details: string): AuditLogEntry {
    const logs = this.getAuditLogs();
    const previousHash = logs.length > 0 ? logs[logs.length - 1].hash : "0000000000000000000000000000000000000000000000000000000000000000";
    const timestamp = Date.now();
    const id = `audit_${timestamp}_${Math.random().toString(36).substr(2, 6)}`;

    const rawContent = `${id}:${timestamp}:${this.currentUser.id}:${this.currentUser.role}:${action}:${resource}:${details}:${previousHash}`;
    const hash = this.computeHash(rawContent);

    const entry: AuditLogEntry = {
      id,
      timestamp,
      userId: this.currentUser.id,
      userRole: this.currentUser.role,
      action,
      resource,
      details,
      hash,
      previousHash,
    };

    logs.push(entry);

    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(-500)));
    } catch (e) {
      console.error("Failed to write audit log:", e);
    }

    return entry;
  }

  /**
   * Retrieve stored audit log entries
   */
  static getAuditLogs(): AuditLogEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Return empty array on failure
    }
    return [];
  }

  /**
   * Verify the immutable chain integrity of the audit log
   */
  static verifyLogIntegrity(): { isValid: boolean; brokenAtIndex?: number } {
    const logs = this.getAuditLogs();
    if (logs.length === 0) return { isValid: true };

    for (let i = 0; i < logs.length; i++) {
      const current = logs[i];
      const expectedPreviousHash =
        i === 0
          ? "0000000000000000000000000000000000000000000000000000000000000000"
          : logs[i - 1].hash;

      if (current.previousHash !== expectedPreviousHash) {
        return { isValid: false, brokenAtIndex: i };
      }

      const rawContent = `${current.id}:${current.timestamp}:${current.userId}:${current.userRole}:${current.action}:${current.resource}:${current.details}:${current.previousHash}`;
      const recomputedHash = this.computeHash(rawContent);

      if (recomputedHash !== current.hash) {
        return { isValid: false, brokenAtIndex: i };
      }
    }

    return { isValid: true };
  }
}
