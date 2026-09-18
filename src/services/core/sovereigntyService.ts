/**
 * ATLAS Sovereign Infrastructure Cluster Profiles Service (v3.6.4)
 * Manages sovereign deployment profiles, regulatory compliance standards, and data residency controls.
 */

import { SovereignClusterProfile, Plan } from "@types";
import { RbacAuditService } from "./rbacAuditService";

const STORAGE_KEYS = {
  ACTIVE_CLUSTER_ID: "atlas_active_sovereign_cluster_v1",
};

const DEFAULT_SOVEREIGN_PROFILES: SovereignClusterProfile[] = [
  {
    id: "cluster_eu_sovereign",
    name: "EU Sovereign Cloud Cluster (Frankfurt)",
    region: "eu-central-1",
    provider: "AWS Sovereign Cloud / Telekom",
    complianceFrameworks: ["GDPR", "DORA", "ISO27001"],
    isolationLevel: "SOVEREIGN_CLOUD",
    encryptionStandard: "AES-256-GCM + Quantum-Resistant Post-Kyber",
    dataResidencyRegion: "Germany / EU Jurisdiction",
    isActive: true,
    maxSensitivityLevel: "RESTRICTED",
  },
  {
    id: "cluster_fedramp_high",
    name: "US GovCloud FedRAMP High",
    region: "us-gov-west-1",
    provider: "AWS GovCloud",
    complianceFrameworks: ["FedRAMP_HIGH", "SOC2_TYPE_II", "HIPAA"],
    isolationLevel: "AIR_GAPPED",
    encryptionStandard: "FIPS 140-3 Cryptographic Module",
    dataResidencyRegion: "United States (US Citizens Only)",
    isActive: false,
    maxSensitivityLevel: "TOP_SECRET",
  },
  {
    id: "cluster_apac_sovereign",
    name: "APAC Data Residency Cluster (Singapore)",
    region: "ap-southeast-1",
    provider: "Google Cloud Sovereign",
    complianceFrameworks: ["ISO27001", "SOC2_TYPE_II", "GDPR"],
    isolationLevel: "HYBRID_PRIVATE",
    encryptionStandard: "AES-256-GCM + Customer Managed Keys",
    dataResidencyRegion: "Singapore / ASEAN Zone",
    isActive: false,
    maxSensitivityLevel: "RESTRICTED",
  },
];

export class SovereigntyService {
  /**
   * Get all sovereign cluster profiles
   */
  static getClusterProfiles(): SovereignClusterProfile[] {
    return DEFAULT_SOVEREIGN_PROFILES;
  }

  /**
   * Get active sovereign cluster profile
   */
  static getActiveClusterProfile(): SovereignClusterProfile {
    try {
      const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CLUSTER_ID);
      if (activeId) {
        const found = DEFAULT_SOVEREIGN_PROFILES.find((p) => p.id === activeId);
        if (found) return found;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SOVEREIGN_PROFILES[0];
  }

  /**
   * Set active sovereign cluster profile
   */
  static setActiveClusterProfile(clusterId: string): SovereignClusterProfile {
    const target = DEFAULT_SOVEREIGN_PROFILES.find((p) => p.id === clusterId);
    if (!target) {
      throw new Error(`Sovereign cluster profile '${clusterId}' not found.`);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CLUSTER_ID, target.id);
    } catch (e) {
      console.error("Failed to store active cluster ID:", e);
    }

    RbacAuditService.logAction(
      "CLUSTER_DEPLOY",
      `cluster:${target.id}`,
      `Enforced sovereign cluster profile '${target.name}' (${target.isolationLevel}, Compliance: ${target.complianceFrameworks.join(
        ", "
      )})`
    );

    return target;
  }

  /**
   * Evaluate regulatory compliance posture for a given plan under current sovereign profile
   */
  static verifyPlanCompliance(plan: Plan): {
    isCompliant: boolean;
    activeProfile: SovereignClusterProfile;
    supportedFrameworks: string[];
    complianceScore: number;
    warnings: string[];
  } {
    const activeProfile = this.getActiveClusterProfile();
    const warnings: string[] = [];

    if (!plan.tasks || plan.tasks.length === 0) {
      return {
        isCompliant: true,
        activeProfile,
        supportedFrameworks: activeProfile.complianceFrameworks,
        complianceScore: 100,
        warnings: [],
      };
    }

    // Check tasks for sensitivity vs cluster isolation
    let complianceScore = 100;

    plan.tasks.forEach((task) => {
      if (task.theme === "Cyber" && activeProfile.isolationLevel === "MULTI_TENANT_ISOLATED") {
        warnings.push(`Task ${task.id} requires high isolation (Current: ${activeProfile.isolationLevel})`);
        complianceScore -= 10;
      }
    });

    return {
      isCompliant: complianceScore >= 80,
      activeProfile,
      supportedFrameworks: activeProfile.complianceFrameworks,
      complianceScore: Math.max(0, complianceScore),
      warnings,
    };
  }
}
