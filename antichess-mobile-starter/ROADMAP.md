# Build roadmap and acceptance criteria

## Milestone 0 — Project bootstrap (this package)
- [x] Expo/React Native TypeScript starting files
- [x] Mobile navigation between catalog, course, lesson placeholder, membership preview
- [x] Price/product/entitlement specifications
- [ ] Dependency install, TypeScript check, on-device smoke test

## Milestone 1 — Real antichess drilling engine (highest priority)
- [ ] Integrate verified chessops Antichess variant or comparable variant-legal engine
- [ ] Real 64-square touch chessboard, selectable legal destinations, promotion chooser
- [ ] Test mandatory capture, king capture, no castling, pawn promotions, terminal conditions, non-standard FEN
- [ ] Deterministic opponent replay; prevent free-move drift from authored variation
- [ ] Learn, Practice, Drill modes; illegal-vs-wrong-legal behavior; retry and progress states
- [ ] Unit tests for hundreds of imported legal plies and antichess regression positions

## Milestone 2 — Lichess PGN courses
- [ ] Import PGN via file picker/paste, parse multi-game Lichess study export
- [ ] Preserve chapter order and metadata, variations, comments, annotations, starting FEN
- [ ] Reject invalid antichess lines; show actionable import warnings
- [ ] Stable chapter IDs; safe update/re-import and progress preservation
- [ ] Import genuine Wizard Opening study as first fixture (user-provided PGN)

## Milestone 3 — Offline practice and progression
- [ ] Persistent local storage; relaunch/offline tests
- [ ] Unlock foundations before deeper lines
- [ ] Spaced repetition scheduler / mastery criteria
- [ ] Course metrics; accessible, touch-friendly mobile layout

## Milestone 4 — Commercial subscriptions
- [ ] Apple and Google subscription products with localized $5 USD base price
- [ ] RevenueCat entitlement `pro` and offering mapped to both products
- [ ] Purchase, restore purchases, lifecycle refresh, cancellations, expiration, refunds
- [ ] Entitlement-aware access after offline periods; no permanent local-only bypass
- [ ] Terms, privacy policy, manage subscription, accurate billing disclosures
- [ ] Sandbox purchases on real devices, app review compliance

## Milestone 5 — Release
- [ ] Store listing, support, privacy disclosures, accessibility testing
- [ ] Analytics without sensitive chess/user data leakage
- [ ] EAS production builds, beta testing, App Store and Google Play review

## Immediate instruction to Codex
1. Install dependencies, correct any version mismatches, run `npm run check`.
2. Implement Milestone 1 with authentic Antichess legality; preserve source types.
3. Introduce tests before implementing PGN parsing. Do **not** activate live payments yet.
