/**
 * The distortions.
 *
 * Each one is a single change to how the chart is drawn. **None of them touches
 * the data** — every number stays exactly what `data.ts` says. They are the
 * counterpart to the broken implementations in a mutation test: one small,
 * plausible edit each, and the question is whether a reader notices.
 *
 * A distortion that nobody is fooled by is a good sign about the encoding. One
 * that flips the answer is a hazard that lives in real dashboards, usually put
 * there by someone who was not trying to mislead anyone.
 */

export interface Distortion {
  readonly id: string;
  readonly label: string;
  /** Which chart it applies to. */
  readonly encodingId: string;
  /** The single change, stated as a change. */
  readonly change: string;
  /** Why it moves the reader's answer, and which task it hits. */
  readonly effect: string;
  readonly targetTaskId: string;
  /** Read by the chart component. */
  readonly params: Readonly<Record<string, number | boolean | string>>;
}

export const distortions: readonly Distortion[] = [
  {
    id: "no-zero",
    label: "Baseline moved off zero",
    encodingId: "grouped",
    change: "the value axis starts at 40 instead of 0",
    effect:
      "Bars encode a value by length from the baseline. Move the baseline up and the drawn length is no longer the value — it is the value minus 40. Basic ends at 48 and Starter at 52, a difference of 8%; drawn from 40 they become 8 and 12, and Starter looks half again as large. The ranking survives, the magnitude does not. And two whole plans disappear: Pro and Team never reach 40, so they have no bar at all — the chart now shows a two-plan business.",
    targetTaskId: "largest",
    params: { baseline: 40 },
  },
  {
    id: "reordered-stack",
    label: "Stacking order changed",
    encodingId: "stacked",
    change: "Team is moved from the top of the stack to the middle",
    effect:
      "Only the band on the baseline can be read as a length from zero. Every band above it starts wherever the bands below it happen to end, so it can grow while its top edge falls. Moving a band changes how readable it is without changing a single number — which is why the stacking order is a decision, not a default.",
    targetTaskId: "share",
    params: { order: "basic,pro,team,starter" },
  },
  {
    id: "shuffled-slices",
    label: "Slices no longer in size order",
    encodingId: "pie",
    change: "slices are drawn in alphabetical order instead of largest to smallest",
    effect:
      "Comparing two angles is hardest when they are far apart on the circle and have no shared edge. Sorted slices put the two biggest side by side, which is the only arrangement that gives the eye a shared starting ray. Alphabetical order throws that away — the same slices, the same data, a harder question.",
    targetTaskId: "largest",
    params: { sorted: false },
  },
  {
    id: "flattened",
    label: "Chart flattened",
    encodingId: "line",
    change: "the plot is drawn three times wider than tall",
    effect:
      "A line's message is its slope, and slope depends on the shape of the box it is drawn in, not only on the numbers. Flatten the plot and every rise shrinks toward horizontal; the Starter–Basic crossing is still there, at the same month, but it stops looking like an event. Cleveland's rule of thumb — aim the average slope near 45° — is about exactly this.",
    targetTaskId: "overtake",
    params: { aspect: 3 },
  },
];

export function distortionsFor(encodingId: string): Distortion[] {
  return distortions.filter((d) => d.encodingId === encodingId);
}

export function distortionById(id: string): Distortion | undefined {
  return distortions.find((d) => d.id === id);
}
