/**
 * ATLAS Cross-Enterprise Vendor Network Mapping Service (v3.6.4)
 * Maps supply chain dependencies, SLA thresholds, and external vendor networks across strategic task DAGs.
 */

import { Plan, SubTask, VendorDependency, VendorRiskLevel } from "@types";

const ENTERPRISE_VENDOR_CATALOG: VendorDependency[] = [
  {
    id: "vendor_aws",
    vendorName: "Amazon Web Services (AWS)",
    serviceType: "Cloud Infrastructure & GovCloud",
    slaThreshold: "99.99%",
    riskLevel: "LOW",
    dependencyType: "INFRASTRUCTURE",
    impactedTasks: [],
  },
  {
    id: "vendor_openai",
    vendorName: "OpenAI Enterprise",
    serviceType: "LLM API & Inference Infrastructure",
    slaThreshold: "99.9%",
    riskLevel: "MEDIUM",
    dependencyType: "API",
    impactedTasks: [],
  },
  {
    id: "vendor_crowdstrike",
    vendorName: "CrowdStrike Falcon",
    serviceType: "Zero-Trust Endpoint & Managed Detection",
    slaThreshold: "99.999%",
    riskLevel: "LOW",
    dependencyType: "COMPLIANCE",
    impactedTasks: [],
  },
  {
    id: "vendor_datadog",
    vendorName: "Datadog Telemetry",
    serviceType: "Enterprise APM & Observability",
    slaThreshold: "99.9%",
    riskLevel: "LOW",
    dependencyType: "DATA",
    impactedTasks: [],
  },
  {
    id: "vendor_snowflake",
    vendorName: "Snowflake Data Cloud",
    serviceType: "Enterprise Data Lakehouse",
    slaThreshold: "99.95%",
    riskLevel: "MEDIUM",
    dependencyType: "DATA",
    impactedTasks: [],
  },
  {
    id: "vendor_sap",
    vendorName: "SAP S/4HANA Cloud",
    serviceType: "Enterprise ERP & Finance Core",
    slaThreshold: "99.9%",
    riskLevel: "HIGH",
    dependencyType: "INFRASTRUCTURE",
    impactedTasks: [],
  },
];

export class VendorNetworkService {
  /**
   * Get complete vendor catalog
   */
  static getVendorCatalog(): VendorDependency[] {
    return ENTERPRISE_VENDOR_CATALOG;
  }

  /**
   * Calculate supply chain risk metrics for a given Plan
   */
  static analyzeVendorRisk(plan: Plan): {
    totalVendorDependencies: number;
    highestRiskLevel: VendorRiskLevel;
    vendorCoverage: { vendorName: string; count: number; riskLevel: VendorRiskLevel }[];
    impactedTaskCount: number;
  } {
    if (!plan.tasks || plan.tasks.length === 0) {
      return {
        totalVendorDependencies: 0,
        highestRiskLevel: "LOW",
        vendorCoverage: [],
        impactedTaskCount: 0,
      };
    }

    const vendorMap = new Map<string, VendorDependency>();
    ENTERPRISE_VENDOR_CATALOG.forEach((v) => vendorMap.set(v.id, v));

    const coverageMap = new Map<string, { vendorName: string; count: number; riskLevel: VendorRiskLevel }>();
    let impactedTaskCount = 0;

    plan.tasks.forEach((task) => {
      if (task.vendorIds && task.vendorIds.length > 0) {
        impactedTaskCount++;
        task.vendorIds.forEach((vId) => {
          const vendor = vendorMap.get(vId);
          if (vendor) {
            const existing = coverageMap.get(vId) || {
              vendorName: vendor.vendorName,
              count: 0,
              riskLevel: vendor.riskLevel,
            };
            existing.count++;
            coverageMap.set(vId, existing);
          }
        });
      }
    });

    const vendorCoverage = Array.from(coverageMap.values());
    const totalVendorDependencies = vendorCoverage.reduce((acc, v) => acc + v.count, 0);

    let highestRiskLevel: VendorRiskLevel = "LOW";
    if (vendorCoverage.some((v) => v.riskLevel === "CRITICAL")) highestRiskLevel = "CRITICAL";
    else if (vendorCoverage.some((v) => v.riskLevel === "HIGH")) highestRiskLevel = "HIGH";
    else if (vendorCoverage.some((v) => v.riskLevel === "MEDIUM")) highestRiskLevel = "MEDIUM";

    return {
      totalVendorDependencies,
      highestRiskLevel,
      vendorCoverage,
      impactedTaskCount,
    };
  }

  /**
   * Link external vendor dependency to a task
   */
  static linkVendorToTask(task: SubTask, vendorId: string): SubTask {
    const vendorIds = new Set(task.vendorIds || []);
    vendorIds.add(vendorId);
    return {
      ...task,
      vendorIds: Array.from(vendorIds),
    };
  }
}
