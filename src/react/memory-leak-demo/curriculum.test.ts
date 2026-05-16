import { describe, expect, test } from "vitest";
import { LESSONS } from "./curriculum";

describe("memory-leak curriculum", () => {
  test("has five sequential lessons with unique indices", () => {
    expect(LESSONS).toHaveLength(5);
    expect(LESSONS.map((l) => l.index)).toEqual([1, 2, 3, 4, 5]);
  });

  test.each(LESSONS)("lesson $index has required fields", (lesson) => {
    expect(lesson.title.length).toBeGreaterThan(0);
    expect(lesson.outcomes.length).toBeGreaterThan(0);
    expect(lesson.chromeSteps.length).toBeGreaterThan(0);
    expect(lesson.focus.length).toBeGreaterThan(0);
  });
});
