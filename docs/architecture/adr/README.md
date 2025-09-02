# Architectural Decision Records (ADRs)

This directory contains Architectural Decision Records (ADRs) for the Secure Flow Automaton project. ADRs document significant architectural decisions, the context behind them, and their consequences.

## What are ADRs?

Architectural Decision Records are short text documents that capture a single architecture decision. They help teams understand:

- **Why** a particular decision was made
- **What** the decision was
- **When** it was made
- **Who** made it
- **What alternatives** were considered
- **What consequences** resulted

## ADR Format

Each ADR follows this structure:

```markdown
# [ADR-XXX] Brief title of the decision

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

## Alternatives Considered
What other options did we consider and why did we reject them?

## Implementation Notes
Any notes about how this decision was implemented.

## References
Links to relevant documentation, discussions, or resources.
```

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](0001-typescript-as-primary-language.md) | TypeScript as Primary Language | Accepted | 2024-01-15 |
| [ADR-002](0002-modular-architecture.md) | Modular Architecture with Apps Directory | Accepted | 2024-01-15 |
| [ADR-003](0003-ci-cd-workflow-consolidation.md) | CI/CD Workflow Consolidation | Accepted | 2024-01-15 |
| [ADR-004](0004-monitoring-stack-choice.md) | Monitoring Stack: Prometheus + Grafana | Accepted | 2024-01-15 |
| [ADR-005](0005-security-scanning-integration.md) | Security Scanning Integration Strategy | Accepted | 2024-01-15 |
| [ADR-006](0006-database-technology-choice.md) | PostgreSQL as Primary Database | Accepted | 2024-01-15 |

## When to Create an ADR

Create an ADR when you make a decision that:

- Affects the overall architecture of the system
- Has significant impact on development workflow
- Changes how teams interact with the codebase
- Introduces new technologies or frameworks
- Changes deployment or infrastructure patterns
- Affects security, performance, or scalability

## How to Create an ADR

1. **Identify the decision** that needs to be documented
2. **Create a new file** with the next sequential number (e.g., `0007-decision-name.md`)
3. **Fill out the template** with all relevant information
4. **Submit a pull request** for review
5. **Update this index** to include the new ADR

## ADR Lifecycle

- **Proposed**: Decision is under discussion
- **Accepted**: Decision has been approved and implemented
- **Deprecated**: Decision is no longer recommended
- **Superseded**: Decision has been replaced by a newer ADR

## Contributing

When contributing to ADRs:

- Keep them concise and focused on a single decision
- Include enough context for future developers to understand the decision
- Document both the decision and the alternatives considered
- Update the status when the decision is implemented or changed
- Link to relevant discussions, issues, or pull requests

## References

- [ADR GitHub Template](https://github.com/joelparkerhenderson/architecture_decision_record)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR Tools and Templates](https://adr.github.io/)
