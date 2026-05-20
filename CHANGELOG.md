# Changelog

All notable changes to the ATLAS Strategic Matrix project will be documented in this file.

## [3.6.4] - 2026-05-20
### Fixed
- **Task Synchronization**: Standardized Task ID regex to `/\233\[([A-Z]+-\d+-[A-Z0-9]+-\d+)\]/` to support 4-part strategic task IDs in GitHub and Jira integrations.
- **A2UI Protocol**: Expanded protocol to support advanced UI components including Charts, Stats, Inputs, Checkboxes, and Selects for richer agent-to-user interactions.
- **Persistence Layer**: Implemented `Mutex` class in `PersistenceService` to manage atomic asynchronous plan saves and prevent `localStorage` race conditions.
- **Type Definitions**: Unified and expanded core types for `SyncResult`, `GithubIssueResult`, and `JiraTicketResult`.

### Changed
- **Tailwind v4 Migration**: Complete migration to Tailwind CSS v4 utilizing the new CSS-first configuration and `@theme` engine.
- **Project Configuration**: Unified and optimized `tsconfig.json`, `vite.config.ts`, and `vitest.config.ts` for improved developer experience and path alias resolution.
- **Agent Orchestration**: Enhanced `MissionControl` loop with improved feedback passing between Analyst, Critic, and Strategist agents.

---

## [3.6.3] - 2026-05-10
### Fixed
- **Type Safety**: Fixed `A2UIMessage` interface to properly include required `timestamp` field
- **Path Aliases**: Complete tsconfig.json and vitest.config.ts path alias configuration (@services, @data, @lib, @components, @adk)
- **Imports**: Fixed missing `AnalystResult` and `CriticResult` imports in orchestrator.ts
- **Circular Dependencies**: Resolved circular import risk in src/config/index.ts by separating createAtlasMission function
- **Persistence Mutex**: Improved null safety in PersistenceService getSecret/setSecret methods with proper error handling
- **Test Setup**: Fixed vi.mocked() wrapper usage in integration tests for proper PersistenceService mocking
- **Modal Validation**: Added proper `type` attribute to SettingsModal input fields for password field handling
- **Agent Types**: Exported `AnalystResult` from types/index.ts for proper agent feedback typing

### Changed
- **Documentation**: Updated README.md with production deployment guidance and architecture diagram
- **Test Reliability**: Enhanced mock setup in vitest configuration to prevent test race conditions
- **Type Exports**: Reorganized AgentExecutionContext to include `analysis?: AnalystResult` field

### Verified
- ✅ All path aliases working across src/, vitest, and TypeScript compilation
- ✅ A2UI protocol v1.1 glassmorphic message validation
- ✅ PersistenceService encryption/decryption with proper secret management
- ✅ MissionControl pipeline with 3-iteration critic feedback loop
- ✅ GitHub/Jira integration retry logic with exponential backoff
- ✅ Failure cascade simulation with proper DAG traversal
- ✅ Test coverage maintained at 85%+ threshold

---

## [3.6.2] - 2026-05-05
### Added
- TaskBank filtering by theme (AI, Cyber, ESG, Global, Infra, People)
- AgentConstellation component for real-time neural activity visualization
- Formal dependency tracking system with transitive closure validation

### Fixed
- CRT scanline effect rendering in glassmorphic containers
- ReactFlow memory leaks with proper cleanup in useEffect dependencies
- Firestore race conditions using atomic functional state updates

---

## [3.6.1] - 2026-04-28
### Added
- Multi-pass agent collaboration (Strategist → Analyst → Critic)
- Stress testing framework for failure cascade modeling
- What-If Mode toggle for contingency planning

### Fixed
- Gemini API timeout handling with proper Promise.race() pattern
- Firestore validation rules preventing denial-of-wallet attacks
- ReactFlow node positioning with toposorting algorithm

---

## [3.6.0] - 2026-04-20
### Major Release
- 🏛️ **ATLAS Strategic Matrix v3.6** - Production-ready enterprise roadmap orchestration
- **Multi-Agent Swarm**: Strategist, Analyst, Critic agents with autonomous collaboration
- **Glassmorphic UI**: Premium frosted-glass design system with CRT effects
- **ReactFlow Integration**: Interactive dependency visualization with D3-style force-directed layout
- **Firestore Persistence**: Real-time multi-user plan sync with encryption

---

## [1.0.0] - Initial Release
- Core ATLAS Strategic Matrix functionality
- Executive prompt-to-roadmap synthesis
- Glassmorphism UI design foundation
