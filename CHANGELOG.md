# 📜 Changelog: Atlas Strategic Agent

All notable changes to this project are documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.6.3] - 2026-04-29

### 🔧 Build Tooling & Zero Warning Baseline Restoration
Comprehensive cleanup of linting warnings, refactoring for Fast Refresh compliance, and dependency resolution to maintain production-grade code health.

### Fixed
- **Vitest Suite Stability**: Resolved "failed to find the current suite" errors by decoupling `src/test/setup.ts` from test imports and migrating shared helpers to `src/test/test-utils.ts`, preventing internal suite state corruption.
- **Test Environment Hardening**: Configured `tsconfig.json` with `vitest/globals` and standardized `setup.ts` to use global injections, achieving 100% type-safe test definitions.
- **Icon Registry Mocks**: Implemented standardized `ICONS` mocks in the test environment to prevent React reconciliation errors (`Objects are not valid as a React child`).
- **LLM Service Optimization**: Fixed improper `await` pattern on synchronous response properties in `GeminiService.summarizeMission`, reducing neural core initialization latency.
- **Dependency Conflicts**: Pinned ESLint to `v9.17.0` to resolve peer dependency mismatches with `eslint-plugin-react`.
- **Fast Refresh Compliance**: Refactored `src/config/ui.tsx` logic into `src/components/ui/TaskIcons.tsx`.
- **Type Safety**: Replaced forbidden non-null assertions (`!`) with robust error handling across the ADK core.
- **Unused Variable Cleanup**: Eliminated redundant imports and unused variables in `src/test/setup.ts` to achieve 100% clean output in `lint` and `type-check`.

### Changed
- **Documentation Strategy**: Consolidated `README.md`, `AGENTS.md`, and `technical-deep-dive.md` into a single, high-fidelity `README.md` to establish a single source of truth for the ADK architecture and technical standards.
- **Project Structure**: Introduced `src/components/ui/TaskIcons.tsx` to house shared UI logic, further modularizing the component layer.
- **Entry Point**: Exported `Root` component in `src/index.tsx` to satisfy Vite's Fast Refresh requirements for entry points.

### Technical Debt Resolved
- **Zero Warning Baseline**: Achieved 0 warnings across `lint`, `type-check`, and `test`.
- **Code Robustness**: Eliminated potential runtime crashes by removing unsafe non-null assertions in core agent orchestration logic.
- **Project Modernization**: Full stack alignment with React 19, Vite 8, and Tailwind 4.2.

---

## [3.6.2] - 2026-04-28

### 🔧 Build Tooling & Configuration Hardening
Critical fixes to configuration infrastructure ensuring proper tool discovery, React 19 compliance, and elimination of configuration drift.

