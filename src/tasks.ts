/**
 * The tasks.
 *
 * A chart is not good or bad on its own — it is good *for a question*. So the
 * specification here is a list of questions a reader might bring to this data,
 * each with its answer computed from `data.ts` rather than written down. If the
 * numbers change, the answers change with them and nothing goes stale.
 *
 * Four questions, picked so that no single chart answers all of them well.
 */

import { column, LAST, months, series, total, totals } from "./data.js";

export interface Task {
  readonly id: string;
  /** The question, as a reader would ask it. */
  readonly question: string;
  /** What the data says. Computed, never hard-coded. */
  readonly answer: () => string;
  /** The options a reader picks between when timing themselves. */
  readonly options: () => string[];
  /** What a chart has to show for this question to be answerable at all. */
  readonly needs: string;
}

export const tasks: readonly Task[] = [
  {
    id: "largest",
    question: `Which plan had the most accounts in ${months[LAST]}?`,
    answer: () => {
      const values = column(LAST);
      let best = 0;
      for (let i = 1; i < values.length; i++) if (values[i]! > values[best]!) best = i;
      return series[best]!.label;
    },
    options: () => series.map((s) => s.label),
    needs: "every plan's final value measured against the same baseline",
  },
  {
    id: "overtake",
    question: "Which plan overtook another during these six months?",
    answer: () => {
      for (const a of series) {
        for (const b of series) {
          if (a.id === b.id) continue;
          const startsBelow = a.values[0]! < b.values[0]!;
          const endsAbove = a.values[LAST]! > b.values[LAST]!;
          if (startsBelow && endsAbove) return `${a.label} overtook ${b.label}`;
        }
      }
      return "none";
    },
    options: () => [
      "Starter overtook Basic",
      "Team overtook Basic",
      "Pro overtook Team",
      "No plan overtook another",
    ],
    needs: "each plan's path over time, with the crossing point visible",
  },
  {
    id: "share",
    question: `Roughly what share of ${months[LAST]}'s accounts were on Team?`,
    answer: () => {
      const team = series.find((s) => s.id === "team")!;
      const pct = (team.values[LAST]! / total(LAST)) * 100;
      return `${Math.round(pct)}%`;
    },
    options: () => ["about 10%", "about 22%", "about 35%", "about 45%"],
    needs: "one plan measured against the whole, not against the other plans",
  },
  {
    id: "trend",
    question: "Did the total number of accounts rise or fall over the six months?",
    answer: () => {
      const t = totals();
      return t[t.length - 1]! > t[0]! ? "rose" : "fell";
    },
    options: () => ["rose", "fell", "stayed flat", "rose then fell"],
    needs: "the sum of all plans in each month, as a single quantity",
  },
];

export function taskById(id: string): Task {
  const found = tasks.find((t) => t.id === id);
  if (!found) throw new Error(`No task "${id}"`);
  return found;
}
