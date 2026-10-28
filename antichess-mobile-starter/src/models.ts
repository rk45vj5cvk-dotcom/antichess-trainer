export type Course = {
  id: string;
  title: string;
  description: string;
  studyUrl?: string;
  repertoireColor: 'white' | 'black';
  lines: Line[];
  isFreeSample: boolean;
};
export type Line = {
  id: string;
  title: string;
  chapterOrder: number;
  startFen: string;
  uciMoves: string[];
  comments?: string[];
};
export type LineProgress = {
  lineId: string;
  successfulDrills: number;
  lastPracticedAt?: string;
  mastered: boolean;
};
export type AccessState = 'unknown' | 'free' | 'pro';
export const MONTHLY_USD = 5;
export const ENTITLEMENT_ID = 'pro';
export const MONTHLY_PRODUCT_ID = 'antichess_pro_monthly';
