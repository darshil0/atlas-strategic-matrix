# 📜 Changelog: Atlas Strategic Agent

All notable changes to this project are documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.6.1] - 2026-04-26

### 🚀 Core Architecture Stabilization
Hardening the Atlas "nervous system" through strict type safety, memory management, and concurrent state handling.

### Added
- **Integration Test Suite**: Introduced `src/test/integration.test.ts` for MissionControl pipelines.
- **Enterprise Linking**: Native support for GitHub Project boards and Jira Epic mapping.

### Changed
- **Type System Audit**: Achieved 100% strict TypeScript compliance; removed all explicit `any` types.
- **JSON Parsing**: Enhanced Gemini response extraction with multi-strategy parsing.
- **Version Unification**: Synchronized all core files (env, metadata, lockfiles) to **v3.6.1**.

### Fixed
- **Persistence Mutex**: Implemented `writeQueue` in `PersistenceService` to prevent storage corruption.
- **Memory Management**: Added automated agent disposal to `AgentFactory`.
- **UI Error Surfacing**: Refactored `handleSend` to extract and display detailed error messages.
- **Git Merge Conflicts**: Resolved widespread codebase conflicts, successfully aligning `v3.6.0` modernization upgrades with the `v3.6.1` core functionality improvements.
- **Production Logging Hygiene**: Guarded raw debug logs in `A2UIRenderer` event handlers with `ENV.DEBUG_MODE` checks to prevent leaks in production environments.
- **Project Reorganization**: Consolidated test infrastructure by moving `src/App.test.tsx` to `src/test/` and streamlined the root directory by removing redundant environment templates.
- **Boot Sequence Extraction**: Refactored `src/index.tsx` by extracting the `BootLoader` and `AtlasErrorBoundary` into a dedicated `BootOrchestrator` component, reducing entry point complexity.

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
