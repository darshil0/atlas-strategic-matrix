# Changelog

All notable changes to the ATLAS Strategic Matrix project will be documented in this file.

## [1.2.0] - 2026-05-10
### Added
- **Neural Telemetry**: New `AgentConstellation` component for real-time visualization of agent activity.
- **Dependency Tracking**: Introduced a formal dependency system for milestones.
- **Jira Uplink**: Integrated Jira synchronization capability within milestone details.
- **Historical Records**: Support for viewing and restoring past strategic plans.

### Changed
- **Schema Refactoring**: Migrated `dependsOn` field to `dependencies` for better alignment with industry standards.
- **Agent Roles**: Enhanced the `Analyst` and `Critic` system prompts for deeper technical scrutiny.
- **UI Hardening**: Added CRT-style scanline effects and improved bento-grid density.

### Fixed
- **Sync Race Conditions**: Optimized Firestore write patterns using functional state updates.
- **Validation**: Hardened Firestore rules to prevent "Denial of Wallet" and shadow field injection.
- **Type Safety**: Improved interface definitions for `Project` and `LogEntry`.

## [1.1.0] - 2026-04-28
### Added
- **Multi-Agent Flow**: Multi-pass generation logic with Strategist and Analyst collaboration.
- **Stress Testing**: Adversarial simulation of roadmap failure scenarios.
- **Firestore Backend**: Real-time persistence layer for projects and logs.

## [1.0.0] - Initial Release
- Core ATLAS Strategic Matrix functionality.
- Executive prompt-to-roadmap synthesis.
- Glassmorphism UI design.
