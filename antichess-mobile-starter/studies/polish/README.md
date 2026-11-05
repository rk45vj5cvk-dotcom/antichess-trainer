# Polish Defense — introductory repertoire for Black

Position: 1. e3 c5 2. Ba6 Nxa6. Every lesson replays from the standard initial
Antichess position. The learner plays Black. There are 11 chapters: the setup,
then a first-response checkpoint and a longer continuation for each of White's
3. b4, 3. d4, 3. Qh5, 3. Qf3, and 3. Qg4.

| White branch | Trained first reply | Longer checkpoint ends after |
|---|---|---|
| 3. b4 | 3...cxb4 | 6...b5 |
| 3. d4 | 3...cxd4 (forced) | 5...Kxd7 |
| 3. Qh5 | 3...Qb6 | 7...c4 |
| 3. Qf3 | 3...Qb6 | 6...Qxf2 |
| 3. Qg4 | 3...Qb6 | 7...bxa6 |

## Selection and limits

The snapshot records the browser's move rows and source URLs, retrieved
2026-11-05. For both players, the highest displayed numeric score was selected,
with a marked win taking precedence and marked losses avoided. No equally
highest-scoring alternatives occurred at the selected decision points. Other
moves and their scores remain in database-snapshot.json as reference; only one
answer is drilled. This is a book-ranked introductory repertoire, not a proof
that these are objectively optimal moves under current Lichess rules.

The public browser's score is a proof-number-search ratio heuristic, not a
centipawn evaluation or win probability. Its PHP comparator sorts numeric scores
descending; its webserver inverts child proof/disproof values to present each
move from the mover's perspective. These semantics were checked in the public
Nilatac repository's book.php and webserver.cc. The original data remains
attributable to the opening book, rather than to a fresh engine analysis.

Every main continuation reaches a page saying "No further information in this
branch." Where that page follows a White move, the training checkpoint ends
one ply earlier, after Black's last supported reply. We do not invent a Black
response, claim a forced win, or train beyond missing data into clean-up.
Only the top-ranked White continuation per named branch is covered initially;
this is not a complete defense against all White fourth moves.

The author notes that the book was not fully rebuilt after the engine moved
from FICS stalemate rules to international/Lichess rules. Move legality in this
module is independently validated using chessops Antichess. This does not prove
the legacy book's evaluations correct under current rules. None of these short
drills reaches a terminal position.

## Attribution and license

Source: **Nilatac opening book, Cătălin Frâncu**

- Opening browser: https://catalin.francu.com/nilatac/book.php?query=e3+c5+Ba6+Nxa6
- Author, license, and rules caveats: https://catalin.francu.com/nilatac/
- Public implementation reference: https://github.com/CatalinFrancu/nilatac
- License: **Creative Commons Attribution-ShareAlike 3.0 Unported**
  https://creativecommons.org/licenses/by-sa/3.0/

The source snapshot and adapted module data (polish-training.pgn and
src/polishStudy.ts) are provided under CC BY-SA 3.0. Changes: selected five White
branches and top-ranked replies, added original teaching commentary, split
sequences into introductory checkpoints, and stopped after supported Black
moves. Attribution and the license link are visible in the app's lesson comment
box. The license applies to this module data; the engine source is not copied
into the app.

Rebuild and validate all saved move selections with:

    node scripts/build-polish.mjs
