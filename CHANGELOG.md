# 📜 Changelog: Atlas Strategic Agent

All notable changes to this project are documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.4.0] - 2026-03-31

### 🚀 Dependency Modernization & Critical Fixes

This release focuses on updating the entire dependency stack to their latest versions, resolving security vulnerabilities, fixing critical build issues, and unifying the application version across the entire codebase and documentation.

### Added
- **Coverage Infrastructure**: Added `@vitest/coverage-v8` ^4.1.2 to devDependencies for proper test coverage reporting
- **TypeScript Deprecation Handling**: Added `ignoreDeprecations: "6.0"` flag to tsconfig.json for TypeScript 6.0.2+ baseUrl deprecation warnings

### Changed
- **Version Unification**: Synchronized application version to **v3.4.0** across 20+ files, including `package.json`, `index.html`, `AGENT.md`, `README.md`, and all core source modules
- **Dependency Modernization**: Updated all project dependencies to their latest major/minor versions:
  - TypeScript 6.0.2+ (with deprecation handling)
  - Vite 8.0.3+ / Vitest 4.1.2+
  - Lucide React 1.7.0+ (migrated `Github` icon to `GitBranch` due to upstream removal)
  - Framer Motion 12.38.0+
  - Tailwind CSS 4.2.2+
  - React 19.2.4+
  - @testing-library/dom 10.4.1+ (added as missing dependency)
  - @vitest/coverage-v8 4.1.2+ (added for coverage support)
- **User-Agent Update**: Updated service layer `USER_AGENT` strings to `Atlas-Strategic-Agent/3.4.0` for accurate platform telemetry

### Fixed
- **Critical Build Issues**:
  - Fixed missing `@vitest/coverage-v8` dependency preventing test coverage generation
  - Fixed missing `@testing-library/dom` dependency causing test suite failures
  - Resolved TypeScript 6.0 baseUrl deprecation warnings with proper configuration flag
  - Updated Vite `manualChunks` configuration to use functional API (fixes Rollup compatibility)
  - Migrated Lucide React `Github` icon to `GitBranch` (Github icon removed in lucide-react 1.7.0)
  
- **Orchestration Logic**: Refined the `MissionControl` synthesis report to accurately display the number of optimization cycles (iterations - 1)
- **Test Infrastructure**: Resolved all missing dependencies ensuring Vitest suite compatibility with latest React testing library
- **Security Audit**: Eliminated all high and moderate security vulnerabilities via dependency updates
- **Icon System**: Fixed icon import errors in UI components due to Lucide React breaking changes

### Verified
- **Full System Audit**: 100% pass rate on `npm run lint`, `npm run type-check`, and `npm test` following dependency upgrades
- **Zero Warnings**: Achieved complete elimination of TypeScript and ESLint warnings
- **Test Coverage**: Maintained 85%+ coverage threshold across all metrics

### Breaking Changes
None - This is a maintenance release with backward-compatible updates.

### Migration Notes
**Action Required**:
- Run `npm install` to update local dependencies and `package-lock.json`
- If using custom icon imports from lucide-react, verify icon names haven't changed in v1.7.0
- TypeScript 6.0+ users: The baseUrl deprecation warning is now suppressed via tsconfig.json

---

## [3.3.0] - 2026-03-31

### 🏛️ Strategic Repository Reorganization & Cleanup

This major structural update categorizes the component library into a logical hierarchy, removes years of architectural drift (dead code), and solidifies the build pipeline for enterprise-scale development.

### Added
- **Categorized Component Architecture**: Introduced a three-tier component hierarchy:
  - `src/components/ui/`: Generic, low-level A2UI glassmorphic primitives
  - `src/components/views/`: High-level dashboard modules (Timeline, Graph, TaskBank)
  - `src/components/cards/`: Specialized mission-logic cards (TaskCard)

### Changed
- **Directory Normalization**: Migrated 7+ core components from a flat `src/components` structure to categorized subdirectories
- **Import Optimization**: Normalized all internal import paths and path aliases to match the new architecture

### Fixed
- **Architectural Debt**:
  - Deleted redundant root-level `components/` directory
  - Removed duplicate `postcss.config.cjs` (consolidated into ESM `.js` version)
  - Resolved "ghost" import warnings by aligning file locations with `tsconfig.json` path aliases

### Verified
- **Full System Audit**: Successfully executed global type-checking (`tsc --noEmit`) and enterprise linting (`eslint .`) with a 100% pass rate post-reorganization

