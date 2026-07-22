# Decisions

- 2026-07-22: Use a dependency-free TypeScript foundation because npm registry access returned 403 for package installation. This avoids blocking Phase 01 while preserving strict typecheck, build, lint, and node:test validation.
