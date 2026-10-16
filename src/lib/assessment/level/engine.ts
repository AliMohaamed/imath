import { generateQuestion, type Question } from "./generator";
import {
  LEVEL_SLOTS,
  MAX_LEVEL,
  PASS_THRESHOLD,
  QUESTIONS_PER_ROUND,
  SPEED_TARGET_MS,
} from "./levels";

export type AnswerRecord = {
  correct: boolean;
  timedOut: boolean;
  /** Time taken to answer once the question was ready; the full limit when it timed out. */
  timeMs: number;
};

export type RoundRecord = {
  level: number;
  answers: AnswerRecord[];
  passed: boolean;
};

export type RunState = {
  seed: number;
  level: number;
  /** Position in the current round: 0, 1 or 2. */
  slot: number;
  /** Answers given so far in the current round. */
  current: AnswerRecord[];
  rounds: RoundRecord[];
  passed: number[];
  failed: number[];
  finished: boolean;
};

export type LevelResult = {
  placementLevel: number;
  accuracy: number;
  speedStars: number;
  rounds: Array<{ level: number; correct: number; total: number; medianMs: number }>;
};

/** Younger children start lower so nobody begins with questions that are far too hard. */
export function getStartLevel(age: number) {
  if (age <= 5) return 1;
  if (age <= 7) return 2;
  return 3;
}

export function createRun(age: number, seed: number): RunState {
  return {
    seed,
    level: getStartLevel(age),
    slot: 0,
    current: [],
    rounds: [],
    passed: [],
    failed: [],
    finished: false,
  };
}

export function getCurrentQuestion(run: RunState): Question {
  return generateQuestion(run.seed, run.level, run.slot);
}

/**
 * After a round: a pass moves up, a miss moves down. The run stops when the next level up or
 * down has already been played, which pins the child between a level they passed and one
 * they didn't, so no level is ever asked twice.
 */
function nextLevel(level: number, passed: boolean, passedLevels: number[], failedLevels: number[]) {
  if (passed) {
    const up = level + 1;
    return level >= MAX_LEVEL || failedLevels.includes(up) || passedLevels.includes(up) ? null : up;
  }

  const down = level - 1;
  return level <= 1 || passedLevels.includes(down) || failedLevels.includes(down) ? null : down;
}

export function recordAnswer(run: RunState, answer: AnswerRecord): RunState {
  if (run.finished) {
    return run;
  }

  const current = [...run.current, answer];

  if (current.length < QUESTIONS_PER_ROUND) {
    return { ...run, current, slot: run.slot + 1 };
  }

  const passed = current.filter((entry) => entry.correct).length >= PASS_THRESHOLD;
  const rounds = [...run.rounds, { level: run.level, answers: current, passed }];
  const passedLevels = passed ? [...run.passed, run.level] : run.passed;
  const failedLevels = passed ? run.failed : [...run.failed, run.level];
  const next = nextLevel(run.level, passed, passedLevels, failedLevels);

  return {
    ...run,
    rounds,
    passed: passedLevels,
    failed: failedLevels,
    current: [],
    slot: 0,
    level: next ?? run.level,
    finished: next === null,
  };
}

function median(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function getPlacementLevel(run: RunState) {
  return run.passed.length ? Math.max(...run.passed) : 0;
}

/** Three stars for a median answer time at or under the level's target, two up to 1.6x, otherwise one. */
export function getSpeedStars(placement: number, medianMs: number) {
  if (placement === 0) return 0;

  const target = SPEED_TARGET_MS[placement];
  if (medianMs <= target) return 3;
  if (medianMs <= target * 1.6) return 2;
  return 1;
}

export function summarizeRun(run: RunState): LevelResult {
  const placementLevel = getPlacementLevel(run);
  const answers = run.rounds.flatMap((round) => round.answers);
  const correctCount = answers.filter((entry) => entry.correct).length;

  const placementRound = run.rounds.find((round) => round.level === placementLevel && round.passed);
  const correctTimes = placementRound?.answers.filter((entry) => entry.correct).map((entry) => entry.timeMs) ?? [];

  return {
    placementLevel,
    accuracy: answers.length ? Math.round((correctCount / answers.length) * 100) : 0,
    speedStars: getSpeedStars(placementLevel, median(correctTimes)),
    rounds: run.rounds.map((round) => ({
      level: round.level,
      correct: round.answers.filter((entry) => entry.correct).length,
      total: round.answers.length,
      medianMs: Math.round(median(round.answers.map((entry) => entry.timeMs))),
    })),
  };
}

export function isValidRunState(value: RunState) {
  return (
    typeof value === "object" &&
    value !== null &&
    Number.isInteger(value.seed) &&
    Number.isInteger(value.level) &&
    value.level >= 1 &&
    value.level <= MAX_LEVEL &&
    Number.isInteger(value.slot) &&
    value.slot >= 0 &&
    value.slot < QUESTIONS_PER_ROUND &&
    Boolean(LEVEL_SLOTS[value.level]) &&
    Array.isArray(value.current) &&
    value.current.length === value.slot &&
    Array.isArray(value.rounds) &&
    Array.isArray(value.passed) &&
    Array.isArray(value.failed) &&
    typeof value.finished === "boolean"
  );
}