---

## [3.2.7] - 2026-03-31

### 🚀 Dependency Modernization & Protocol Refinement

This release focuses on achieving 100% type safety in the core ADK, establishing a **Zero Warning Pipeline** by resolving all legacy linting issues, and modernizing the service layer for enterprise integrations.

### Added
- **Strongly-Typed Contracts**: Introduced `AnalystResult` and `CriticResult` interfaces across the agent swarm. Replaced all `any` usage in `BaseAgent` generics with `unknown`
- **Type-Safe Service Layer**: Redesigned `GithubService` and `JiraService` to use strict result interfaces (`GithubSyncResult`, `JiraSyncResult`)
- **Identity Sync**: Unified system instructions with platform versioning. The agent core now operates with full awareness of v3.4.0 constraints
- **Enhanced Refinement Loop**: Formalized the `Strategist → Critic → Analyst` pipeline in `MissionControl` with multi-step optimization cycles
- **Styling & UI**: Full migration to Tailwind CSS v4 using CSS-first configuration via `@theme` and `@utility` directives in `src/index.css`

### Fixed
- **Enterprise-Grade Linting**: Resolved 40+ linting warnings across the project, including unused variables in `App.tsx` and `geminiService.ts`
- **Global Type Hygiene**: Cleaned up `global.d.ts` by removing unused JSX namespaces and redundant imports
- **Dependency Resolution**: Fixed "Cannot find module" errors in `smoke.test.ts` by aligning vitest configurations
- **Agent Generics**: Corrected type inference in `AgentSwarm` and `AgentFactory` to ensure strict contract enforcement during collaborative synthesis
- **Library Modernization**: Updated 25+ dependencies to their latest versions, including React 19.2.4+, Vitest 4.0.18+, and Vite 7.3.1+
- **Test Infrastructure**:
  - Optimized Vitest coverage thresholds with nested configuration in `vitest.config.ts`
  - Implemented mocks for `Element.prototype.scrollIntoView` and `crypto.randomUUID` in `src/test/setup.ts` for robust component testing

---

## [3.2.6] - 2026-01-28

### 🚀 Orchestration Hardening & Synchronization

This release focuses on hardening the multi-agent orchestration pipeline, fixing critical JSON parsing logic for LLM responses, and reconciling local codebase with premium remote features.

### Added
- **Dynamic Agent Metadata**: Agents now return strongly-typed results (`AnalystResult`, `CriticResult`) instead of unstructured objects
- **Enhanced MissionControl**: Improved iterative refinement loop in `orchestrator.ts` with better feedback propagation

### Fixed
- **JSON Parsing Logic**: Fixed critical bug in `GeminiService` where leading/trailing brackets were being stripped from structured JSON responses, causing intermittent parsing failures
- **Multi-Agent Property Mapping**: Resolved property mismatches in the `Strategist → Analyst → Critic` pipeline that caused missing feasibility scores and review notes
- **Git Reconciliation**: Unified local environment with remote v3.2.5 feature set, restoring glassmorphic UI assets and advanced agent swarm logic
- **Type-Check & Linting**:
  - Fixed 50+ type errors related to `MissionResult` and `SubTask` interfaces
  - Resolved `vitest.config.ts` version mismatch through type casting
  - Fixed "unused-vars" and "empty-functions" lint errors across `setup.ts` and `agents.ts`
- **UI State Management**: Fixed a type mismatch in `Sidebar.tsx` where `activeTaskId` failed strict null checks

---

## [3.2.5] - 2026-01-24

### 🚀 Continuous Improvement & Infrastructure

This release focuses on centralized utilities, improved code organization, and addressing critical linting errors and broken imports discovered during integration.

### Added
- **Centralized Utilities**: Introduced `src/lib/utils.ts` with a standardized `cn` utility for Tailwind class merging
- **Improved Project Structure**: Migrated 5+ components to use centralized utilities, reducing code duplication

### Fixed
- **Import Resolution**: Fixed broken imports of `@types/plan.types` in `TaskBank.tsx` and `ui.tsx`
- **Linting & Quality**:
  - Resolved "unexpected empty arrow function" error in `App.tsx`
  - Fixed missing `motion` imports in `src/config/ui.tsx`
  - Corrected versioning inconsistencies in the header and metadata
