You are implementing a mobile-first antichess opening trainer intended for commercial App Store and Google Play release. Read README.md and ROADMAP.md. This repository is an Expo React Native TypeScript scaffold, NOT a completed trainer. The user authors training courses in Lichess Antichess studies: each chapter is one ordered drill line; one study forms a course; 15–40 increasingly deep lines per course. The central user experience is memorizing long antichess opening lines by repeated drilling, not quizzes. Build variant-correct antichess using chessops Antichess or another verified rules engine, import/validate Lichess PGN, and implement deterministic opponent replies and progressive mastery. The eventual business model is $5 USD/month with a free sample and paid full catalog; prepare RevenueCat architecture but do not connect live payments without store credentials. Prefer clear testable increments; first install dependencies, fix compilation issues, then implement and test the rules engine and board. Keep cloud-first workflow so the user needs no local Python, Xcode, or Android Studio.

## Opening module authoring

Every training chapter must replay from the standard initial Antichess position,
including advanced branches and progressive checkpoints. Repetition of the full
opening is the purpose of the app. Reconstruct and validate the opening prefix
when a source study chapter starts from a midgame FEN. Do not use quiz chapters
from the Wizard study. This module trains White.

The Wizard source is preserved in studies/wizard-source.pgn. Rebuild the adapted
module with node scripts/build-wizard.mjs; review studies/WIZARD_CHAPTERS.md for
chapter order and provenance. Only source main lines are used for drills; source
side variations can contain mistakes. Do not invent unsupplied continuations.
