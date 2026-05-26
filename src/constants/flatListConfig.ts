/** Performance defaults for @legendapp/list course lists. */
export const LEGEND_LIST_PERF = {
  estimatedItemSize: 156,
  drawDistance: 280,
  recycleItems: true,
  initialContainerPoolRatio: 0.5,
} as const;

/** @deprecated Use LEGEND_LIST_PERF */
export const FLAT_LIST_PERF = LEGEND_LIST_PERF;