- **Production Safety**: Enhanced `A2UIRenderer` event handling with logging and validation
- **Coverage**: Increased strictness of test coverage thresholds from 80% to 85%
- **UI Quality**:
  - Implemented noise texture overlay for premium "film-grain" aesthetic
  - Added staggered entrance animations for welcome prompts using Framer Motion
  - Enhanced input focus states with glows and rings
- **Documentation**:
  - Restored readable text in "Technical Deep Dive" by fixing global find-replace errors
  - Updated directory structure in contributing guidelines to match source
  - Added navigation links to technical documentation in README
- **Type Safety**:
  - Removed explicit `any` usage in `CriticAgent` by utilizing proper `Plan` type inference
  - Eliminated unnecessary type casting in `PersistenceService` validation logic
  - Fixed missing `Priority` import in `agents.ts`

### Changed
- **Branding**: Updated internal versioning to `v3.2.5` across all dashboard elements
- **Codebase**: Refactored `App.tsx` by extracting `Sidebar` component to reduce cognitive load and improve maintainability

---

## [3.2.4] - 2026-01-23

### 🚀 Production Hardening & Type Safety

This release focuses on resolving type safety issues, improving test infrastructure, and hardening the production build process.

### Fixed
- **Type System**: Resolved 150+ TypeScript errors across components and services
  - Fixed A2UIRenderer component type safety with proper Props interfaces
  - Corrected PersistenceService storage key type definitions
  - Fixed SettingsModal import paths and motion component declarations
  - Resolved BankTask type mismatches between data and types
- **Missing Dependencies**: Added missing Framer Motion imports across components
  - A2UIRenderer now properly imports motion components
  - SettingsModal motion animations fully typed
  - Config UI module includes required motion declarations
- **Test Infrastructure**: Fixed Vitest configuration and test setup
  - Corrected crypto.randomUUID mocking approach for browser environment
  - Fixed localStorage mock implementation for test isolation
  - Updated coverage configuration to remove invalid options
  - Resolved test file import paths and type declarations
- **Service Layer**: Enhanced error handling and type safety
  - GithubService: Added missing parseErrorResponse and addToProject methods
  - JiraService: Completed type definitions for config and results
  - PersistenceService: Fixed storage key enum type consistency
- **Build Configuration**: Updated Vite and Tailwind configurations
  - Vite dev server now runs on port 3000 (was 5173)
  - Fixed PostCSS configuration for Tailwind 4.1 compatibility
  - Resolved path alias inconsistencies across build tools

### Changed
- **Development Workflow**: Improved developer experience
  - Updated test scripts to use proper Vitest configuration
  - Enhanced type-check command output for better error reporting
  - Standardized code formatting across all TypeScript files
- **Documentation**: Updated inline code documentation
  - Added comprehensive JSDoc comments to service methods
  - Clarified type definitions in global.d.ts
  - Improved error messages in validation functions

### Technical Debt Addressed
- Eliminated all `any` types in favor of proper type definitions
- Removed unused imports and dead code across 15+ files
- Standardized error handling patterns in async service methods
- Fixed inconsistent naming conventions in configuration modules

---

## [3.2.3] - 2026-01-21

### 🎨 Glassmorphic UI Enhancement

Final stabilization and hardening release focusing on UI polish and performance optimization.

### Added
- **Enhanced Glassmorphic Design**: Refined backdrop-blur and glass surface rendering
- **Performance Optimization**: Reduced initial bundle size by 15% through code splitting
- **Animation Polish**: Smooth Framer Motion transitions across all UI components

### Changed
- **Icon System**: Migrated to Lucide React 0.563.0 for better tree-shaking
- **Color System**: Refined atlas-blue and glass color tokens for accessibility

---

## [3.2.2] - 2026-01-21

### 🏗️ Architecture Refinement

Improved Agent Development Kit (ADK) architecture and service layer abstraction.

### Added
- **Agent Factory**: Centralized agent instantiation with pooling for performance
- **Sync Services**: Unified GitHub and Jira synchronization orchestration
- **Workflow Presets**: Pre-configured strategic workflow templates

### Changed
- **MissionControl**: Enhanced collaborative synthesis pipeline
- **UIBuilder**: Fluent API improvements for A2UI message construction

---

## [3.2.1] - 2026-01-21

### 🔧 Production Infrastructure

Enterprise-grade infrastructure improvements and testing coverage.

### Added
- **Comprehensive Test Suite**: Achieved 80%+ coverage across core modules
- **Error Boundaries**: React error boundaries for graceful failure handling
- **Loading States**: Premium loading animations and progress indicators

