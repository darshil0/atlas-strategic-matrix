# ATLAS Strategic Matrix v3.6.3

> **Enterprise-grade strategic roadmap orchestration platform powered by autonomous agent swarms**

ATLAS is a production-ready glassmorphic intelligence dashboard that transforms C-level strategic directives into executable 2026 quarterly roadmaps. Leveraging a multi-agent neural constellation (Strategist, Analyst, Critic), ATLAS synthesizes complex enterprise strategies with real-time risk modeling and GitHub/Jira synchronization.

---

## 🎯 Core Capabilities

### **Neural Agent Constellation**
- **🧠 Strategist Agent**: Decomposes executive goals into hierarchical, topologically-sorted quarterly tasks (Q1-Q4 2026)
- **📊 Analyst Agent**: Computes feasibility scores, identifies resource bottlenecks, and flags critical-path dependencies
- **🔍 Critic Agent**: Performs adversarial stress testing, validates acyclic dependency graphs, and suggests optimizations
- **🏗️ Architect Agent**: Technical design synthesis and infrastructure planning alignment

### **Strategic Synthesis**
- **3-Iteration Refinement Loop**: Critic feedback automatically triggers Strategist re-planning until quality score ≥ 85
- **TaskBank Integration**: 90+ production-ready enterprise objectives across 6 strategic themes (AI, Cyber, ESG, Global, Infra, People)
- **Dependency Modeling**: Full DAG validation with transitive closure analysis and failure cascade simulation

### **Dynamic Visualization**
- **ReactFlow Dependency Graph**: Interactive topology with D3-force simulation, what-if mode, and impact analysis
- **TimelineView**: Quarterly milestone timeline with status indicators and phasing awareness
- **Glassmorphic Dashboard**: Premium frosted-glass UI with real-time status panels and neural activity visualization

### **Enterprise Integration**
- **GitHub Issues Sync**: Bidirectional sync of strategic tasks as GitHub Issues with project board automation
- **Jira Cloud REST API v3**: Epic linking, priority mapping, and quarterly milestone tracking
- **Firestore Persistence**: Real-time multi-user plan synchronization with encryption at rest

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+ (LTS) | **npm** 10+ | **TypeScript** 5.8+
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/gemini-api/docs/api-key))
- **Firebase Project** (Optional: for Firestore persistence)

### Installation

```bash
# Clone repository
git clone https://github.com/darshil0/atlas-strategic-agent.git
cd atlas-strategic-agent

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add:
# VITE_GEMINI_API_KEY=your_gemini_key_here
# VITE_DEBUG_MODE=true (optional)

# Run development server
npm run dev
# 🏛️ Atlas ready at http://localhost:5173
```

### First Mission

1. **Open MissionControl**: Navigate to `http://localhost:5173`
2. **Enter Strategic Directive**: 
   ```
   Design a 2026 AI transformation roadmap for a Fortune 500 financial services firm
   ```
3. **Synthesize Roadmap**: Click "Send"
4. **Review Multi-Pass Generation**: Watch Strategist → Analyst → Critic collaboration
5. **Inspect Dependency Graph**: Switch to "Network" view to see task relationships
6. **Run Stress Test**: Toggle "What-If Mode" and click "Simulate Failure" on a critical task
7. **Export to GitHub/Jira**: Use Settings modal to configure integrations, then sync roadmap

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MissionControl Dashboard                 │
│         (Glassmorphic React 19 + Tailwind CSS v4)           │
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
        │   ADK (Agent Dev Kit)   │
        │  ┌────┬────┬────┐      │
        │  │Str │Anl │Cri│      │
        │  └────┴────┴────┘      │
        │  MissionControl Swarm   │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼──────┐         ┌───────▼──┐
    │ Gemini   │         │Firestore │
    │Flash 1.5 │         │(Real-time)│
    └──────────┘         └──────────┘
        │                     │
    ┌───▼──────┬──────────────▼────┐
    │          │                   │
