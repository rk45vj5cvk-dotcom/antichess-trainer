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
- Polish Defense — Introduction: 11 chapters training Black after
  1. e3 c5 2. Ba6 Nxa6, covering White's b4, d4, Qh5, Qf3, and Qg4.
  Each branch has a first-response checkpoint and its available book continuation.
  Nilatac's top-ranked replies were used; scores are search heuristics, not
  proof of optimality or a forced win. No continuation is invented beyond the
  available book. Data, attribution, CC BY-SA 3.0 license, and caveats are in
  antichess-mobile-starter/studies/polish/.
- Black lessons automatically supply White's initial move; selecting another
  module restores its intended training color (White by default).
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
- User plans to review and shorten Wizard commentary. Polish Defense is an
  introductory first version to review before expanding to more White branches.
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
- Rebuild Polish with node scripts/build-polish.mjs. It checks saved database
  selections and all 96 replayed plies. Run node scripts/check-training-flow.mjs
  for a headless smoke check of Black auto-start/replies, wrong-move retry,
  Learn restart, and unchanged White starting behavior. Native views/audio are
  mocked in that check; test the presentation on an actual phone separately.
- Read CODEX_START_HERE.md for authoring rules. The local app.config.js override
  removes the unsupported expo-status-bar config plugin; retain it.
- Latest feature commit before this handoff: 07d1e4c.

## Latest stopping point — Polish Defense review

- Polish Defense — Introduction is complete and pushed on the same branch:
  11 chapters, 96 legal replayed plies, training Black from the initial board.
- Lesson comments were shortened: no Nilatac references, database-ranking
  boilerplate, or general antichess rule reminders in instructional comments.
- Required source credit and license links appear only in chapter 1's comment
  box. PGN source/annotator/license headers are only in the first chapter too.
- User considers this a good introductory course but wants selected branches
  to go deeper. Discussed separate Introduction and Mastery courses, inspired
  by Chessreps. No mastery course or course-tier UI has been implemented.
- User was given the editable PGN on GitHub:
  antichess-mobile-starter/studies/polish/polish-training.pgn
  They can import all 11 chapters into Lichess, edit comments, then upload the
  full exported study here. Lichess changes do not automatically sync.
- Next step: wait for the user's edited PGN or specific deeper branches. Preserve
  their future comment edits; the current build-polish.mjs regenerates comments
  from templates, so do not blindly regenerate over an edited module.
- Latest feature commit at this stopping point: df584bd. TypeScript and move
  validation passed after attribution changes; headless Black training-flow and
  iOS bundling passed when the Polish module was introduced.
