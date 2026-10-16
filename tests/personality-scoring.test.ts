import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DIMENSION_POLES,
  DIMENSIONS,
  PERSONALITY_QUESTIONS,
  QUESTION_COUNT,
} from "../src/lib/assessment/personality/questions";
import {
  scoreAnswers,
  type AnswerValue,
} from "../src/lib/assessment/personality/scoring";

/** Builds answers that always pick the statement showing the given pole (strength 2 or 1). */
function answersFor(poles: Partial<Record<string, string>>, strength: 1 | 2 = 2): AnswerValue[] {
  return PERSONALITY_QUESTIONS.map((question) => {
    const wanted = poles[question.dimension];
    const picksA = question.a.pole === wanted;
    return (picksA ? -strength : strength) as AnswerValue;
  });
}

describe("question bank", () => {
  it("has 12 items, 3 per dimension", () => {
    assert.equal(PERSONALITY_QUESTIONS.length, QUESTION_COUNT);
    assert.equal(QUESTION_COUNT, 12);
    for (const dimension of DIMENSIONS) {
      assert.equal(PERSONALITY_QUESTIONS.filter((q) => q.dimension === dimension).length, 3);
    }
  });

  it("has exactly one anchor per dimension", () => {
    for (const dimension of DIMENSIONS) {
      const anchors = PERSONALITY_QUESTIONS.filter((q) => q.dimension === dimension && q.anchor);
      assert.equal(anchors.length, 1, `${dimension} anchors`);
    }
  });

  it("uses both poles of its own dimension, one per statement", () => {
    for (const question of PERSONALITY_QUESTIONS) {
      const [first, second] = DIMENSION_POLES[question.dimension];
      assert.deepEqual([question.a.pole, question.b.pole].sort(), [first, second].sort(), `Q${question.id}`);
    }
  });

  it("balances which side shows each pole (1-2 or 2-1)", () => {
    for (const dimension of DIMENSIONS) {
      const [first] = DIMENSION_POLES[dimension];
      const firstOnA = PERSONALITY_QUESTIONS.filter((q) => q.dimension === dimension && q.a.pole === first).length;
      assert.ok(firstOnA === 1 || firstOnA === 2, `${dimension}: ${firstOnA}`);
    }
  });

  it("has unique ids and non-empty text in both languages", () => {
    assert.equal(new Set(PERSONALITY_QUESTIONS.map((q) => q.id)).size, QUESTION_COUNT);
    for (const q of PERSONALITY_QUESTIONS) {
      for (const text of [q.stem, q.a.text, q.b.text]) {
        assert.ok(text.ar.trim() && text.en.trim(), `Q${q.id}`);
      }
    }
  });

  it("never puts the same dimension in two consecutive questions", () => {
    PERSONALITY_QUESTIONS.slice(1).forEach((q, i) => {
      assert.notEqual(q.dimension, PERSONALITY_QUESTIONS[i].dimension, `Q${q.id}`);
    });
  });
});

describe("scoring", () => {
  it("maps each temperament to the right superpower and code", () => {
    const cases = [
      { poles: { EI: "I", SN: "S", TF: "F", JP: "J" }, code: "ISFJ", profile: "precision" },
      { poles: { EI: "E", SN: "S", TF: "T", JP: "P" }, code: "ESTP", profile: "speed" },
      { poles: { EI: "E", SN: "N", TF: "F", JP: "P" }, code: "ENFP", profile: "visualisation" },
      { poles: { EI: "I", SN: "N", TF: "T", JP: "J" }, code: "INTJ", profile: "logic" },
    ];

    for (const { poles, code, profile } of cases) {
      const result = scoreAnswers(answersFor(poles));
      assert.equal(result.typeCode, code);
      assert.equal(result.profile, profile);
    }
  });

  it("reports maximum, balanced and percentage values", () => {
    const strong = scoreAnswers(answersFor({ EI: "I", SN: "S", TF: "T", JP: "J" }));
    assert.equal(Math.abs(strong.scores.EI), 6);
    assert.equal(strong.dimensions.EI.secondPct, 100);
    assert.equal(strong.dimensions.EI.firstPct, 0);
    assert.equal(strong.dimensions.EI.strength, "clearly");

    const mild = scoreAnswers(answersFor({ EI: "I", SN: "S", TF: "T", JP: "J" }, 1));
    assert.equal(Math.abs(mild.scores.EI), 3);
    assert.equal(mild.dimensions.EI.strength, "moderately");
    assert.equal(mild.dimensions.EI.secondPct + mild.dimensions.EI.firstPct, 100);
    assert.ok([0, 25, 75, 100].includes(mild.dimensions.EI.secondPct));
  });

  it("splits percentages that always add up to 100", () => {
    const result = scoreAnswers(answersFor({ EI: "E", SN: "N", TF: "F", JP: "P" }, 1));
    for (const dimension of DIMENSIONS) {
      const { firstPct, secondPct } = result.dimensions[dimension];
      assert.equal(firstPct + secondPct, 100);
    }
  });

  it("breaks an exact tie with the dimension's anchor question", () => {
    const [first, second] = DIMENSION_POLES.JP;
    const jpIndexes = PERSONALITY_QUESTIONS.map((q, i) => (q.dimension === "JP" ? i : -1)).filter((i) => i >= 0);
    const anchorIndex = PERSONALITY_QUESTIONS.findIndex((q) => q.dimension === "JP" && q.anchor);
    const others = jpIndexes.filter((i) => i !== anchorIndex);

    // Contribution is measured toward the second pole; convert it back to the answer to give.
    const toAnswer = (index: number, contribution: number) =>
      (PERSONALITY_QUESTIONS[index].b.pole === second ? contribution : -contribution) as AnswerValue;

    const cases = [
      { anchor: 1, rest: [-2, 1], winner: second },
      { anchor: -1, rest: [2, -1], winner: first },
    ];

    for (const { anchor, rest, winner } of cases) {
      const answers = answersFor({ EI: "E", SN: "S", TF: "T", JP: "J" });
      others.forEach((questionIndex, i) => {
        answers[questionIndex] = toAnswer(questionIndex, rest[i]);
      });
      answers[anchorIndex] = toAnswer(anchorIndex, anchor);

      const result = scoreAnswers(answers);
      assert.equal(result.scores.JP, 0, "scores tie at zero");
      assert.equal(result.dimensions.JP.pole, winner);
      assert.equal(result.dimensions.JP.strength, "slightly");
    }
  });

  it("rejects incomplete or invalid answers", () => {
    assert.throws(() => scoreAnswers([] as AnswerValue[]));
    assert.throws(() => scoreAnswers(new Array(12).fill(0) as AnswerValue[]));
    assert.throws(() => scoreAnswers(new Array(11).fill(1) as AnswerValue[]));
    assert.throws(() => scoreAnswers(new Array(20).fill(1) as AnswerValue[]));
  });
});
