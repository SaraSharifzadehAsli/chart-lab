/**
 * The four encodings.
 *
 * Every one draws the same numbers from `src/data.ts`. What differs is only
 * what the drawing puts in front of the eye.
 *
 * Two deliberate omissions, both of which a normal dashboard would include:
 *
 *   1. **No hover tooltips.** A tooltip that reveals the exact number would
 *      answer every question on this page by reading rather than by seeing,
 *      and reading is not what is being studied. The charts have to be legible
 *      on their own or not at all.
 *   2. **No value labels while a question is being timed.** Same reason: a
 *      labelled bar makes "which is largest" a lookup. The gallery shows
 *      values; the timed task does not. Identity is still never carried by
 *      colour alone — every chart direct-labels its categories and a table
 *      view is one click away.
 */

import { months, series, total, type Series } from "../../src/data.js";
import { Axes, makeScale, PLOT, tickValues, type Scale } from "./frame.js";

export interface ChartProps {
  /** Distortion parameters, when one is switched on. */
  readonly baseline?: number;
  readonly order?: string;
  readonly sorted?: boolean;
  readonly aspect?: number;
  /** The timed task hides values; the gallery shows them. */
  readonly showValues?: boolean;
}

const colorOf = (id: string) => `var(--series-${id})`;

function ordered(spec?: string): readonly Series[] {
  if (!spec) return series;
  const ids = spec.split(",");
  return ids.map((id) => series.find((s) => s.id === id)!).filter(Boolean);
}

/* ── Grouped bars ──────────────────────────────────────────────────────── */

export function GroupedBars({ baseline = 0, showValues }: ChartProps) {
  const max = Math.max(...series.flatMap((s) => s.values));
  const scale = makeScale(max + 4, baseline);
  const groupW = scale.bandWidth(months.length);
  const barW = Math.min(12, (groupW - 10) / series.length);

  return (
    <svg className="chart" viewBox={`0 0 ${PLOT.width} ${scale.height}`} role="img"
      aria-label="Grouped bars: each plan's accounts, month by month">
      <Axes scale={scale} months={months} ticks={tickValues(baseline, max + 4)} baseline={baseline} />
      {months.map((m, i) =>
        series.map((s, j) => {
          const v = s.values[i]!;
          const x = scale.x(i, months.length) - (barW * series.length) / 2 + j * barW;
          const y = scale.y(v);
          const h = Math.max(scale.y(baseline) - y, 0);
          return (
            <g key={`${m}-${s.id}`}>
              {/* 2px gap between neighbouring bars, drawn as inset rather than stroke */}
              <rect x={x + 1} y={y} width={barW - 2} height={h} rx="2" fill={colorOf(s.id)} />
              {/* Selective labels: only the final month. A number on every
                  bar would collide with its neighbour and, worse, would turn
                  a comparison into a reading task. */}
              {showValues && i === months.length - 1 && (
                <text className="bar-value" x={x + barW / 2} y={y - 5} textAnchor="middle">
                  {v}
                </text>
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}

/* ── Stacked bars ──────────────────────────────────────────────────────── */

export function StackedBars({ order, showValues }: ChartProps) {
  const stack = ordered(order);
  const max = Math.max(...months.map((_, i) => total(i)));
  const scale = makeScale(max + 10);
  const barW = Math.min(34, scale.bandWidth(months.length) - 16);

  return (
    <svg className="chart" viewBox={`0 0 ${PLOT.width} ${scale.height}`} role="img"
      aria-label="Stacked bars: the monthly total, split by plan">
      <Axes scale={scale} months={months} ticks={tickValues(0, max + 10)} baseline={0} />
      {months.map((m, i) => {
        let acc = 0;
        return (
          <g key={m}>
            {stack.map((s) => {
              const v = s.values[i]!;
              const yTop = scale.y(acc + v);
              const yBottom = scale.y(acc);
              acc += v;
              return (
                // 2px of surface between segments, so the bands stay separable
                <rect
                  key={s.id}
                  x={scale.x(i, months.length) - barW / 2}
                  y={yTop}
                  width={barW}
                  height={Math.max(yBottom - yTop - 2, 1)}
                  rx="2"
                  fill={colorOf(s.id)}
                />
              );
            })}
            {showValues && (
              <text className="bar-value" x={scale.x(i, months.length)} y={scale.y(acc) - 6} textAnchor="middle">
                {acc}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Pie ───────────────────────────────────────────────────────────────── */

export function Pie({ sorted = true, showValues }: ChartProps) {
  const last = months.length - 1;
  const slices = [...series]
    .map((s) => ({ id: s.id, label: s.label, value: s.values[last]! }))
    .sort((a, b) => (sorted ? b.value - a.value : a.label.localeCompare(b.label)));
  const sum = slices.reduce((a, s) => a + s.value, 0);

  const cx = PLOT.width / 2;
  const cy = PLOT.height / 2;
  const r = 110;
  let angle = -Math.PI / 2;

  return (
    <svg className="chart" viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} role="img"
      aria-label={`Pie: share of ${months[last]} accounts by plan`}>
      {slices.map((s) => {
        const sweep = (s.value / sum) * Math.PI * 2;
        const a0 = angle;
        const a1 = angle + sweep;
        angle = a1;
        const mid = (a0 + a1) / 2;
        const p = (a: number, radius: number) => `${cx + Math.cos(a) * radius} ${cy + Math.sin(a) * radius}`;
        const d = `M ${cx} ${cy} L ${p(a0, r)} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${p(a1, r)} Z`;
        return (
          <g key={s.id}>
            {/* The surface-coloured stroke is the 2px spacer between slices. */}
            <path d={d} fill={colorOf(s.id)} className="slice" />
            <text
              className="slice-label"
              x={cx + Math.cos(mid) * (r + 26)}
              y={cy + Math.sin(mid) * (r + 26) + 4}
              textAnchor={Math.cos(mid) > 0.1 ? "start" : Math.cos(mid) < -0.1 ? "end" : "middle"}
            >
              {s.label}
              {showValues && ` · ${Math.round((s.value / sum) * 100)}%`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Lines ─────────────────────────────────────────────────────────────── */

export function Lines({ aspect, showValues }: ChartProps) {
  const max = Math.max(...series.flatMap((s) => s.values));
  const scale: Scale = makeScale(max + 4, 0, aspect);

  return (
    <svg className="chart" viewBox={`0 0 ${PLOT.width} ${scale.height}`} role="img"
      aria-label="Lines: each plan's path over six months">
      <Axes scale={scale} months={months} ticks={tickValues(0, max + 4)} baseline={0} />
      {series.map((s) => {
        const d = s.values
          .map((v, i) => `${i === 0 ? "M" : "L"} ${scale.x(i, months.length)} ${scale.y(v)}`)
          .join(" ");
        const lastX = scale.x(months.length - 1, months.length);
        const lastY = scale.y(s.values[months.length - 1]!);
        return (
          <g key={s.id}>
            <path d={d} fill="none" stroke={colorOf(s.id)} strokeWidth="2" strokeLinecap="round" />
            {s.values.map((v, i) => (
              <circle key={i} cx={scale.x(i, months.length)} cy={scale.y(v)} r="4" fill={colorOf(s.id)} />
            ))}
            {/* Direct label at the line's end — identity without reading a legend. */}
            <text className="line-label" x={lastX + 7} y={lastY + 4}>
              {s.label}
              {showValues && ` ${s.values[months.length - 1]}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export const chartComponents: Record<string, (p: ChartProps) => JSX.Element> = {
  grouped: GroupedBars,
  stacked: StackedBars,
  pie: Pie,
  line: Lines,
};
