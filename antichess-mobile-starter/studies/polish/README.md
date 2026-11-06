# Defeating the Polish Defense

The user revised this module to train **White**, not Black. The repertoire is:

    1. e3 c5 2. Ba6 Nxa6 3. b4 cxb4 4. d3

The active module has three progressive checkpoints, each replayed from the
standard initial position: reach the Polish position, draw the c-pawn to b4,
then play the key move 4. d3. All 17 replayed plies are checked for legality.

This is the foundation for a revised course, not a completed repertoire after
4. d3. The user identifies d3 as the critical improvement. Current analysis or
an authored PGN is still needed to choose White's replies against Black's
subsequent defenses. Do not treat legacy book rankings as proof of optimality.

## Archived Black introduction

The superseded 11-chapter Black introduction is retained in
archived-black-introduction.pgn for recovery and a Black training regression
fixture. It is not registered as an active course. database-snapshot.json is
historical evidence, not the selector for the current White course.

The Nilatac author notes that the book was not fully rebuilt after the move
from FICS stalemate rules to international/Lichess rules. Its numeric scores
are proof-number-search heuristics, not centipawns or win probabilities.

## Attribution and license

Original source: **Nilatac opening book, Cătălin Frâncu**

- https://catalin.francu.com/nilatac/
- https://github.com/CatalinFrancu/nilatac
- Creative Commons Attribution-ShareAlike 3.0 Unported:
  https://creativecommons.org/licenses/by-sa/3.0/

The original snapshot, archived adaptation, and adapted module data
(polish-training.pgn and src/polishStudy.ts) retain CC BY-SA 3.0 attribution.
Changes: replaced the Black introductory repertoire with user-directed White
checkpoints through 4. d3 and revised the teaching comments. No engine source
is copied into the app. Credit and license appear only in the first chapter's
comment box and the PGN's first chapter headers.

Rebuild using node scripts/build-polish.mjs. Import polish-training.pgn into
Lichess to edit comments; upload the edited full study before incorporating it
back into the app. Avoid regeneration over future user-authored comments.
