/**
 * The dataset.
 *
 * Four plans, six months, one number each: how many accounts were on that plan
 * at the end of the month. The numbers are invented, not measured, and the
 * repository says so everywhere it shows them — nothing here is a claim about
 * the world.
 *
 * They are also *chosen* rather than sampled, and that is the point. Each task
 * in `tasks.ts` has a definite answer, and the answers were picked so that no
 * single chart makes all four easy:
 *
 *   - Starter overtakes Basic between month 4 and month 5.
 *   - Basic and Starter end 8% apart, which is close enough that a pie cannot
 *     settle which is larger but a bar chart settles it at a glance.
 *   - Pro shrinks the whole time while every other plan grows.
 *   - The total rises every month, which a stacked chart shows directly and
 *     the others leave you to add up.
 *
 * Random data would have produced a dataset where two or three tasks happened
 * to be trivial. This is a worked example, so the example is built on purpose.
 */

export interface Series {
  readonly id: string;
  readonly label: string;
  /** One value per month, in order. */
  readonly values: readonly number[];
}

export const months: readonly string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export const series: readonly Series[] = [
  { id: "basic", label: "Basic", values: [42, 44, 45, 46, 47, 48] },
  { id: "starter", label: "Starter", values: [30, 34, 39, 44, 49, 52] },
  { id: "pro", label: "Pro", values: [25, 25, 24, 23, 22, 21] },
  { id: "team", label: "Team", values: [18, 20, 23, 27, 31, 35] },
];

export const LAST = months.length - 1;

/** Every value in one month, in series order. */
export function column(monthIndex: number): number[] {
  return series.map((s) => s.values[monthIndex]!);
}

/** The sum of every series in one month. */
export function total(monthIndex: number): number {
  return column(monthIndex).reduce((a, b) => a + b, 0);
}

/** Totals across all months — what a stacked chart's outline traces. */
export function totals(): number[] {
  return months.map((_, i) => total(i));
}

export function seriesById(id: string): Series {
  const found = series.find((s) => s.id === id);
  if (!found) throw new Error(`No series "${id}"`);
  return found;
}
