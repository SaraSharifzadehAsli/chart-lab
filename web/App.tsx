/**
 * Chart Lab — the page.
 *
 * Six steps: the data, the questions, the four encodings and what each one
 * affords, a timed run where you measure yourself against those claims, four
 * distortions that change the chart without touching a number, and an honest
 * account of what none of it proves.
 */

import { useMemo, useState } from "react";
import { months, series, totals } from "../src/data.js";
import { tasks, taskById } from "../src/tasks.js";
import { encodings, encodingById, directCount } from "../src/encodings.js";
import { distortions } from "../src/distortions.js";
import { chartComponents, type ChartProps } from "./charts/index.js";

interface Trial {
  readonly encodingId: string;
  readonly ms: number;
  readonly correct: boolean;
}

export function App() {
  const [taskId, setTaskId] = useState("largest");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [queue, setQueue] = useState<string[]>([]);
  const [results, setResults] = useState<Trial[]>([]);
  const [startedAt, setStartedAt] = useState(0);
  const [openDistortion, setOpenDistortion] = useState<string | null>(null);

  const task = taskById(taskId);

  function begin() {
    // Encodings in a shuffled order, so the one you see first is not always
    // the same — an answer you have already worked out is no longer a test.
    const order = [...encodings.map((e) => e.id)].sort(() => Math.random() - 0.5);
    setQueue(order);
    setResults([]);
    setPhase("running");
    setStartedAt(performance.now());
  }

  function answer(choice: string) {
    const encodingId = queue[0]!;
    const truth = task.answer();
    const correct = choice === truth || choice.includes(truth);
    const trial: Trial = { encodingId, ms: performance.now() - startedAt, correct };
    const rest = queue.slice(1);
    setResults([...results, trial]);
    setQueue(rest);
    if (rest.length === 0) setPhase("done");
    else setStartedAt(performance.now());
  }

  const Chart = phase === "running" ? chartComponents[queue[0]!]! : null;

  return (
    <div className="wrap">
      <header>
        <p className="eyebrow">Encoding &amp; graphical perception</p>
        <h1>Chart Lab</h1>
        <p className="lede">
          One set of numbers, drawn four ways. A chart is not accurate or
          misleading on its own — it is accurate <em>for a question</em>, and
          the same numbers can answer one question at a glance while hiding
          another completely. This page makes that measurable.
        </p>
      </header>

      {/* ── 01 ─────────────────────────────────────────────────────────── */}
      <section className="step">
        <div className="step-head">
          <span className="num">01</span>
          <h2>The data</h2>
        </div>
        <p className="note">
          Accounts on four plans, over six months. <strong>The numbers are
          invented</strong> — they describe no real service, and nothing here is
          a claim about the world. They were chosen rather than sampled so that
          each question in step 02 has a definite, non-obvious answer; random
          numbers would have made two of the four trivial.
        </p>
        <div className="tscroll">
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                {months.map((m) => (
                  <th key={m} className="num-cell">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {series.map((s) => (
                <tr key={s.id}>
                  <th scope="row">
                    <span className="swatch" style={{ background: `var(--series-${s.id})` }} />
                    {s.label}
                  </th>
                  {s.values.map((v, i) => (
                    <td key={i} className="num-cell">{v}</td>
                  ))}
                </tr>
              ))}
              <tr className="total-row">
                <th scope="row">Total</th>
                {totals().map((t, i) => (
                  <td key={i} className="num-cell">{t}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 02 ─────────────────────────────────────────────────────────── */}
      <section className="step">
        <div className="step-head">
          <span className="num">02</span>
          <h2>Four questions</h2>
        </div>
        <p className="note">
          Every answer below is computed from the table, not written down — edit
          a number and these change with it.
        </p>
        <div className="tscroll">
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Answer</th>
                <th>What a chart must show</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td>{t.question}</td>
                  <td className="mono">{t.answer()}</td>
                  <td className="muted">{t.needs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 03 ─────────────────────────────────────────────────────────── */}
      <section className="step">
        <div className="step-head">
          <span className="num">03</span>
          <h2>Four ways to draw it</h2>
        </div>
        <p className="note">
          The same {series.length} plans and {months.length} months each time. What changes is
          which quantity the drawing puts in front of the eye — and the ordering
          behind every judgement below is Cleveland and McGill's: people read{" "}
          <strong>position on a common scale</strong> most accurately, then{" "}
          <strong>length</strong>, then <strong>angle and area</strong>.
        </p>

        <div className="gallery">
          {encodings.map((e) => {
            const C = chartComponents[e.id]!;
            return (
              <figure key={e.id}>
                <figcaption>
                  <strong>{e.label}</strong>
                  <span className="muted"> — {e.shows}</span>
                </figcaption>
                <C showValues />
              </figure>
            );
          })}
        </div>

        <h3>What each one affords</h3>
        <div className="tscroll">
          <table className="matrix">
            <thead>
              <tr>
                <th></th>
                {tasks.map((t) => (
                  <th key={t.id}>{t.id}</th>
                ))}
                <th>direct</th>
              </tr>
            </thead>
            <tbody>
              {encodings.map((e) => (
                <tr key={e.id}>
                  <th scope="row">{e.label}</th>
                  {tasks.map((t) => {
                    const a = e.affords[t.id]!;
                    return (
                      <td key={t.id}>
                        <span className={`pill pill-${a.level}`} title={a.why}>
                          {a.level}
                        </span>
                      </td>
                    );
                  })}
                  <td className="num-cell">{directCount(e)} of {tasks.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">
          No row scores four. That is not a failure to find a better chart — the
          four questions want different things, and a drawing that puts one of
          them at the top of the perceptual ordering necessarily pushes another
          down. Hover any cell for the reason.
        </p>
      </section>

      {/* ── 04 ─────────────────────────────────────────────────────────── */}
      <section className="step">
        <div className="step-head">
          <span className="num">04</span>
          <h2>Time yourself</h2>
        </div>
        <p className="note">
          Step 03 is a set of claims. This is where you test them on yourself:
          pick a question, answer it from each of the four charts in a shuffled
          order, and the page records how long you took and whether you were
          right. Values are hidden while the clock runs — otherwise it would be
          a reading test, not a seeing one.
        </p>

        <div className="controls">
          <label className="field">
            Question
            <select
              value={taskId}
              disabled={phase === "running"}
              onChange={(e) => {
                setTaskId(e.target.value);
                setPhase("idle");
                setResults([]);
              }}
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>{t.question}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={begin} disabled={phase === "running"}>
            {phase === "done" ? "Run it again" : "Start"}
          </button>
        </div>

        {phase === "running" && Chart && (
          <div className="trial">
            <p className="trial-q">
              {task.question}
              <span className="muted"> — chart {encodings.length - queue.length + 1} of {encodings.length}</span>
            </p>
            <Chart />
            <div className="options">
              {task.options().map((o) => (
                <button key={o} type="button" className="ghost" onClick={() => answer(o)}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "done" && (
          <Results results={results} taskId={taskId} />
        )}
      </section>

      {/* ── 05 ─────────────────────────────────────────────────────────── */}
      <section className="step">
        <div className="step-head">
          <span className="num">05</span>
          <h2>Same data, a different answer</h2>
        </div>
        <p className="note">
          Four changes to how a chart is drawn. <strong>None of them alters a
          single number.</strong> They are the counterpart to deliberately
          breaking a function to see whether the tests notice: one small,
          plausible edit each, and the question is whether a reader catches it.
          Most of these live in real dashboards, put there by people who were
          not trying to mislead anyone.
        </p>

        {distortions.map((d) => {
          const e = encodingById(d.encodingId);
          const C = chartComponents[d.encodingId]!;
          const open = openDistortion === d.id;
          return (
            <div className="distortion" key={d.id}>
              <button
                type="button"
                className="distortion-head"
                aria-expanded={open}
                onClick={() => setOpenDistortion(open ? null : d.id)}
              >
                <span className="mono">{e.label}</span>
                <strong>{d.label}</strong>
                <span className="muted">{open ? "hide" : "compare"}</span>
              </button>
              {open && (
                <div className="distortion-body">
                  <p className="note">
                    <strong>The change:</strong> {d.change}. Everything else,
                    including every value, is identical.
                  </p>
                  <div className="compare">
                    <figure>
                      <figcaption>As drawn above</figcaption>
                      <C showValues={false} />
                    </figure>
                    <figure>
                      <figcaption className="warn">With the change</figcaption>
                      <C {...(d.params as ChartProps)} showValues={false} />
                    </figure>
                  </div>
                  <p className="note">{d.effect}</p>
                  <p className="note muted">
                    Hits the question: <em>{taskById(d.targetTaskId).question}</em>{" "}
                    — whose true answer is still <strong>{taskById(d.targetTaskId).answer()}</strong>.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ── 06 ─────────────────────────────────────────────────────────── */}
      <section className="step">
        <div className="step-head">
          <span className="num">06</span>
          <h2>What this does not prove</h2>
        </div>
        <p className="note">
          The timing in step 04 is <strong>one person, one go</strong>, and that
          is not evidence. The second chart you see benefits from the thinking
          you did on the first, so the order matters more than the encoding
          does. There is no practice round, so the first trial carries the cost
          of learning the interface. Four trials cannot separate a real
          difference from an ordinary fluctuation. And you already know the
          answers from step 02, which is the largest problem of all.
        </p>
        <p className="note">
          A study that could support a claim would need participants who have
          not seen the data, counterbalanced orders, practice trials, and enough
          people to put an interval around the difference. This page is a
          demonstration of the question, not an answer to it.
        </p>
        <p className="note">
          What the page <em>can</em> support is the weaker and still useful
          claim in step 03: that these four questions want different things from
          a drawing, and that no single chart puts all four at the top of the
          perceptual ordering. That one follows from the encodings, not from
          anybody's reaction time.
        </p>
      </section>

      <footer>
        The numbers are invented and the plans are fictional. Built with React
        and TypeScript; the charts are hand-drawn SVG rather than a charting
        library, because where the baseline sits and what a length stands for
        are the subject here, and a library's job is to hide those decisions.
        Run <code>npm test</code> for the checks that hold the dataset to the
        claims made about it.
      </footer>
    </div>
  );
}

function Results({ results, taskId }: { results: Trial[]; taskId: string }) {
  const predicted = useMemo(
    () => Object.fromEntries(encodings.map((e) => [e.id, e.affords[taskId]!.level])),
    [taskId],
  );
  const byEncoding = [...results].sort((a, b) => a.ms - b.ms);

  return (
    <div className="results">
      <h3>What happened</h3>
      <div className="tscroll">
        <table>
          <thead>
            <tr>
              <th>Chart</th>
              <th>Your time</th>
              <th>Right?</th>
              <th>Step 03 predicted</th>
            </tr>
          </thead>
          <tbody>
            {byEncoding.map((r) => (
              <tr key={r.encodingId}>
                <th scope="row">{encodingById(r.encodingId).label}</th>
                <td className="num-cell">{(r.ms / 1000).toFixed(1)}s</td>
                <td>
                  <span className={`pill ${r.correct ? "pill-direct" : "pill-unsupported"}`}>
                    {r.correct ? "yes" : "no"}
                  </span>
                </td>
                <td>
                  <span className={`pill pill-${predicted[r.encodingId]}`}>
                    {predicted[r.encodingId]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">
        Four trials from one person who already knows the answer. Read step 06
        before drawing anything from this.
      </p>
    </div>
  );
}
