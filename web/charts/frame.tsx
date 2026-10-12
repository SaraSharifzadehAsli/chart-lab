/**
 * Shared plot geometry.
 *
 * All four charts are drawn by hand in SVG rather than with a charting
 * library. That is deliberate: the subject of this repository is the encoding
 * itself — where the baseline sits, what a length stands for, how slices are
 * ordered — and a library's job is to hide exactly those decisions.
 */

export const PLOT = { width: 560, height: 300, padL: 44, padR: 16, padT: 16, padB: 34 };

export interface Scale {
  readonly x: (i: number, of: number) => number;
  readonly y: (v: number) => number;
  readonly bandWidth: (of: number) => number;
  readonly innerW: number;
  readonly innerH: number;
  readonly height: number;
}

/**
 * @param baseline where the value axis starts. Zero unless a distortion moves
 *   it — which is the whole of the "no-zero" distortion.
 */
export function makeScale(max: number, baseline = 0, aspect?: number): Scale {
  const width = PLOT.width;
  const height = aspect ? Math.round(width / aspect) : PLOT.height;
  const innerW = width - PLOT.padL - PLOT.padR;
  const innerH = height - PLOT.padT - PLOT.padB;
  return {
    innerW,
    innerH,
    height,
    bandWidth: (of) => innerW / of,
    x: (i, of) => PLOT.padL + (innerW / of) * (i + 0.5),
    y: (v) => PLOT.padT + innerH - ((v - baseline) / (max - baseline)) * innerH,
  };
}

/** Axis lines, month labels and a few value ticks. */
export function Axes({
  scale,
  months,
  ticks,
  baseline,
}: {
  scale: Scale;
  months: readonly string[];
  ticks: number[];
  baseline: number;
}) {
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line
            className="gridline"
            x1={PLOT.padL}
            x2={PLOT.width - PLOT.padR}
            y1={scale.y(t)}
            y2={scale.y(t)}
          />
          <text className="tick" x={PLOT.padL - 8} y={scale.y(t) + 4} textAnchor="end">
            {t}
          </text>
        </g>
      ))}
      <line
        className="axis"
        x1={PLOT.padL}
        x2={PLOT.width - PLOT.padR}
        y1={scale.y(baseline)}
        y2={scale.y(baseline)}
      />
      {months.map((m, i) => (
        <text
          key={m}
          className="tick"
          x={scale.x(i, months.length)}
          y={scale.y(baseline) + 20}
          textAnchor="middle"
        >
          {m}
        </text>
      ))}
    </g>
  );
}

/** Evenly spaced tick values between `from` and `max`. */
export function tickValues(from: number, max: number, count = 4): number[] {
  const step = (max - from) / count;
  const out: number[] = [];
  for (let i = 0; i <= count; i++) out.push(Math.round(from + step * i));
  return out;
}