┌───▼──┐ ┌───▼───┐        ┌──────▼──┐
│GitHub│ │ Jira  │        │Firebase │
│Issues│ │ Cloud │        │Auth     │
└──────┘ └───────┘        └─────────┘
```

### Tech Stack
- **Frontend**: React 19, Vite 6, Tailwind CSS v4, Motion (Framer)
- **Graph Visualization**: ReactFlow + XY Flow, D3.js, Mermaid
- **AI**: Google Gemini Flash 1.5, Search Grounding
- **Database**: Firestore (real-time) + localStorage (offline-first)
- **Testing**: Vitest 2, React Testing Library, 85%+ coverage
- **Deployment**: Cloud Run, GitHub Actions CI/CD

---

## 🎨 Glassmorphic Design System

### Color Palette
- **Primary**: `#3b82f6` (Atlas Blue) + `#6366f1` (Indigo)
- **Surfaces**: Dual-layer glass (`.glass-1`, `.glass-2`) with backdrop blur
- **Accents**: Emerald (success), Amber (warning), Rose (critical)

### Component Library
- **Glass Containers**: 24px blur + 10% white saturation
- **Status Indicators**: Animated pulse rings with glow effects
- **Typography**: "Outfit" (display) + "Inter" (body) + "JetBrains Mono" (monospace)

---

## 🧪 Testing & Quality Assurance

### Run Tests
```bash
# Watch mode
npm test

# Coverage report
npm run test:coverage

# Test UI dashboard
npm run test:ui
```

### Quality Thresholds
- **Lines**: 85%
- **Functions**: 85%
- **Branches**: 85%
- **Statements**: 85%
- **Zero Warning Baseline**: All TypeScript + ESLint checks must pass

### Integration Test Suite
```bash
npm run test -- src/test/smoke.test.ts        # Full stack integration
npm run test -- src/test/integration.test.tsx # ADK + persistence
npm run test -- src/test/App.test.tsx         # UI component tests
```

---

## 📚 Documentation

