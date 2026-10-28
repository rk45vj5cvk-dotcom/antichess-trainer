import { Course } from './models';

// Demonstration course metadata only. The drill engine must verify every move under
// ANTICHESS rules before accepting Lichess PGN imports.
export const sampleCourse: Course = {
  id: 'wizard-opening-demo',
  title: 'Wizard Opening',
  description: 'Sample course layout — replace with your authored Lichess study.',
  repertoireColor: 'white',
  isFreeSample: true,
  lines: [
    { id: 'wizard-intro-1', title: 'Foundation', chapterOrder: 1,
      startFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1',
      uciMoves: [], comments: ['Import a Lichess Antichess chapter to begin training.'] },
    { id: 'wizard-branch-2', title: 'First branch', chapterOrder: 2,
      startFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1',
      uciMoves: [] },
    { id: 'wizard-deep-3', title: 'Deep continuation', chapterOrder: 3,
      startFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1',
      uciMoves: [] }
  ]
};
export const catalog: Course[] = [sampleCourse];
