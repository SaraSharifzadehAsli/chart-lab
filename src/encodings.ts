/**
 * The encodings, and what each one affords.
 *
 * This file is the opinionated part of the repository and it is written down on
 * purpose, so it can be argued with rather than absorbed.
 *
 * The reasons all come back to one ordering, from Cleveland and McGill's work
 * on graphical perception: people judge **position along a common scale** most
 * accurately, then **length**, then **angle and area**, then **colour value**.
 * An encoding makes a question easy when it puts that question's quantity near
 * the top of that list, and hard when it pushes it down.
 *
 * "direct" — the question is answered by looking.
 * "possible" — the answer is in the picture but has to be worked out.
 * "unsupported" — the chart does not contain what the question needs.
 */

import { tasks } from "./tasks.js";

export type Affordance = "direct" | "possible" | "unsupported";

export interface Encoding {
  readonly id: string;
  readonly label: string;
  /** What quantity this chart puts in front of the eye. */
  readonly shows: string;
  readonly affords: Readonly<Record<string, { level: Affordance; why: string }>>;
}

export const encodings: readonly Encoding[] = [
  {
    id: "grouped",
    label: "Grouped bars",
    shows: "every plan's value each month, all from the same baseline",
    affords: {
      largest: {
        level: "direct",
        why: "Every bar starts at zero, so the tallest bar is the largest number — position on a common scale, the judgement people make best.",
      },
      overtake: {
        level: "possible",
        why: "The crossing is there, but you have to compare two bars in one group, then the same two in the next group, and hold the difference in your head.",
      },
      share: {
        level: "unsupported",
        why: "Nothing in the picture stands for the total, so there is no whole to measure a part against.",
      },
      trend: {
        level: "unsupported",
        why: "The total is never drawn. You would have to add four bars by eye, six times.",
      },
    },
  },
  {
    id: "stacked",
    label: "Stacked bars",
    shows: "the total each month, split into plans",
    affords: {
      largest: {
        level: "possible",
        why: "Only the bottom band sits on the baseline. Every band above it floats, so comparing two of them means comparing lengths that start in different places.",
      },
      overtake: {
        level: "unsupported",
        why: "A band's start moves with whatever is beneath it, so a band can grow while appearing to shrink.",
      },
      share: {
        level: "possible",
        why: "The whole bar is the total, so the part-to-whole relation is present — but it has to be estimated as a fraction of a length.",
      },
      trend: {
        level: "direct",
        why: "The top of the bar is the total. Its rise is the answer, and no addition is needed.",
      },
    },
  },
  {
    id: "pie",
    label: "Pie chart",
    shows: "the final month only, as parts of one whole",
    affords: {
      largest: {
        level: "possible",
        why: "Two slices 8% apart are two angles a few degrees apart — angle is judged far less accurately than length, and this is exactly the margin where it fails.",
      },
      overtake: {
        level: "unsupported",
        why: "There is only one month in the picture. Nothing about time is drawn at all.",
      },
      share: {
        level: "direct",
        why: "The whole circle is the total, so a slice is a share by construction. This is the one question a pie answers better than a bar chart.",
      },
      trend: {
        level: "unsupported",
        why: "Only one month is shown, and the circle is always a full circle, so a bigger total looks identical.",
      },
    },
  },
  {
    id: "line",
    label: "Lines",
    shows: "each plan's path through time",
    affords: {
      largest: {
        level: "direct",
        why: "At the right-hand edge the lines are at different heights on one shared axis — the same common-scale judgement as bars.",
      },
      overtake: {
        level: "direct",
        why: "An overtake is a crossing, and a crossing is a thing you see rather than compute. No other encoding here makes it this plain.",
      },
      share: {
        level: "unsupported",
        why: "The lines are separate quantities. Nothing in the picture represents their sum.",
      },
      trend: {
        level: "unsupported",
        why: "Four rising lines do not tell you the total rose — they could be rising while a fifth, undrawn, fell. Here there is no fifth, but the chart does not say so.",
      },
    },
  },
];

export function encodingById(id: string): Encoding {
  const found = encodings.find((e) => e.id === id);
  if (!found) throw new Error(`No encoding "${id}"`);
  return found;
}

/** How many of the four tasks this encoding answers directly. */
export function directCount(encoding: Encoding): number {
  return tasks.filter((t) => encoding.affords[t.id]?.level === "direct").length;
}
