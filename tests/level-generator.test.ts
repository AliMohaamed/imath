import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DOT_GRID_CELLS, generateQuestion, MINUS, type Question } from "../src/lib/assessment/level/generator";
import { LEVEL_SLOTS, MAX_LEVEL, QUESTIONS_PER_ROUND } from "../src/lib/assessment/level/levels";

const SAMPLES = 10_000;

function eachQuestion(visit: (question: Question, seed: number) => void) {
  for (let seed = 1; seed <= SAMPLES; seed += 1) {
    for (let level = 1; level <= MAX_LEVEL; level += 1) {
      for (let slot = 0; slot < QUESTIONS_PER_ROUND; slot += 1) {
        visit(generateQuestion(seed * 7919, level, slot), seed);
      }
    }
  }
}

/** Reads "a op b = ?" style expressions back into numbers. */
function parse(expression: string) {
  const match = expression.match(/^(\d+) (\+|−|×) (\d+) = \?$/);
  return match ? { a: Number(match[1]), op: match[2], b: Number(match[3]) } : null;
}

describe("level question generator", () => {
  it("is deterministic: the same seed, level and slot give the same question", () => {
    for (let seed = 1; seed <= 500; seed += 1) {
      for (let level = 1; level <= MAX_LEVEL; level += 1) {
        for (let slot = 0; slot < QUESTIONS_PER_ROUND; slot += 1) {
          assert.deepEqual(generateQuestion(seed, level, slot), generateQuestion(seed, level, slot));
        }
      }
    }
  });

  it("varies with the seed", () => {
    const answers = new Set<string>();
    for (let seed = 1; seed <= 200; seed += 1) {
      answers.add(JSON.stringify(generateQuestion(seed, 4, 0)));
    }
    assert.ok(answers.size > 100);
  });

  it(`always gives whole, non-negative, non-zero answers (${SAMPLES} seeds x 18 slots)`, () => {
    eachQuestion((question) => {
      assert.ok(Number.isInteger(question.answer), question.id);
      assert.ok(question.answer >= 1, `${question.type}: ${question.answer}`);
    });
  });

  it("matches each level's slots and uses the right kind of question", () => {
    eachQuestion((question) => {
      assert.equal(question.type, LEVEL_SLOTS[question.level][question.slot]);
      assert.equal(question.kind === "flash", question.type.startsWith("flash"));
      assert.equal(question.kind === "dots", question.type === "count");
    });
  });

  it("checks every sum: the stated answer is the real answer, and no operand is zero", () => {
    eachQuestion((question) => {
      if (question.kind !== "arith") return;

      if (question.phrase) {
        const { key, value } = question.phrase;
        if (key === "half") {
          assert.equal(value % 2, 0, "half of an even number");
          assert.equal(question.answer, value / 2);
        } else {
          assert.equal(question.answer, value * 2);
        }
        return;
      }

      assert.ok(question.expression, `${question.type} has neither expression nor phrase`);
      const bond = question.expression.match(/^(\d+) \+ \? = (\d+)$/);

      if (bond) {
        assert.equal(Number(bond[1]) + question.answer, Number(bond[2]));
        assert.ok(Number(bond[1]) >= 1);
      } else {
        const sum = parse(question.expression);
        assert.ok(sum, question.expression);
        assert.ok(sum.a >= 1 && sum.b >= 1, question.expression);
        const expected = sum.op === "+" ? sum.a + sum.b : sum.op === MINUS ? sum.a - sum.b : sum.a * sum.b;
        assert.equal(question.answer, expected, question.expression);
      }
    });
  });

  it("keeps sums within each level's range", () => {
    const limits: Record<string, number> = { add10: 10, sub10: 10, add20: 18, sub20: 18, twoByOne: 99, twoByTwo: 138 };

    eachQuestion((question) => {
      const sum = question.expression ? parse(question.expression) : null;
      if (!sum || !(question.type in limits)) return;

      assert.ok(Math.max(sum.a, sum.b, question.answer) <= limits[question.type], `${question.type}: ${question.expression}`);
    });
  });

  it("forces carrying or borrowing where the level calls for it", () => {
    eachQuestion((question) => {
      const sum = question.expression ? parse(question.expression) : null;
      if (!sum) return;

      const needsBridge = ["add20", "sub20", "twoByTwo", "threeDigit"].includes(question.type);
      if (!needsBridge) return;

      if (sum.op === "+") assert.ok((sum.a % 10) + (sum.b % 10) >= 10, question.expression);
      if (sum.op === MINUS) assert.ok(sum.a % 10 < sum.b % 10 || (question.type === "sub20" && sum.a > 10), question.expression);
    });
  });

  it("builds flash chains that never repeat a number or go negative", () => {
    eachQuestion((question) => {
      if (question.kind !== "flash") return;
      const steps = question.steps ?? [];

      assert.ok(steps.length >= 3 && steps.length <= 5);
      assert.ok(steps[0] > 0, "the first number is added");
      assert.ok((question.intervalMs ?? 0) >= 1200);

      let total = 0;
      steps.forEach((step, index) => {
        total += step;
        assert.ok(total >= 0, `${question.id}: running total ${total}`);
        if (index > 0) assert.notEqual(Math.abs(step), Math.abs(steps[index - 1]), "no repeats");
      });
      assert.equal(total, question.answer);

      if (question.type === "flash4" || question.type === "flashTwo5") {
        assert.ok(steps.some((step) => step < 0), "level 4 and 6 flashes include a subtraction");
      } else {
        assert.ok(steps.every((step) => step > 0), "level 3 and 5 flashes only add");
      }
    });
  });

  it("uses single digits for levels 3-4 flashes and two-digit numbers for levels 5-6", () => {
    eachQuestion((question) => {
      if (question.kind !== "flash") return;
      const size = question.level <= 4 ? [1, 9] : [10, 59];
      for (const step of question.steps ?? []) {
        assert.ok(Math.abs(step) >= size[0] && Math.abs(step) <= size[1], `${question.id}: ${step}`);
      }
    });
  });

  it("places dots on distinct cells of the grid", () => {
    eachQuestion((question) => {
      if (question.kind !== "dots") return;
      const cells = question.dots ?? [];

      assert.equal(new Set(cells).size, cells.length);
      assert.equal(cells.length, question.answer);
      assert.ok(cells.every((cell) => cell >= 0 && cell < DOT_GRID_CELLS));
      assert.ok(question.answer >= 3 && question.answer <= 10);
    });
  });
});
