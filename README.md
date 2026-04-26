# 🌌 Atlas Strategic Agent v3.6.1

![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-4.2-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite)
![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18?style=for-the-badge&logo=vitest)

### *Executive Vision → Executable Enterprise Roadmaps*

**Atlas** is a production-ready multi-agent AI orchestrator that transforms high-level strategic directives into actionable 2026 quarterly roadmaps. Powered by **Google Gemini 2.0 Flash**, it features a collaborative "Mission Control" architecture with native GitHub Issues and Jira Cloud synchronization.

---

## 🎯 What Makes Atlas Different?

- **Multi-Agent Synthesis** - specialized Strategist, Analyst, and Critic agents collaborate in a real-time synthesis pipeline.
- **A2UI Protocol v1.1** - A high-performance protocol for streaming glassmorphic UI components directly from LLM reasoning.
- **What-If Simulations** - Advanced failure cascade modeling to visualize risk propagation and critical path bottlenecks.
- **Enterprise-Ready** - Seamless bidirectional synchronization with GitHub Issues API v3 and Jira Cloud REST API.
- **Premium UX** - A state-of-the-art glassmorphic interface built with React 19, Framer Motion 12, and Tailwind CSS 4.2.

---

## 🏗️ Architecture & Multi-Agent Engine

Atlas implements a collaborative synthesis pipeline where specialized agents work together to ensure plan quality and technical feasibility.

```mermaid
graph TD
    A[Executive Directive] --> B[MissionControl Orchestrator]
    B --> C{Agent Synthesis}
    C --> C1["🧠 Strategist (Decomposition)"]
    C --> C2["📊 Analyst (Feasibility)"]
    C --> C3["🔍 Critic (Validation)"]
    C1 & C2 & C3 --> D["🚀 A2UI Protocol v1.1"]
    D --> E["🎨 Glassmorphic Dashboard"]
    E --> F{Sync & Export}
    F --> F1[GitHub Issues]
    F --> F2[Jira Cloud]
    F --> F3[Mermaid/JSON]
```

### Specialized Personas
| Agent | Role | Output |
|-------|------|--------|
| **🎙️ The Strategist** | Decomposes "North Star" goals into Q1-Q4 2026 workstreams | Strategic milestones with dependencies |
| **🔬 The Analyst** | Performs feasibility scoring and TASK_BANK alignment | Risk assessments and capacity analysis |
| **⚖️ The Critic** | Stress-tests roadmaps for acyclic graph validation | DAG optimization and quality scores |

> [!IMPORTANT]
> **Zero Warning Baseline**: v3.6.1 strictly enforces a zero-warning policy across TypeScript, ESLint, and Vitest, ensuring enterprise-grade stability.

---

## ✨ Key Capabilities

| Feature | Description | Stack |
|---------|-------------|-------|
| **A2UI Protocol** | Real-time streaming of UI from LLM responses | React 19 + Framer Motion |
| **What-If Engine** | Failure cascade modeling with risk scoring | Custom DAG analysis |
| **Enterprise Sync** | Native GitHub & Jira integration with ADF support | REST API v3 |
| **Glassmorphic UI** | Premium backdrop-blur design system | Tailwind 4.2 |
| **Persistence** | Mutex-guarded encrypted localStorage | Custom persistence layer |
| **TaskBank** | 90+ pre-calculated 2026 strategic objectives | AI, Cyber, ESG, etc. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **Google Gemini API Key** ([Get your key](https://ai.google.dev/gemini-api/docs/api-key))

### Quick Start
```bash
# 1. Clone & Install
git clone https://github.com/darshil0/atlas-strategic-agent.git
cd atlas-strategic-agent
npm install

# 2. Environment Setup
cp .env.example .env
# Add your VITE_GEMINI_API_KEY to .env

# 3. Launch
npm run dev
```

The application will launch at `http://localhost:3000`.

---

## 🧪 Development Workflow

### Available Scripts
```bash
npm run dev              # Start dev server
npm run build            # Production build with type checking
npm run preview          # Preview production build
npm run lint             # ESLint Zero Warning check
npm run type-check       # Strict TypeScript check
npm test                 # Run Vitest suite
npm run coverage         # Coverage report (85% threshold)
```

---

## 📂 Project Structure

```
src/
├── components/          # UI Components (ui/, views/, cards/, core/)
├── lib/adk/             # Agent Development Kit (Core)
├── services/            # Layered services (ai/, core/, integrations/)
├── config/              # System & Environment Configuration
├── data/                # Static Strategic Data (TaskBank)
├── types/               # Strict TypeScript Definitions
├── styles/              # Global Tailwind CSS-first Styles
└── test/                # Integration, Smoke & Unit Tests
```

---

## 🎨 Design System

Atlas features a custom glassmorphic theme designed for high-density strategic data:
- **Glass-1/2**: Backdrop-blur surfaces with dynamic lighting.
- **Typography**: Inter (UI), JetBrains Mono (Technical), Outfit (Display).
- **Theming**: Dark-first palette with `atlas-blue` accents.

---

## 🗺️ Roadmap

### Current Version (v3.6.1) ✅
- **Type Safety Audit**: 100% strict compliance across all core modules.
- **Memory Management**: Automated agent disposal in `AgentFactory`.
- **Persistence Layer**: Mutex-guarded `writeQueue` for data integrity.
- **Error Surface**: Detailed error extraction and UI reporting.
- **Sync Enhancements**: Full GitHub Issue linking and Jira Epic mapping.

### Planned 🚀
- **V4.0.0**: Monte Carlo risk modeling with probability distributions.
- **V4.1.0**: Real-time collaborative synthesis via WebSockets.
- **V4.2.0**: Intelligent resource optimizer for headcount/budget.

---

## 📚 Documentation
- **[AGENTS.md](./AGENTS.md)** - Multi-agent ADK reference.
- **[CHANGELOG.md](./CHANGELOG.md)** - Full version history.
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines.
- **[Technical Deep Dive](./docs/technical-deep-dive.md)** - Engineering insights.

---

## 📄 License
MIT License - See [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with ❤️ by [Darshil Shah](https://github.com/darshil0)**

*Transforming executive vision into executable reality*

[Report Bug](https://github.com/darshil0/atlas-strategic-agent/issues) · [Request Feature](https://github.com/darshil0/atlas-strategic-agent/issues)

</div>
