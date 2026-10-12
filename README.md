**[Live demo →](https://sarasharifzadehasli.github.io/chart-lab/)**

# chart-lab

One set of numbers, drawn four ways, with a measurement of what each drawing
makes easy, hard, or impossible to see.

A chart is not accurate or misleading on its own. It is accurate **for a
question** — and the same numbers can answer one question at a glance while
hiding another completely.

```
npm install
npm run dev     # the page, at localhost:5173
npm test        # the checks that hold the dataset to the claims about it
```

---

## The premise

Four plans, six months, one number each. Four questions a reader might bring to
them:

|              | question                                 | true answer            |
| ------------ | ---------------------------------------- | ---------------------- |
| **largest**  | Which plan had the most accounts in Jun? | Starter                |
| **overtake** | Which plan overtook another?             | Starter overtook Basic |
| **share**    | What share of Jun was Team?              | 22%                    |
| **trend**    | Did the total rise or fall?              | rose                   |

Every answer in `src/tasks.ts` is **computed from the data**, never written
down. Change a number and the answers change with it, so the page cannot drift
away from the table it is describing.

The numbers themselves are invented, and the page says so wherever it shows
them. They were also _chosen_ rather than sampled: Starter crosses Basic
between month 4 and 5, the two finish 8% apart, Pro shrinks while everything
else grows, and the total rises every month. Random data would have made two of
the four questions trivial.

## What each encoding affords

The judgements in `src/encodings.ts` all come back to one ordering, from
Cleveland and McGill's work on graphical perception: people judge **position
along a common scale** most accurately, then **length**, then **angle and
area**. An encoding makes a question easy when it puts that question's quantity
near the top of that list.

|                  | largest  | overtake | share    | trend  |
| ---------------- | -------- | -------- | -------- | ------ |
| **Grouped bars** | direct   | possible | —        | —      |
| **Stacked bars** | possible | —        | possible | direct |
| **Pie**          | possible | —        | direct   | —      |
| **Lines**        | direct   | direct   | —        | —      |

**No row scores four, and that is the finding.** It is not a failure to search
hard enough for a better chart: the four questions want different things, and a
drawing that lifts one of them to the top of the perceptual ordering
necessarily pushes another down. A pie is the best of the four at _share_ and
the worst at everything else, and both halves of that sentence have the same
cause.

Each cell carries its reason in the source, and the page shows it on hover.

## Distorting the chart without touching the data

Four changes in `src/distortions.ts`, each a single edit to how the chart is
drawn. **None of them alters a number.** They are the counterpart to
deliberately breaking a function to find out whether the tests notice.

```
no-zero           the value axis starts at 40 instead of 0
reordered-stack   Team moves from the top of the stack to the middle
shuffled-slices   pie slices in alphabetical order instead of by size
flattened         the line plot drawn three times wider than tall
```

The first is the most instructive. Bars encode a value as a length from the
baseline, so moving the baseline to 40 means the drawn length is the value
minus 40: Basic and Starter, 8% apart, become 8 and 12 — one looks half again
as large as the other. And Pro and Team never reach 40 at all, so they get no
bar. The chart now shows a two-plan business.

Most of these live in real dashboards, put there by people who were not trying
to mislead anyone.

## Measuring yourself — and why it proves nothing

Step 04 of the page times you answering one question from each of the four
charts in a shuffled order, then puts your times beside what the table above
predicted.

It is worth doing and it is **not evidence**, for reasons the page states in
full:

- One person, one run. Four trials cannot separate a real difference from an
  ordinary fluctuation.
- The second chart benefits from the thinking you did on the first, so order
  matters more than encoding does.
- No practice round, so the first trial pays for learning the interface.
- **You already know the answers** from step 02. This is the largest problem,
  and no amount of timing fixes it.

A study that could support a claim needs participants who have not seen the
data, counterbalanced orders, practice trials, and enough people to put an
interval around the difference. This repository demonstrates the question; it
does not answer it.

What it _can_ support is the weaker claim in the table above — that these four
questions want different things from a drawing. That one follows from the
encodings themselves, not from anybody's reaction time.

## Two deliberate omissions

Both are things a normal dashboard would include, left out because they would
destroy what the page is measuring:

- **No hover tooltips.** A tooltip revealing the exact number would answer
  every question here by reading rather than by seeing.
- **No value labels while the clock runs.** A labelled bar makes "which is
  largest" a lookup. The gallery shows values; the timed task does not.

Identity is never carried by colour alone regardless: every chart direct-labels
its categories, and the full data table is step 01.

## On the colours

The four series colours were checked rather than chosen by eye — lightness
band, chroma floor, colour-vision-deficiency separation between adjacent pairs,
and contrast against the surface, in both light and dark mode. Worst adjacent
CVD separation is ΔE 9.1 light and 8.4 dark against a target of 8. Two of the
light-mode colours sit below 3:1 contrast on the light surface, which is why
the data table and the direct labels are not optional extras.

## Layout

```
src/data.ts           the numbers, and the reasons they are these numbers
src/tasks.ts          the four questions, with answers computed from the data
src/encodings.ts      what each chart affords, and why
src/distortions.ts    four edits that change the chart but not the data
src/data.test.ts      holds the dataset to the claims the comments make about it
web/charts/           the four charts, hand-drawn SVG
web/App.tsx           the six steps
```

The charts are hand-drawn SVG rather than a charting library. Where the
baseline sits, what a length stands for, how slices are ordered — those are the
subject here, and a library's job is to hide exactly those decisions.

`.github/workflows/pages.yml` runs the typecheck and the suite on every push to
`main` and publishes to GitHub Pages if they pass. Turn it on under Settings →
Pages → Source → GitHub Actions.