### For Users
- **Getting Started**: [Quick Start](#quick-start) above
- **Mission Control Guide**: [docs/MISSION_CONTROL.md](./docs/MISSION_CONTROL.md)
- **Roadmap Examples**: [docs/EXAMPLES.md](./docs/EXAMPLES.md)

### For Developers
- **Architecture**: [CONTRIBUTING.md](./CONTRIBUTING.md#project-structure)
- **ADK Development**: [docs/ADK_GUIDE.md](./docs/ADK_GUIDE.md)
- **Type System**: [src/types/index.ts](./src/types/index.ts)
- **Prompting Claude**: [docs/PROMPTING.md](./docs/PROMPTING.md)

### For DevOps
- **Deployment**: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Firebase Setup**: [docs/FIREBASE.md](./docs/FIREBASE.md)
- **CI/CD Pipeline**: [.github/workflows/](./.github/workflows/)

---

## 🔄 Multi-Agent Workflow

### Phase 1: Strategic Decomposition
```
User Input: "2026 Q1-Q4 AI transformation roadmap"
    ↓
[Strategist Agent]
    • Parse executive directive
    • Query TaskBank (90+ objectives)
    • Generate hierarchical task tree
    • Sort topologically (no cycles)
    ↓
Initial Plan: 15-30 tasks across 4 quarters
```

### Phase 2: Feasibility Analysis
```
[Analyst Agent]
    • Compute feasibility score (0-100)
    • Identify resource gaps
    • Flag critical-path bottlenecks
    • Q1 capacity validation (max 12 HIGH priority)
    ↓
Constraints: "Q1 overloaded, defer 3 tasks to Q2"
```

### Phase 3: Adversarial Review
```
[Critic Agent]
    • Validate DAG (no cycles)
    • Stress-test with failure cascades
    • Identify redundant objectives
    • Suggest optimizations
    ↓
Refinement Feedback: Score 78/100 → needs iteration
```

### Phase 4: Iterative Refinement (up to 3 cycles)
```
IF score < 85:
    Strategist re-plans with Critic feedback
    Analyst re-scores feasibility
    Critic re-validates
    Loop
ELSE:
    ✅ Plan Ready for Visualization
```

---

## 🌍 Enterprise Integrations

### GitHub Issues Sync
```typescript
// Export Q1 roadmap to GitHub
const result = await githubService.syncPlan(plan.tasks);
// Creates:
// - Issues tagged with [AI-26-Q1-001] (TaskBank IDs)
// - Q1 2026 milestone
// - "atlas-strategic" label
// - "glassmorphic-roadmap" project assignment
```

### Jira Cloud Integration
```typescript
// Sync to Jira Cloud REST API v3
const result = await jiraService.syncPlan(plan.tasks);
// Creates:
// - Story/Task issues by priority
// - Q1-Q4 Epics
// - Component mapping (AI, Cyber, ESG, etc.)
// - Automatic status transitions
```

### Firestore Real-Time Sync
```typescript
// Multi-user collaborative editing
PersistenceService.savePlan(updatedPlan);
// Automatically:
// - Persists to Firestore
// - Encrypts at rest
// - Syncs to all clients
// - Maintains offline-first capability
```

---

## 🔒 Security

### API Key Management
- ✅ Gemini API key via `VITE_GEMINI_API_KEY` environment variable
- ✅ GitHub token encrypted in localStorage (use backend proxy for production)
- ✅ Jira credentials stored with Base64 obfuscation (not crypto-secure; use Vault in production)
- ✅ Firestore Security Rules enforce user ownership + email verification

### Production Hardening
1. **Use Secret Management Service** (AWS Secrets Manager, HashiCorp Vault)
2. **Enable Firebase Security Rules** (see `firestore.rules`)
3. **Deploy via Cloud Run** with service account isolation
4. **Enable HTTPS only** + CORS restrictions
5. **Implement rate limiting** on API endpoints

---

## 🎯 Roadmap

### Near-term (Q2 2026)
- [ ] Multi-workspace support (separate roadmaps per department)
- [ ] Role-based access control (RBAC) + audit logging
- [ ] Advanced forecasting with Monte Carlo simulations
- [ ] Slack/Teams notifications for milestone updates

### Mid-term (Q3-Q4 2026)
- [ ] Self-healing roadmaps with automated conflict resolution
- [ ] Cross-enterprise dependency mapping (supplier, partner networks)
- [ ] Compliance-aware planning (regulatory deadline tracking)
- [ ] GraphQL API for programmatic access

### Long-term (2027+)
- [ ] Sovereign intelligence clusters for government contracts
- [ ] Multi-modal LLM agents (vision + audio)
- [ ] Quantum-resistant encryption for sensitive plans
- [ ] Full autonomous mission planning (no human input)

---

## 📞 Support & Contributing

### Getting Help
- **GitHub Issues**: [Report bugs or request features](https://github.com/darshil0/atlas-strategic-agent/issues)
- **Discussions**: [Ask questions and discuss ideas](https://github.com/darshil0/atlas-strategic-agent/discussions)
- **Email**: [contact@darshilshah.com](mailto:contact@darshilshah.com)

### Contributing
We welcome contributions from developers of all experience levels! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code of Conduct
- Development Workflow
- Testing Requirements (85% coverage)
- Commit Guidelines (Conventional Commits)
- PR Process

### Code of Conduct
- Be respectful and professional
- Embrace diverse perspectives
- Report harassment to contact@darshilshah.com
- All contributions licensed under MIT

---

## 📄 License

ATLAS Strategic Matrix is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

## 🏆 Acknowledgments

Built with ❤️ by [Darshil Shah](https://github.com/darshil0) and the open-source community.

**Technologies**: React, Vite, Tailwind, Google Gemini, Firebase, Framer Motion, ReactFlow

**Inspired by**: Enterprise strategic planning, multi-agent AI orchestration, glassmorphic design

---

<div align="center">

### 🏛️ ATLAS v3.6.3 — Glassmorphic Precision • Enterprise Scale • 2026 Roadmaps

**[🚀 Get Started](#quick-start)** • **[📚 Documentation](./docs)** • **[🐛 Report Issues](https://github.com/darshil0/atlas-strategic-agent/issues)** • **[⭐ Star on GitHub](https://github.com/darshil0/atlas-strategic-agent)**

</div>
