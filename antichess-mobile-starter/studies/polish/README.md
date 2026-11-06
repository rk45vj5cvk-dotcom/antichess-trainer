# Defeating the Polish Defense

This module trains White from the standard initial Antichess position:

    1. e3 c5 2. Ba6 Nxa6 3. b4 cxb4 4. d3

The user selected 4. d3 as the critical improvement. The Antichess Opening
Explorer calls it the Computer Attack. Chapters follow complete opening branches,
not individual moves. The active course has two chapters, with 23 replayed plies:

1. The main opening through 4. d3.
2. The 4...b3 branch: 5. cxb3 Nc7 6. b4 Ne6 7. d4 Nxd4 8. Qxd4 Qc7.

Both chapters replay from the initial position. Add future chapters for distinct
Black branches; do not subdivide each move into another lesson.

These are opening checkpoints, not complete games or a complete winning
repertoire against every Black defense. No generic rule reminders or source
references appear in the instructional comments. Course credit is shown only
in the first chapter's comment box.

## What the new source actually provides

https://antichess.onrender.com/openings/

Its current named-opening catalog was inspected on 2026-11-06. The source's
public /content endpoint supplies JSON navigation using underscore-separated
SAN and prefix /openings/. Responses used for this adaptation are recorded in
current-explorer-snapshot.json, including move lists, FENs, labels, and leaf text.
No website prose or implementation is copied into the app.

After 4. d3, the catalog lists:

- 4...b3: Jettison Defence, marked White wins.
- 4...Qc7: Nilatac Defence, evaluation unknown. The catalog continues
  5. Nc3 Qxc3 6. Ne2 (Nilatac Gambit), also unresolved.
- 4...Rb8: Witches Defence, evaluation unknown, no listed continuation.

After 4...b3 5. cxb3, both ...Nc7 and ...Nb8 are labeled Andrejić's Proof and
marked White wins. The ...Nb8 leaf supplies no White continuation. The ...Nc7
branch continues 6. b4 Ne6 7. d4 Nxd4 8. Qxd4 Qc7, ending at another Andrejić's
Proof / White wins label. This is the line used for the additional checkpoints.
It differs from the old book's 6. Qf3 choice.

Important: /openings/ is a catalog, not the full proof tree. The separate
solution explorer (prefix /) returns "See Analysis" with no moves at the
position after 4. d3. We have not obtained or independently verified the full
proof. Catalog win labels are attributed source claims, not a newly calculated
result. Unknown defenses and the unexpanded ...Nb8 line are not drilled as
proven wins. Future deeper training needs further analysis or a supplied PGN.

The builder checks every new continuation edge against the saved catalog and
checks legality with chessops Antichess from the initial board. The headless
training-flow check completes both the d3 checkpoint and the longer branch.

## Archived Black introduction

The superseded 11-chapter Black introduction remains in
archived-black-introduction.pgn for recovery and a Black regression fixture;
it is not an active course. database-snapshot.json is historical Nilatac evidence
and no longer selects the repertoire. The author's legacy stalemate-rule caveats
and heuristic scores must not be treated as modern proof of optimality.

## Attribution and module license

Current move reference: **Antichess Opening Explorer**, maintained by **tolius**:
https://antichess.onrender.com/openings/
The site credits Vladica Andrejić for most opening names and proof statuses,
and multiple contributors for its solution material. No general reuse license
for the new website is asserted here; we use factual move sequences and labels
as research references and write the teaching comments ourselves.

Earlier adapted material: **Cătălin Frâncu / Nilatac**:
https://catalin.francu.com/nilatac/
Its opening book is CC BY-SA 3.0 Unported:
https://creativecommons.org/licenses/by-sa/3.0/

The earlier source snapshot, archived adaptation, and adapted course data
(polish-training.pgn and src/polishStudy.ts) retain CC BY-SA 3.0 attribution.
Changes: replaced the Black repertoire with White checkpoints through d3 and
extended the documented ...b3/...Nc7 line using the new catalog; rewrote lesson
comments. Source/annotator/license headers occur only in the PGN's first chapter.

Rebuild with node scripts/build-polish.mjs.
Run node scripts/check-training-flow.mjs for headless interaction checks.
Import polish-training.pgn into Lichess to edit comments, then upload the full
exported study to incorporate edits. Avoid regenerating over user-edited comments.
