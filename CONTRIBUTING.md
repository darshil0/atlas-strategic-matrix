# 🤝 Contributing to Atlas Strategic Agent

Thank you for your interest in contributing to Atlas! We welcome contributions from developers of all experience levels and backgrounds.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Project Structure](#project-structure)
- [Recognition](#recognition)
- [Getting Help](#getting-help)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background or experience level. We expect all participants to treat each other with respect and professionalism.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community and project
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discriminatory comments, or personal attacks
- Trolling, insulting comments, or deliberate disruption
- Publishing others' private information without permission
- Any conduct that could reasonably be considered inappropriate

### Enforcement

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, issues, and other contributions that are not aligned with this Code of Conduct. Instances of unacceptable behavior may be reported by contacting the project team at [contact@darshilshah.com](mailto:contact@darshilshah.com). All complaints will be reviewed and investigated promptly and fairly.

---

## Getting Started

### Prerequisites

Before you begin contributing, ensure you have the following installed:

- **Node.js** 20 or higher (LTS recommended)
- **npm** 10 or higher, or **yarn** 1.22 or higher
- **Git** 2.40 or higher
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/gemini-api/docs/api-key))

### Fork and Clone

1. Fork the repository on GitHub by clicking the **Fork** button at the top right of the repository page.
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/atlas-strategic-agent.git
cd atlas-strategic-agent
```

3. Add the upstream repository as a remote:

```bash
git remote add upstream https://github.com/darshil0/atlas-strategic-agent.git
```

4. Install dependencies:

```bash
npm install
```

5. Set up environment variables:

```bash
cp .env.example .env
# Edit .env and add your VITE_GEMINI_API_KEY
```

6. Verify the setup by running the development server and tests:

```bash
npm run dev
npm test
```

If everything is set up correctly, the development server should start on `http://localhost:5173`, and all tests should pass.

---

## Development Workflow

### Branch Strategy

We use a straightforward branching model:

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test improvements

### Creating a Feature Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create your feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in your feature branch.
2. Write or update tests as needed.
3. Ensure all tests pass: `npm test`.
4. Run linting: `npm run lint`.
5. Format code: `npm run format`.
6. Check TypeScript: `npm run type-check`.

### Keeping Your Branch Updated

```bash
# Regularly sync with upstream
git fetch upstream
git rebase upstream/main
```

If you encounter conflicts during the rebase, resolve them carefully and continue with `git rebase --continue`.

---

## Coding Standards

### TypeScript

- Use **strict mode**.
- Prefer interfaces over types for object shapes.
- Use explicit return types for functions.
- Avoid `any`; use `unknown` if the type is truly unknown.
- Use const assertions where appropriate.

**Example:**

```typescript
interface TaskProps {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
}

function createTask(props: TaskProps): Task {
  return task;
}
```

**Avoid:**

```typescript
function createTask(props: any) {
  // Implementation
}
```

### React Components

- Use functional components with hooks.
- Extract custom hooks for reusable logic.
- Keep components small and focused.
- Use proper prop typing with interfaces.
- Implement proper error boundaries where appropriate.

### CSS and Styling

- Use Tailwind utility classes for styling.
- Follow the existing glassmorphic design system.
- Ensure responsive design with a mobile-first approach.
- Maintain WCAG AA contrast ratios.
- Use semantic HTML elements such as `<nav>`, `<main>`, and `<article>`.

### Code Organization

- One component per file.
- Group related functionality together.
- Use barrel exports (`index.ts`) for clean imports.
- Keep functions pure where possible.
- Separate business logic from UI logic.

---

## Testing Requirements

### Coverage Requirements

All contributions must maintain or improve the 85% coverage threshold across all metrics:

- **Lines**: 85%
- **Functions**: 85%
- **Branches**: 85%
- **Statements**: 85%

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Open test UI
npm run test:ui
```

### Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('renders task title', () => {
    const task = { id: '1', title: 'Test Task', priority: 'high' as const };
    render(<TaskCard task={task} onUpdate={vi.fn()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onUpdate when edited', () => {
    const onUpdate = vi.fn();
    const task = { id: '1', title: 'Test Task', priority: 'high' as const };
    render(<TaskCard task={task} onUpdate={onUpdate} />);
  });
});
```

### Testing Best Practices

- Test user behavior, not implementation details.
- Use meaningful test descriptions.
- Keep tests focused and isolated.
- Mock external dependencies appropriately.
- Test error cases and edge cases thoroughly.

---

## Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring without changing functionality
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Examples

```bash
feat(agent): add monte carlo risk simulation

Implements probability distribution modeling for timeline predictions.
Includes new MonteCarlo service with statistical analysis.

Closes #123
```

```bash
fix(ui): resolve race condition in dependency graph

The XYFlow component was causing crashes when tasks were updated rapidly.
Added debouncing and proper cleanup in useEffect.

Fixes #456
```

```bash
docs(readme): update installation instructions
```

### Commit Best Practices

- Use present tense.
- Use imperative mood.
- Limit the first line to 72 characters or less.
- Reference issues and pull requests when relevant.
- Keep commits atomic and focused on one change.

---

## Pull Request Process

### Before Submitting

Ensure your PR meets these requirements:

- [ ] Code follows project style guidelines
- [ ] Tests pass locally (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Coverage meets 85% threshold
- [ ] Documentation is updated if applicable
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with `main`

### Submitting a Pull Request

1. Push your branch to your fork:

```bash
git push origin feature/your-feature-name
```

2. Go to the repository on GitHub and click **New Pull Request**.

3. Fill out the PR description with:
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes
   - Testing performed
   - Breaking changes, if any

4. Wait for maintainer review, typically within 48 hours.

### PR Template

When creating a PR, please use this template:

```markdown
## Description
Brief description of what this PR does.

## Related Issues
Closes #123
Relates to #456

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added or updated
- [ ] Integration tests added or updated
- [ ] Manual testing performed

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix or feature works
- [ ] New and existing tests pass locally
- [ ] Coverage threshold is maintained
```

### Review Process

- Maintainers will review your PR within 48 hours.
- Address feedback by pushing updates to your branch.
- Once approved, a maintainer will merge your PR.
- Your contribution will be included in the next release.

---

## Issue Guidelines

### Before Creating an Issue

- Search existing issues to avoid duplicates.
- Check if the issue is already fixed in the `main` branch.
- Gather relevant information such as browser version, OS, and package versions.

### Asking Questions

If you have a question about using Atlas, please check the following resources first:

- Read the [README.md](README.md) and available documentation.
- Search existing issues for similar questions.
- Search the internet for answers.

If you still need clarification after checking these resources, feel free to open an issue with the relevant context and platform details.

### Bug Reports

Use the bug report template and include:

- Clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or error messages, if applicable
- Environment details

### Feature Requests

Use the feature request template and include:

- Clear description of the feature
- Use case and benefits
- Proposed implementation, if desired
- Mockups or examples, if helpful

### Issue Labels

Once filed, the project team will label issues accordingly:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `needs-repro` - Bug reports that need reproduction steps
- `needs-fix` - Confirmed bugs ready to be fixed

---

## Project Structure

Understanding the project structure will help you navigate the codebase:

```text
atlas-strategic-agent/
├── src/
│   ├── components/
│   ├── config/
│   ├── data/
│   ├── lib/
│   │   └── adk/
│   ├── services/
│   ├── types/
│   └── test/
├── docs/
├── public/
└── [config files]
```

---

## Recognition

All contributors will be recognized in the project README, release notes, and GitHub contributor graph.

We especially welcome first-time contributors. Look for issues labeled `good first issue` or `help wanted`.

---

## Getting Help

### Communication Channels

- **GitHub Discussions** - [Ask questions and discuss ideas](https://github.com/darshil0/atlas-strategic-agent/discussions)
- **GitHub Issues** - [Report bugs or request features](https://github.com/darshil0/atlas-strategic-agent/issues)
- **Email** - [contact@darshilshah.com](mailto:contact@darshilshah.com)

### Maintainers

- **Darshil Shah** ([@darshil0](https://github.com/darshil0)) - Project Lead & Architecture

### Response Times

We strive to respond to:

- **Pull requests**: Within 48 hours
- **Issues**: Within 72 hours
- **Questions**: Within 1 week

Please be patient as we maintain this project in our free time.

---

## License

By contributing to Atlas Strategic Agent, you agree that your contributions will be licensed under the same license as the project (MIT License).

<div align="center">

**Thank you for contributing to Atlas Strategic Agent!**

*Building the future of strategic planning together*

</div>
