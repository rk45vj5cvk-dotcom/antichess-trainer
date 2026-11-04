# Antichess Trainer — resume here

Active branch: `add-sounds-modern-defense`
Repository: `https://github.com/rk45vj5cvk-dotcom/antichess-trainer`
App directory: `antichess-mobile-starter`

## Completed

- User-supplied Move.wav and capture.wav play on regular moves and captures,
  including en passant. Sounds respect mute and work in iPhone silent mode.
- Chapter completion has a short click, a green rectangle around Next line,
  and commentary ending with “Click Next Line.”
- Modern Defense: five chapters from the uploaded PGN.
- Wizard Opening: 38 progressive chapters, training White, adapted from study
  f3NuTHGo. Every chapter replays from the initial position. Quiz chapters are
  excluded. Former chapter 5 was removed as unnecessary clean-up; later chapters
  were renumbered. Original source and adapted PGN are in studies/.
- Wrong moves show a red × on the attempted destination and a Try again button
  in the comment box. The board remains unchanged.
- Selected squares are highlighted; translucent gray dots show Antichess-legal
  destinations. Latest move source and destination have pale yellow overlays.
- Home returns directly to module selection.
- Module cards show small opening subtitles: e3 b5, e3 e6, c4 d5. Subtitles are
  derived from the first chapter’s first two SAN moves for future modules too.

## User preferences and next work

- App purpose: repeatedly drill complete openings from the initial position.
  Never start advanced training chapters from a midgame position.
- Stop training before obvious forced-win clean-up, where several simple human
  finishes exist. Do not require memorizing arbitrary finishing sequences.
- User plans to review and shorten Wizard commentary. No further edits requested
  at the time of this handoff; wait for their next instruction.
- The user previews on their Mac and iPhone using Expo Go. Localhost links from
  the cloud environment cannot be used as public previews. File downloads from
  this chat failed; GitHub branch updates have worked.
- Keep updates on the existing branch unless directed otherwise. Do not publish
  environment settings or merge into main without authorization.

## Mac resume

From the existing antichess-mobile-starter directory, stop Expo with Control+C
if running, then run:

    git pull --ff-only
    npx expo start --tunnel

The Mac should be on add-sounds-modern-defense. If not, fetch and switch to that
branch. Scan the QR code with the iPhone Camera to open Expo Go. Cloud and Mac
filesystems are separate; the user must pull to update the Mac.

## Verification and authoring

- npm run check passed after the latest UI change.
- iOS export passed after the Wizard module and board-feedback changes.
  Home and opening subtitles were checked with TypeScript.
- On-device rendering and audio require the user’s iPhone check; do not describe
  compilation/bundling as a device test.
- Rebuild Wizard with node scripts/build-wizard.mjs; it validates replay legality.
  See studies/WIZARD_CHAPTERS.md for lesson order and source provenance.
- Read CODEX_START_HERE.md for authoring rules. The local app.config.js override
  removes the unsupported expo-status-bar config plugin; retain it.
- Latest feature commit before this handoff: 07d1e4c.
