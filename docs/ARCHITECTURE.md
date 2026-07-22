# Architecture

FairwayServe currently uses a dependency-free TypeScript static shell. Core product rules live under `src/core`, browser rendering lives in `src/main.ts` and `src/styles.ts`, and executable tests live in `tests`. Future phases must add a database-backed service boundary, authorization middleware, external-service adapters, realtime order updates, and production deployment layers without replacing verified core rules unnecessarily.