### Fixed
- **Configuration File Naming**: Corrected all config files to standard conventions (`.env.example`, `.gitignore`, `.prettierrc`, `eslint.config.ts`, `vite.config.ts`, `vitest.config.ts`, `postcss.config.js`, `tailwind.config.ts`) - tools now properly auto-discover configurations.
- **ESLint React Support**: Added missing React 19 plugins (`eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) with strict Hook rules enforcement to prevent runtime violations.
- **Test Configuration Duplication**: Removed duplicate test configuration from `vite.config.ts`, consolidating all test settings in `vitest.config.ts` as the single source of truth.
- **TypeScript Parser Configuration**: Explicitly configured `tseslint.parser` with JSX support in `parserOptions.ecmaFeatures` for proper JSX/TSX linting.
- **ESLint Global Scope**: Replaced incorrect `globals.jest` with correct `globals.browser`, `globals.node`, and `globals.es2022` to eliminate false "undefined variable" warnings in Vitest tests.
- **Config File Linting**: Added `*.config.{js,ts}` to ESLint ignore patterns to prevent unnecessary linting of build configuration files.

### Changed
- **package.json**: Added `eslint-plugin-react@^7.37.2`, `eslint-plugin-react-hooks@^5.1.0`, and `eslint-plugin-react-refresh@^0.4.16` to devDependencies.
- **ESLint Rules**: Enforced `react-hooks/rules-of-hooks` as error (was not configured), `react-hooks/exhaustive-deps` as warning, and `react-refresh/only-export-components` for Fast Refresh compliance.

### Technical Debt Resolved
- **Zero Warning Baseline**: Restored full compliance with strict linting standards across all configuration files.
- **Tool Discovery**: Eliminated manual configuration path specification requirements through standard naming conventions.
- **Configuration Drift**: Prevented future conflicts between Vite and Vitest test settings.

---

## [3.6.1] - 2026-04-26

### 🚀 Core Architecture Stabilization
Hardening the Atlas "nervous system" through strict type safety, memory management, and concurrent state handling.

### Added
- **Integration Test Suite**: Introduced `src/test/integration.test.tsx` for MissionControl pipelines.
- **Enterprise Linking**: Native support for GitHub Project boards and Jira Epic mapping.

### Changed
- **Type System Audit**: Achieved 100% strict TypeScript compliance; removed all explicit `any` types.
- **JSON Parsing**: Enhanced Gemini response extraction with multi-strategy parsing.
- **Version Unification**: Synchronized all core files (env, metadata, lockfiles) to **v3.6.1**.

### Fixed
- **Persistence Mutex**: Implemented `writeQueue` with non-recursive processing in `PersistenceService` to prevent storage corruption and race conditions.
- **Memory Management**: Added automated agent disposal to `AgentFactory` to optimize resource usage.
- **UI Error Surfacing**: Refactored `handleSend` in `App.tsx` to extract and display detailed error messages, improving production debuggability.
- **Type Safety**: Resolved `strictNullChecks` violations in `Mutex` implementation (src/services/core/persistence.ts).
- **Cleanup**: Removed redundant `env.example` file in favor of `.env.example`.
- **Git Merge Conflicts**: Resolved widespread codebase conflicts, successfully aligning `v3.6.0` modernization upgrades with the `v3.6.1` core functionality improvements.
- **Production Logging Hygiene**: Guarded raw debug logs in `A2UIRenderer` event handlers with `ENV.DEBUG_MODE` checks to prevent leaks in production environments.
- **Project Reorganization**: Consolidated test infrastructure by moving `src/App.test.tsx` to `src/test/` and streamlined the root directory by removing redundant environment templates.
- **Deep Structural Refinement**: Categorized the service layer into specialized subdirectories (`ai/`, `integrations/`, `core/`), relocated `index.css` to `src/styles/`, and moved global type declarations to `src/types/atlas.d.ts` for improved modularity.
- **Boot Sequence Extraction**: Refactored `src/index.tsx` by extracting the `BootLoader` and `AtlasErrorBoundary` into a dedicated `BootOrchestrator` component, reducing entry point complexity.
- **Test Infrastructure Consolidation**: Moved `src/App.test.tsx` to `src/test/App.test.tsx` to align with the centralized test directory structure.

---

## [3.6.0] - 2026-04-03
### 🚀 Dependency Modernization
- **Stack Update**: Migrated to React 19, Vite 8, Vitest 4, and Tailwind 4.2.
- **Safety Checks**: Added validation for `AtlasService` responses to prevent runtime TypeErrors.

---

## [3.5.2] - 2026-04-02
### 🔧 Maintenance & Organization
- **Structure**: Consolidated all source and test files into the `src/` directory.
- **Type Safety**: Eliminated legacy `any` usage in core configuration files.

---

## [3.5.1] - 2026-04-02
### 🔧 Standardization
- **Linting**: Integrated `jiti` for type-aware ESLint flat configuration.
- **Entry Point**: Unified `index.tsx` entry points into `src/index.tsx`.

---

## [3.5.0] - 2026-04-01
### 🔧 Critical Bug Fixes
- **Circular Imports**: Resolved self-referencing imports in the ADK barrel.
- **Timeout Logic**: Fixed `Promise.race` implementation in `GeminiService` to correctly guard network requests.
- **Error Boundaries**: Reimplemented `LocalErrorBoundary` as a React class component for proper render-phase catching.
- **Duplication**: Removed 3x redundant `cn` helper definitions across UI components.

---

## [3.4.0] - 2026-03-31
### 🚀 Modernization & Coverage
- **Testing**: Integrated `@vitest/coverage-v8` and achieved 85% coverage threshold.
- **TypeScript**: Added support for TS 6.0 features and handled `baseUrl` deprecations.

---

## [3.3.0] - 2026-03-31
### 🏛️ Repository Reorganization
- **Tiered Architecture**: Categorized components into `ui/`, `views/`, and `cards/`.
- **Cleanup**: Removed dead code, redundant PostCSS configs, and root-level artifacts.

---

## [3.2.7] - 2026-03-31
### 🚀 Protocol Refinement
- **Strong Typing**: Introduced `AnalystResult` and `CriticResult` contracts.
- **Tailwind v4**: Full migration to CSS-first configuration via `@theme`.

---

## [3.2.0] - 2026-01-20
### 🎯 Multi-Agent Synthesis & A2UI
Major release introducing the core Atlas architecture.
- **Synthesis Engine**: Strategist, Analyst, and Critic feedback loop.
- **A2UI Protocol**: Real-time glassmorphic UI streaming from LLM.
- **What-If Engine**: Strategic failure cascade modeling.
- **Enterprise Sync**: Bidirectional GitHub/Jira synchronization.

---

## [3.1.0] - 2026-01-18
### 🌟 Foundation
- Initial public release with Gemini integration and basic task management.

---

## [3.0.0] - 2026-01-15
### 🔬 Internal Alpha
- Core architecture exploration and multi-agent POC.

---

<div align="center">

**Atlas Strategic Agent** - Transforming executive vision into executable reality

[Support](https://github.com/darshil0/atlas-strategic-agent/issues) · [Migration Guides](./README.md#roadmap)

</div>
