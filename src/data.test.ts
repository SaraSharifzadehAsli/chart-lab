/**
 * The dataset is a worked example, and the comments in `data.ts` claim specific
 * things about it. These tests hold those claims to the numbers, so a careless
 * edit to a value cannot quietly make the surrounding prose wrong.
 */

import { describe, expect, it } from "vitest";
import { column, LAST, months, series, seriesById, total, totals } from "./data.js";
import { tasks, taskById } from "./tasks.js";
import { encodings, directCount } from "./encodings.js";
import { distortions } from "./distortions.js";

describe("the dataset", () => {
  it("has one value per month in every series", () => {
    for (const s of series) expect(s.values).toHaveLength(months.length);
  });

  it("has Starter overtaking Basic, and nothing else overtaking", () => {
    expect(taskById("overtake").answer()).toBe("Starter overtook Basic");
  });

  it("ends with Basic and Starter within 10% of each other", () => {
    const basic = seriesById("basic").values[LAST]!;
    const starter = seriesById("starter").values[LAST]!;
    const gap = Math.abs(starter - basic) / Math.max(starter, basic);
    expect(gap).toBeLessThan(0.1);
    expect(gap).toBeGreaterThan(0.02);
  });

  it("has exactly one plan shrinking", () => {
    const shrinking = series.filter((s) => s.values[LAST]! < s.values[0]!);
    expect(shrinking.map((s) => s.id)).toEqual(["pro"]);
  });

  it("has a total that rises every single month", () => {
    const t = totals();
    for (let i = 1; i < t.length; i++) expect(t[i]!).toBeGreaterThan(t[i - 1]!);
  });

  it("agrees with itself: the column sums to the total", () => {
    for (let i = 0; i < months.length; i++) {
      expect(column(i).reduce((a, b) => a + b, 0)).toBe(total(i));
    }
  });
});

describe("the specification", () => {
  it("gives every task an answer that is one of its options", () => {
    for (const task of tasks) {
      const answer = task.answer();
      const matched = task.options().some((o) => o === answer || o.includes(answer));
      expect(matched, `${task.id} answered "${answer}"`).toBe(true);
    }
  });

  it("rates every encoding against every task", () => {
    for (const e of encodings) {
      for (const t of tasks) {
        expect(e.affords[t.id], `${e.id} vs ${t.id}`).toBeDefined();
      }
    }
  });

  it("has no encoding that answers everything — that is the premise", () => {
    for (const e of encodings) {
      expect(directCount(e)).toBeLessThan(tasks.length);
    }
  });

  it("has every task answered directly by at least one encoding", () => {
    for (const t of tasks) {
      const covered = encodings.some((e) => e.affords[t.id]!.level === "direct");
      expect(covered, `no encoding answers ${t.id} directly`).toBe(true);
    }
  });

  it("points every distortion at a real encoding and a real task", () => {
    for (const d of distortions) {
      expect(encodings.some((e) => e.id === d.encodingId), d.id).toBe(true);
      expect(tasks.some((t) => t.id === d.targetTaskId), d.id).toBe(true);
    }
  });
});
