import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DIMENSION_POLES, DIMENSIONS, PERSONALITY_QUESTIONS } from "../src/lib/assessment/personality/questions";
import { buildReport } from "../src/lib/assessment/personality/report";
import {
  getPowersToBuild,
  PERSONALITY_PROFILES,
  scoreAnswers,
  type AnswerValue,
} from "../src/lib/assessment/personality/scoring";

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectStrings);
  return [];
}

function answersFor(wanted: Record<string, string>): AnswerValue[] {
  return PERSONALITY_QUESTIONS.map((q) => (q.a.pole === wanted[q.dimension] ? -2 : 2) as AnswerValue);
}

/** One answer set per possible 4-letter type, each leaning clearly toward its poles. */
function allTypes() {
  const types: Array<{ code: string; answers: AnswerValue[] }> = [];
  const [ei, sn, tf, jp] = DIMENSIONS.map((dimension) => DIMENSION_POLES[dimension]);

  for (const e of ei) {
    for (const s of sn) {
      for (const t of tf) {
        for (const j of jp) {
          types.push({ code: `${e}${s}${t}${j}`, answers: answersFor({ EI: e, SN: s, TF: t, JP: j }) });
        }
      }
    }
  }

  return types;
}

describe("report", () => {
  it("produces all 16 type codes, each mapped to one of the four superpowers", () => {
    const types = allTypes();
    assert.equal(types.length, 16);

    for (const { code, answers } of types) {
      const score = scoreAnswers(answers);
      assert.equal(score.typeCode, code);
      assert.ok(PERSONALITY_PROFILES.includes(score.profile));
    }
  });

  it("builds a complete report with no leftover placeholders in every language and gender", () => {
    for (const { answers } of allTypes()) {
      const score = scoreAnswers(answers);

      for (const locale of ["ar", "en"] as const) {
        for (const gender of ["boy", "girl"] as const) {
          const report = buildReport({ score, name: "Noor", gender, locale });
          const leftover = collectStrings(report).find((text) => /[{}|]/.test(text));

          assert.equal(leftover, undefined, `${locale}/${gender}: placeholder left in "${leftover}"`);
          assert.equal(report.traits.length, 3);
          assert.equal(report.strengths.length, 3);
          assert.equal(report.challenges.length, 3);
          assert.equal(report.parentTips.length, 3);
          assert.equal(report.buildNext.length, 3);
          assert.equal(report.dimensions.length, 4);
          assert.ok(report.overview.includes("Noor"));
        }
      }
    }
  });

  it("gives the feminine form to a girl and the masculine form to a boy in Arabic", () => {
    const score = scoreAnswers(answersFor({ EI: "I", SN: "S", TF: "T", JP: "J" }));
    assert.equal(score.profile, "precision");

    const girl = buildReport({ score, name: "سارة", gender: "girl", locale: "ar" });
    const boy = buildReport({ score, name: "علي", gender: "boy", locale: "ar" });

    assert.ok(girl.tagline.startsWith("دقيقة"));
    assert.ok(boy.tagline.startsWith("دقيق "));
    assert.ok(girl.title.includes("سيّدة"));
    assert.ok(boy.title.includes("سيّد") && !boy.title.includes("سيّدة"));
  });

  it("uses a different variant title for outgoing and reflective children", () => {
    const quiet = buildReport({
      score: scoreAnswers(answersFor({ EI: "I", SN: "S", TF: "T", JP: "J" })),
      name: "Sam",
      gender: "boy",
      locale: "en",
    });
    const social = buildReport({
      score: scoreAnswers(answersFor({ EI: "E", SN: "S", TF: "T", JP: "J" })),
      name: "Sam",
      gender: "boy",
      locale: "en",
    });

    assert.notEqual(quiet.variantTitle, social.variantTitle);
  });

  it("lists the three other powers, never the child's own", () => {
    for (const { answers } of allTypes()) {
      const score = scoreAnswers(answers);
      const next = getPowersToBuild(score.profile, score.scores);

      assert.equal(next.length, 3);
      assert.ok(!next.includes(score.profile));
      assert.equal(new Set(next).size, 3);
    }
  });
});
