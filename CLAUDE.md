# CLAUDE.md

This file provides guidance for AI assistants (Claude Code and similar tools) working in this repository.

> **Note:** This repository is currently in its initial state with no source code committed. This document establishes conventions and workflows to be followed as the project is built out. Update this file as the codebase evolves.

---

## Repository Overview

- **Repository:** `shujiishimizu-a11y/Q`
- **Focus:** Accessibility (a11y) — the `a11y` namespace in the GitHub org suggests a project with web accessibility considerations at its core.
- **State:** Newly initialized — no source code, dependencies, or configuration files have been committed yet.

---

## Git Workflow

### Branch Conventions

- **Main branch:** `main` (or `master` — confirm once the first commit is made)
- **Feature branches:** `feature/<short-description>`
- **Bug fix branches:** `fix/<short-description>`
- **AI-generated branches:** `claude/<short-description>-<suffix>` (e.g., `claude/add-claude-documentation-TVMov`)

### Commit Messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short summary>

[optional body]
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`

Examples:
- `feat(auth): add login form with ARIA labels`
- `fix(nav): correct focus trap in modal dialog`
- `docs: add CLAUDE.md with project conventions`

### Push Protocol

Always push with tracking:
```bash
git push -u origin <branch-name>
```

On network failure, retry with exponential backoff: 2s → 4s → 8s → 16s.

---

## Development Workflow

> These sections will be updated once the project stack is defined. Common setups are described below as starting points.

### Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd Q

# Install dependencies (update command based on chosen stack)
# Node.js:   npm install  /  yarn  /  pnpm install
# Python:    pip install -r requirements.txt
# Go:        go mod download
```

### Running the Development Server

```bash
# (Update once a framework/toolchain is chosen)
npm run dev      # Node.js/Next.js/Vite
python main.py   # Python
go run .         # Go
```

### Running Tests

```bash
# (Update once a test framework is chosen)
npm test         # Jest / Vitest / Playwright
pytest           # Python
go test ./...    # Go
```

### Building for Production

```bash
# (Update once build tooling is configured)
npm run build
```

---

## Code Conventions

### General

- Prefer clarity over cleverness.
- Keep functions small and single-purpose.
- Avoid unnecessary abstractions — three similar lines of code is better than a premature abstraction.
- Do not add speculative features, unused parameters, or forward-compatibility shims.
- Only add comments where the logic is not self-evident.

### Accessibility (a11y) — Core Focus

Given the `a11y` org name, accessibility is a first-class concern:

- All interactive elements must be keyboard-navigable.
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, etc.).
- Every image must have meaningful `alt` text (or `alt=""` for decorative images).
- Color contrast must meet WCAG 2.1 AA minimum (4.5:1 for normal text, 3:1 for large text).
- ARIA roles and attributes should supplement — not replace — semantic HTML.
- Focus management: modals and drawers must implement a focus trap; restore focus on close.
- Test with screen readers (NVDA, VoiceOver, JAWS) and keyboard-only navigation.
- Run automated a11y checks with tools such as `axe-core`, `eslint-plugin-jsx-a11y`, or `pa11y`.

### Security

- Never commit secrets, API keys, or credentials. Use `.env` files (excluded via `.gitignore`).
- Validate all user input at system boundaries.
- Avoid `eval`, `dangerouslySetInnerHTML` (React), `innerHTML` assignments, or similar injection vectors.
- Keep dependencies up to date; address known vulnerabilities promptly.

---

## AI Assistant Guidelines

### What Claude Should Do

- Read files before editing them.
- Prefer editing existing files over creating new ones.
- Match the style and conventions of surrounding code.
- Only change what is needed to satisfy the task — do not refactor unrelated code.
- Run tests after making changes (once a test setup exists).
- Commit changes with a descriptive message following the Conventional Commits format above.
- Push to the designated feature branch, not to `main`.

### What Claude Should Not Do

- Do not push directly to `main`/`master` without explicit user permission.
- Do not introduce dependencies without confirming with the user.
- Do not add docstrings, type annotations, or comments to code that was not changed.
- Do not create `README.md` or documentation files unless explicitly requested.
- Do not guess at URLs or external endpoints.
- Do not batch changes across unrelated concerns into a single commit.

### Asking for Clarification

Use `AskUserQuestion` when:
- A task is ambiguous and the wrong interpretation would cause significant rework.
- A destructive or irreversible action is required (e.g., deleting files or force-pushing).
- External credentials or access are needed.

---

## File Structure (Placeholder)

Update this section once the project structure is established. A typical structure might look like:

```
Q/
├── src/                  # Application source code
│   ├── components/       # UI components
│   ├── pages/            # Route-level views (if applicable)
│   └── utils/            # Shared utilities
├── tests/                # Test files
├── public/               # Static assets
├── .env.example          # Environment variable template
├── .gitignore
├── CLAUDE.md             # This file
└── README.md             # Human-facing project documentation
```

---

## Updating This File

When significant project decisions are made (stack selection, test framework, CI/CD setup, deployment target), update the relevant sections of this document. Keeping CLAUDE.md accurate ensures AI assistants have reliable context and produce consistent, high-quality contributions.
