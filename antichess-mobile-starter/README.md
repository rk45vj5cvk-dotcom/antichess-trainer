# Antichess Trainer — Mobile App Starter (0.1.0)

**Purpose:** Commercial iOS/Android antichess repertoire trainer, planned **$5/month auto-renewing subscription**.

This is a real Expo/React Native **project scaffold with navigable screens**, not yet a functioning chess trainer or payment-enabled app. It is intended as the first commit for Codex. The current board is an explicitly labeled placeholder. No imported course can yet be drilled; no payment is processed.

## Product rules (do not substitute standard chess)

- One **Lichess Antichess study** = one course.
- One **ordered PGN chapter** = one drillable line. Usually 15–40 lines/course, from 2–3-move fundamentals to longer branches.
- Preserve author's chapter order, main lines, comments, variations, and optional nonstandard starting FEN. Main lines are drilled; variations are reference metadata.
- Learn → Practice → Drill, **no separate quizzes**. Opponent's moves replay deterministically from the course.
- Wrong **legal** user move: give feedback and retry; illegal move: don't execute. Avoid disclosing future moves during assessed drills.
- Preserve line progress with stable identifiers across study updates. Local-first/offline progress.
- Antichess rules: **captures mandatory**, kings are capturable, no castling, variant promotion/move legality, and antichess win conditions. Standard chess move validators are not acceptable.
- Subscription price target: **$5 USD/month**, not yet a live product. Provide a useful free introductory course and a **Pro** entitlement. Do not gate on a local boolean in production.

## Stack
- Expo / React Native / TypeScript.
- GitHub + Codex Web as initial coding workflow; no local Python required.
- Proposed rules library: `chessops` (offers an Antichess variant). Verify integration on React Native and thoroughly test variant-specific behavior.
- Proposed in-app purchases: RevenueCat `react-native-purchases`; configure StoreKit and Google Play Billing products, entitlement ID `pro`, product ID `antichess_pro_monthly` in vendor consoles before real billing.
- Proposed offline storage: Expo SQLite or a suitable local database, with versioned schema and import migrations.

## Files
- `App.tsx`: navigable mobile-first catalog, course chapter list, explicitly incomplete board, subscription-preview screen.
- `src/models.ts`: course / line / progress / product constants.
- `src/sampleData.ts`: placeholder course metadata **not a validated training study**.
- `eas.json`: development, preview, production cloud build profiles.
- `ROADMAP.md`: staged acceptance tests and commercial work.

## Run (in Codex cloud or a local Node environment)

```
npm install
npx expo start
```

For cloud builds, configure an Expo account and run `eas build` in an environment with Expo CLI/EAS CLI and project credentials. You can make EAS builds without Xcode or Android Studio locally. Live in-app purchases require **development builds**, vendor sandbox accounts, and store configuration; Expo Go preview is not a live purchase test.

## Warning
Package versions should be resolved and checked against the current Expo SDK using `npx expo install --check` / `npx expo install --fix`. This scaffold has not been dependency-installed or run in this environment; do not claim it is a tested build.
