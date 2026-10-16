import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createRun,
  getCurrentQuestion,
  getSpeedStars,
  getStartLevel,
  isValidRunState,
  recordAnswer,
  summarizeRun,
  type AnswerRecord,
  type RunState,
} from "../src/lib/assessment/level/engine";

const right = (timeMs = 3000): AnswerRecord => ({ correct: true, timedOut: false, timeMs });
const wrong = (timeMs = 3000): AnswerRecord => ({ correct: false, timedOut: false, timeMs });
const timedOut = (): AnswerRecord => ({ correct: false, timedOut: true, timeMs: 20000 });

/** Plays one round: `correct` right answers first, then wrong ones. */
function playRound(run: RunState, correct: number): RunState {
  let state = run;
  for (let i = 0; i < 3; i += 1) {
    state = recordAnswer(state, i < correct ? right() : wrong());
  }
  return state;
}

/** Plays rounds scoring the given number of correct answers each, until the run ends. */
function play(age: number, scores: number[]): RunState {
  let run = createRun(age, 123);
  for (const score of scores) {
    assert.equal(run.finished, false, "run ended before the script did");
    run = playRound(run, score);
  }
  return run;
}

describe("start level", () => {
  it("starts younger children lower", () => {
    assert.equal(getStartLevel(4), 1);
    assert.equal(getStartLevel(5), 1);
    assert.equal(getStartLevel(6), 2);
    assert.equal(getStartLevel(7), 2);
    assert.equal(getStartLevel(8), 3);
    assert.equal(getStartLevel(18), 3);
  });
});

describe("placement", () => {
  it("passes level 3 and fails level 4 -> placed at 3", () => {
    const run = play(9, [3, 1]);
    assert.equal(run.finished, true);
    assert.equal(summarizeRun(run).placementLevel, 3);
  });

  it("fails level 3 and passes level 2 -> placed at 2, and does not retry 3", () => {
    const run = play(9, [1, 2]);
    assert.equal(run.finished, true);
    assert.deepEqual(run.rounds.map((round) => round.level), [3, 2]);
    assert.equal(summarizeRun(run).placementLevel, 2);
  });

  it("fails level 1 -> placed at 0", () => {
    const run = play(4, [0]);
    assert.equal(run.finished, true);
    assert.equal(summarizeRun(run).placementLevel, 0);
  });

  it("falls to level 1 and fails it -> placed at 0", () => {
    const run = play(9, [0, 1, 1]);
    assert.deepEqual(run.rounds.map((round) => round.level), [3, 2, 1]);
    assert.equal(run.finished, true);
    assert.equal(summarizeRun(run).placementLevel, 0);
  });

  it("passes every level up to 6 -> placed at 6 after four rounds from level 3", () => {
    const run = play(9, [3, 3, 3, 3]);
    assert.equal(run.finished, true);
    assert.deepEqual(run.rounds.map((round) => round.level), [3, 4, 5, 6]);
    assert.equal(summarizeRun(run).placementLevel, 6);
  });

  it("a young child can climb from level 1 to 6 in six rounds", () => {
    const run = play(4, [2, 2, 2, 2, 2, 2]);
    assert.equal(run.finished, true);
    assert.equal(run.rounds.length, 6);
    assert.equal(summarizeRun(run).placementLevel, 6);
  });

  it("needs two of three correct to pass", () => {
    assert.equal(summarizeRun(play(9, [2, 1])).placementLevel, 3);
    assert.equal(summarizeRun(play(9, [1, 1, 1])).placementLevel, 0);
  });

  it("never asks the same level twice, whatever the answers, and always ends", () => {
    // Every combination of round scores (0-3) for up to six rounds.
    const walk = (run: RunState, depth: number) => {
      if (run.finished) {
        const levels = run.rounds.map((round) => round.level);
        assert.equal(new Set(levels).size, levels.length, `repeated level in ${levels}`);
        assert.ok(run.rounds.length <= 6);
        return;
      }

      assert.ok(depth < 8, "run did not end");
      for (const score of [0, 1, 2, 3]) {
        walk(playRound(run, score), depth + 1);
      }
    };

    for (const age of [4, 6, 9]) {
      walk(createRun(age, 7), 0);
    }
  });
});

describe("answers and summary", () => {
  it("moves through the three questions of a round, then on to the next level", () => {
    let run = createRun(9, 5);
    assert.equal(run.level, 3);
    assert.equal(run.slot, 0);

    run = recordAnswer(run, right());
    assert.equal(run.slot, 1);
    run = recordAnswer(run, right());
    assert.equal(run.slot, 2);
    run = recordAnswer(run, wrong());

    assert.equal(run.level, 4);
    assert.equal(run.slot, 0);
    assert.deepEqual(run.current, []);
  });

  it("serves the same question after the state is saved and restored", () => {
    let run = createRun(9, 99);
    run = recordAnswer(run, right());
    const restored = JSON.parse(JSON.stringify(run)) as RunState;

    assert.deepEqual(getCurrentQuestion(restored), getCurrentQuestion(run));
    assert.ok(isValidRunState(restored));
  });

  it("treats a timed-out question as wrong", () => {
    let run = createRun(9, 5);
    run = recordAnswer(run, timedOut());
    run = recordAnswer(run, timedOut());
    run = recordAnswer(run, right());

    assert.equal(run.rounds[0].passed, false);
  });

  it("reports accuracy, per-round results and stays within the API limits", () => {
    const result = summarizeRun(play(9, [3, 2, 1]));

    assert.equal(result.accuracy, Math.round((6 / 9) * 100));
    assert.deepEqual(result.rounds.map((round) => [round.level, round.correct, round.total]), [
      [3, 3, 3],
      [4, 2, 3],
      [5, 1, 3],
    ]);
    assert.ok(result.rounds.length >= 1 && result.rounds.length <= 12);
    assert.ok(result.rounds.every((round) => round.correct <= 10 && round.total <= 10 && round.medianMs <= 600000));
    assert.ok(result.speedStars >= 0 && result.speedStars <= 3);
    assert.ok(result.accuracy >= 0 && result.accuracy <= 100);
  });

  it("ignores answers once the run has finished", () => {
    const run = play(4, [0]);
    assert.equal(recordAnswer(run, right()), run);
  });
});

describe("speed stars", () => {
  it("awards three, two or one star by median time against the level target", () => {
    assert.equal(getSpeedStars(3, 9000), 3);
    assert.equal(getSpeedStars(3, 10000), 3);
    assert.equal(getSpeedStars(3, 15000), 2);
    assert.equal(getSpeedStars(3, 16000), 2);
    assert.equal(getSpeedStars(3, 16001), 1);
    assert.equal(getSpeedStars(0, 1000), 0);
  });

  it("uses only the correct answers of the placement round", () => {
    let run = createRun(9, 1);
    run = recordAnswer(run, right(2000));
    run = recordAnswer(run, wrong(19000));
    run = recordAnswer(run, right(4000));
    run = playRound(run, 0);

    const result = summarizeRun(run);
    assert.equal(result.placementLevel, 3);
    assert.equal(result.speedStars, 3);
  });
});

describe("saved state validation", () => {
  it("accepts a fresh run and rejects broken ones", () => {
    assert.ok(isValidRunState(createRun(9, 1)));
    assert.ok(!isValidRunState({ ...createRun(9, 1), level: 9 }));
    assert.ok(!isValidRunState({ ...createRun(9, 1), slot: 2 }));
    assert.ok(!isValidRunState({ ...createRun(9, 1), seed: 1.5 }));
  });
});
