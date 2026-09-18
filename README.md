# ATLAS Strategic Matrix v3.6.4

Enterprise-grade strategic roadmap orchestration platform powered by autonomous agent swarms.

ATLAS transforms executive strategic directives into executable, topologically sorted quarterly roadmaps for 2026. It utilizes a multi-agent system (Strategist, Analyst, Critic, Architect) to synthesize enterprise goals with real-time risk modeling, dependency validation, and bidirectional GitHub/Jira synchronization.

---

## 🎯 Core Capabilities

* **Multi-Agent Engine:** Orchestrates four specialized asynchronous agents (Strategist, Analyst, Critic, Architect) running a 3-iteration refinement loop until the roadmap feasibility score reaches $\ge 85\%$.
* **Dependency Modeling & Self-Healing:** Validates Directed Acyclic Graphs (DAGs) using transitive closure analysis, simulates failure cascades, and provides autonomous self-healing for circular conflict resolution.
* **Monte Carlo Timeline Forecasting:** Models schedule probability distributions (P50, P75, P90, P99) with stochastic PERT duration simulations and critical path bottleneck detection.
* **Interactive Visualizations:** Renders live topological dependency networks using `@xyflow/react` with D3-force simulations alongside responsive quarterly milestone timelines.
* **Enterprise Governance & Security:** Features RBAC permissions, cryptographically chained immutable system audit logs, multi-workspace isolation per business unit, and sovereign cluster profiles (GDPR, FedRAMP High, DORA).
* **Enterprise Sync:** Features native integrations with Firestore (real-time encrypted state), GitHub Issues API, and Jira Cloud REST API v3 (Epic linking and priority mapping).

---

## 🚀 Quick Start

### Prerequisites

* Node.js 22+ (LTS) | npm 11+ | TypeScript 5.8+
* Google Gemini API Key ([Get API Key](https://ai.google.dev/gemini-api/docs/api-key))
* Firebase Project (Optional for multi-user sync)

### Installation

```bash
# Clone and enter repository
git clone https://github.com/<your-org>/atlas-strategic-matrix.git
cd atlas-strategic-matrix

# Install dependencies and configure environment
npm install
cp .env.example .env

```

Edit your `.env` file to add your credentials:

```env
VITE_GEMINI_API_KEY=your_gemini_key_here

```

```bash
# Start development server
npm run dev

```

The application will be accessible at `http://localhost:5173`.

### Standard Workflow

1. **Input Directive:** MissionControl Dashboard.
Enter an enterprise goal into the prompt interface (e.g., *“Design a 2026 AI transformation roadmap for a Fortune 500 financial services firm”*).


2. **Execute Swarm Refinement:** Multi-Agent Execution.
Trigger generation. The Strategist decomposes the goal, the Analyst checks resource capacity, and the Critic stress-tests the output.


3. **Analyze Topology & Self-Healing:** Network View.
Review the generated task relationships in the interactive graph view, inspect external vendor dependencies, and click **DAG Health** to run autonomous self-healing.


4. **Monte Carlo Timeline Simulation:** Timeline View.
Open the Timeline view and click **Monte Carlo Forecast** to simulate schedule completion probabilities (P50, P75, P90, P99).


5. **Enterprise Governance & Sync:** Settings & Integrations.
Open the Settings modal to switch RBAC roles, inspect immutable audit logs, select discrete business unit workspaces, manage sovereign cluster profiles, or export roadmaps to Jira/GitHub.


---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  MissionControl Dashboard                   │
│          (React 19, Tailwind CSS v4, @xyflow/react)         │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
    ┌───▼──┐    ┌───▼──┐    ┌───▼──┐
    │ Chat │    │Graph │    │Time  │
    │Panel │    │View  │    │line  │
    └──────┘    └──────┘    └──────┘
        │            │            │
        └────────────┼────────────┘
                     │
        ┌────────────▼────────────┐
        │     Agent Dev Kit       │
        │  [Str] [Anl] [Cri] [Arc]│
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
    ┌───▼──────┐         ┌───────▼──┐
    │ Gemini   │         │Firestore │
    │Flash 2.0 │         │(Encrypted)│
    └──────────┘         └──────────┘
        │                     │
    ┌───▼──────┬──────────────▼────┐
┌───▼──┐ ┌───▼───┐        ┌──────▼──┐
│GitHub│ │ Jira  │        │Firebase │
│Issues│ │ Cloud │        │Auth     │
└──────┘ └───────┘        └─────────┘

```

### Technical Stack

* **Frontend core:** React 19, Vite 6, Tailwind CSS v4, `framer-motion`
* **Data Visualization:** `@xyflow/react`, D3.js
* **AI Engine:** Google Gemini 2.0 Flash (with structured output grounding)
* **Storage & Auth:** Firestore (real-time offline-first layer), Firebase Auth
* **Quality Assurance:** Vitest 2, React Testing Library ($\ge 85\%$ test coverage target)

---

## 🧪 Testing & Quality Assurance

All pull requests must pass the zero-warning pipeline baseline (TypeScript, ESLint, and Coverage metrics).

```bash
# Run complete test suite in watch mode
npm test

# Generate coverage metrics
npm run test:coverage

# Execute end-to-end integration tests explicitly
npm run test -- src/test/smoke.test.ts

```

---

## 🔒 Security Architecture

* **API Key Management:** Gemini API keys are injected via server-side environment variables (`VITE_GEMINI_API_KEY`).
* **Integration Tokens:** Third-party OAuth tokens must be managed via an enterprise backend proxy or securely isolated in encrypted browser state. Do not use unencrypted local storage for raw production credentials.
* **Data Isolation & RBAC:** Multi-workspace data separation, role-based access control, and cryptographically hashed audit trails ensure enterprise data security.

---

## 🎯 Platform Roadmap

### 2026 Q2 - Q3

* [x] Role-Based Access Control (RBAC) and immutable system audit logs.
* [x] Multi-workspace data separation for discrete business units.
* [x] Forecasting models powered by Monte Carlo timeline simulations.

### 2026 Q4 - 2027

* [x] Self-healing pipeline state with automated dependency conflict resolution.
* [x] Cross-enterprise dependency mapping tracking external vendor networks.
* [x] Sovereign infrastructure cluster profiles for strict compliance deployments.

---

## 📄 License & Support

ATLAS Strategic Matrix is open-source software licensed under the [MIT License](LICENSE).

* **Technical Issues:** File reports on the [GitHub Issue Tracker](https://github.com/darshil0/atlas-strategic-agent/issues).
* **Contributions:** Review [CONTRIBUTING.md](CONTRIBUTING.md) for style guides, testing rules, and the Zero Warning Baseline.
