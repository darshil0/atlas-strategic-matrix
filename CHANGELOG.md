# Changelog

All notable changes to the ATLAS Strategic Matrix project are documented below. This project adheres to Semantic Versioning.

## [3.6.4] - 2026-06-15

### Fixed

* **Task Synchronization:** Standardized Task ID regex pattern to `/\[([A-Z]+-\d+-[A-Z0-9]+-\d+)\]/` to support 4-part strategic IDs (e.g., `AI-26-Q1-001`) across GitHub and Jira.
* **A2UI Protocol:** Added support for native UI primitives (Charts, Stats, Inputs, Checkboxes, Selects) within agent-to-user interaction frames.
* **Persistence Layer:** Introduced an asynchronous `Mutex` lock mechanism in `PersistenceService` to prevent `localStorage` write race conditions during concurrent saves.
* **Type Definitions:** Unified return signatures for `SyncResult`, `GithubIssueResult`, and `JiraTicketResult`.
* **Testing Infrastructure:** Resolved flaky environment mocks and `any` casts in localized mocks; achieved high reliability with a hybrid mocking pattern.
* **Server Parsing:** Resolved `server.ts` parsing errors and updated `tsconfig` to handle deprecated values.

### Changed

* **Tailwind v4 Migration:** Upgraded frontend to Tailwind CSS v4, utilizing a CSS-first `@theme` engine and `@tailwindcss/postcss`.
* **Zero Warning Baseline:** Achieved a strict "Zero Warning" state across TypeScript, ESLint, and Vitest pipelines.
* **Project Build System:** Consolidated environment configs and resolved absolute path alias conflicts across `tsconfig.json`, `vite.config.ts`, and `vitest.config.ts`.
* **Dependencies:** Upgraded to React 19, Vite 6, and Framer Motion 12; pinned `tailwind-merge` to `^3.5.0` for registry alignment.
* **AI Engine:** Switched to Google Gemini 2.0 Flash as the primary SDK for strategic orchestration.

---

## [3.6.3] - 2026-05-10

### Fixed

* **Type Safety:** Enforced requirement of the `timestamp` field in the `A2UIMessage` schema.
* **Path Aliases:** Corrected tsconfig resolution paths for key directories (`@services`, `@data`, `@lib`, `@components`, `@adk`) across both build and test environments.
* **Module Imports:** Restored missing `AnalystResult` and `CriticResult` exports in `orchestrator.ts`.
* **Circular Dependencies:** Extracted `createAtlasMission` from `src/config/index.ts` to break a critical circular initialization loop.
* **Persistence Layer:** Added null-safety checks to `PersistenceService` credential retrieval methods.
* **Test Isolation:** Replaced flaky environment mocks with explicit `vi.mocked()` wrappers in integration suites.

### Verified Baseline

* Path alias resolution functional across compilation pipelines.
* Real-time multi-agent processing with 3-iteration loop ceiling.
* Exponential backoff and retry limits on all upstream enterprise API calls.
* 85% statement, branch, and function test coverage threshold maintained.

---

## [3.6.2] - 2026-05-05

### Added

* Categorized TaskBank filtering by enterprise theme parameters (AI, Cyber, ESG, Global, Infra, People).
* Built `<AgentConstellation/>` UI component to track active neural agent telemetry.
* Implemented formal DAG tracking system with transitive closure verification.

### Fixed

* Optimized backdrop filters on glassmorphic container components to eliminate render-stutter.
* Resolved memory leaks in `@xyflow/react` instances by binding strict cleanup functions within internal hooks.
* Mitigated database write conflicts via atomic functional state updates in Firestore.

---

## [3.6.1] - 2026-04-28

### Added

* Multi-pass sequential generation chain: Strategist $\rightarrow$ Analyst $\rightarrow$ Critic.
* Deterministic failure cascade simulation engine for stress-testing planned task dependencies.
* **What-If Mode** toggle for interactive risk modeling.

### Fixed

* Wrapped Gemini LLM invocations in a `Promise.race()` wrapper to enforce strict network timeouts.
* Hardened Firestore security rules to protect database endpoints against denial-of-wallet vectors.
* Integrated a topological sorting algorithm to calculate node layouts dynamically.

---

## [3.6.0] - 2026-04-20

### Major Release

* **Engine:** Initial production release of the core enterprise multi-agent swarm platform.
* **UI Architecture:** Launched responsive glassmorphic layout featuring interactive `@xyflow/react` topological graph views.
* **Persistence:** Deployed real-time multi-user document state synchronization backed by Firestore.

---

## [1.0.0] - Historical Initial Release

* Core ATLAS proof of concept.
* Basic prompt-to-roadmap serialization framework.

Note: Version history between 1.0.0 and 3.6.0 represents rapid internal prototyping iterations and baseline stability testing. Documented change history begins with production-ready release branches.