### Fixed
- **Memory Leaks**: Resolved agent pool memory retention issues
- **Type Safety**: Eliminated remaining `any` types in service layer

---

## [3.2.0] - 2026-01-20

### 🎯 Multi-Agent Synthesis & A2UI Protocol

Major release introducing collaborative agent architecture and glassmorphic UI protocol.

### Added
- **Multi-Agent Synthesis Engine**: Strategist, Analyst, and Critic agents working in collaborative feedback loop
- **A2UI Protocol v1.1**: Real-time streaming of glassmorphic UI components from LLM reasoning
- **Strategic Visualization**: Interactive dependency graphs powered by XYFlow (React Flow) v12.10
- **What-If Simulation Engine**: Model failure cascades and calculate strategic risk scores
- **Enterprise Sync**: Native bidirectional synchronization with GitHub Issues API v3 and Jira Cloud REST API
- **Glassmorphic UI**: Premium, high-performance executive dashboard built with React 19, Tailwind CSS 4.1
- **MissionControl Persistence**: Local caching with Base64 obfuscation for secure, long-running sessions
- **2026 TaskBank**: 90+ pre-calculated strategic objectives for AI, Cyber, ESG, and Infrastructure

### Technical Foundation
- **AI Core**: Google Gemini 2.0 Flash integration with JSON schema enforcement
- **Build Stack**: Vite 7.3 + TypeScript 5.9 + PostCSS compilation
- **Testing**: Vitest 4.0 with 80% coverage enforcement
- **Type Safety**: Strict TypeScript implementation across entire Agent Development Kit (ADK)

### Architecture
- **Agent Development Kit (ADK)**: Modular agent system with factory pattern
- **A2UI Renderer**: React component that renders LLM-generated UI specifications
- **Persistence Service**: Encrypted localStorage with quota management
- **Sync Services**: Abstraction layer for GitHub/Jira bidirectional sync

---

## [3.1.0] - 2026-01-18

### 🌟 Foundation Release

Initial public release of Atlas Strategic Agent.

### Added
- **Core Engine**: Basic strategic planning with Google Gemini integration
- **Task Management**: Simple task creation and tracking
- **UI Foundation**: Basic React interface with Tailwind CSS
- **GitHub Integration**: One-way export to GitHub Issues

---

## [3.0.0] - 2026-01-15

### 🔬 Internal Alpha

Internal development version with core architecture exploration.

### Added
- **Proof of Concept**: Multi-agent system architecture
- **LLM Integration**: Initial Gemini API experiments
- **UI Prototypes**: Glassmorphic design system exploration

---

## Versioning Strategy

Atlas Strategic Agent follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- **MAJOR**: Breaking changes to ADK API or data persistence format
- **MINOR**: New features, agent capabilities, or enterprise integrations
- **PATCH**: Bug fixes, performance improvements, and documentation

---

## Support & Feedback

For issues, questions, or contributions:

- 🐛 [Report Bug](https://github.com/darshil0/atlas-strategic-agent/issues)
- 💡 [Request Feature](https://github.com/darshil0/atlas-strategic-agent/issues)
- 📖 [Documentation](https://github.com/darshil0/atlas-strategic-agent/wiki)
- 💬 [Discussions](https://github.com/darshil0/atlas-strategic-agent/discussions)

---

## Migration Guides

### Upgrading from 3.3.x to 3.4.0

**Action Required**:
- Run `npm install` to update local dependencies and `package-lock.json`
- TypeScript 6.0+ users: baseUrl deprecation warnings are now automatically suppressed
- Verify lucide-react icon imports if you've customized the icon system

**Breaking Changes**: None - fully backward compatible

### Upgrading from 3.2.7 to 3.3.0

**Structural Changes**:
- Components have moved from `src/components/*` to `src/components/[ui|views|cards]/*`

**Action Required**: 
- Update custom imports if you are extending Atlas through external modules
- The core `App.tsx` has been automatically updated to reflect these changes

### Upgrading from 3.2.6 to 3.2.7

No breaking changes. This release is a maintenance update for dependencies and documentation.

**Action Required**: Run `npm install` to synchronize your local node_modules with the updated `package-lock.json`

---

<div align="center">

**Atlas Strategic Agent** - Transforming executive vision into executable reality

*Powered by Google Gemini 2.0 Flash*

</div>
