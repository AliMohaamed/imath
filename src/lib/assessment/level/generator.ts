import {
  DOTS_SHOW_MS,
  FLASH_ANSWER_LIMIT_MS,
  FLASH_INTERVAL_MS,
  getTimeLimitMs,
  LEVEL_SLOTS,
  type QuestionType,
} from "./levels";

export type QuestionKind = "dots" | "arith" | "flash";

export type Question = {
  /** Stable per level and position, so a resumed run shows the same question. */
  id: string;
  level: number;
  slot: number;
  type: QuestionType;
  kind: QuestionKind;
  answer: number;
  /** Time allowed to answer once the question is ready (after any dots or flashed numbers). */
  timeLimitMs: number;
  /** arith: the whole sum, with `?` where the answer goes, e.g. "47 + 8 = ?". */
  expression?: string;
  /** arith worded questions ("half of 46"), shown through the translations instead of `expression`. */
  phrase?: { key: "half" | "double"; value: number };
  /** dots: which of the 12 grid cells hold a dot. */
  dots?: number[];
  showMs?: number;
  /** flash: the numbers shown one by one; negative numbers are subtracted. */
  steps?: number[];
  intervalMs?: number;
};

export const DOT_GRID_CELLS = 12;
export const MINUS = "−";

type Rng = () => number;

/** Small, fast, seedable generator, so the same seed always produces the same questions. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mixSeed(...values: number[]) {
  let hash = 2166136261;
  for (const value of values) {
    hash = Math.imul(hash ^ (value | 0), 16777619);
    hash ^= hash >>> 13;
  }
  return hash >>> 0;
}

const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
const pick = <T,>(rng: Rng, items: readonly T[]) => items[int(rng, 0, items.length - 1)];

function shuffle<T>(rng: Rng, items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = int(rng, 0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type Core = Pick<Question, "kind" | "answer"> &
  Partial<Pick<Question, "expression" | "phrase" | "dots" | "steps">>;

const sum = (op: string, a: number, b: number, answer: number): Core => ({
  kind: "arith",
  expression: `${a} ${op} ${b} = ?`,
  answer,
});

/** Flashed numbers: never the same number twice in a row, never a negative running total. */
function buildFlash(rng: Rng, options: { count: number; min: number; max: number; withMinus: boolean }): number[] {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const steps: number[] = [int(rng, options.min, options.max)];
    let total = steps[0];

    for (let i = 1; i < options.count; i += 1) {
      const value = int(rng, options.min, options.max);
      const subtract = options.withMinus && rng() < 0.4 && total - value >= 1;
      const signed = subtract ? -value : value;

      if (Math.abs(signed) === Math.abs(steps[i - 1])) {
        break;
      }

      steps.push(signed);
      total += signed;
    }

    const hasMinus = steps.some((step) => step < 0);
    if (steps.length === options.count && total >= 1 && (!options.withMinus || hasMinus)) {
      return steps;
    }
  }

  // Practically unreachable; keeps the result valid rather than looping forever.
  return options.withMinus ? [options.max, -options.min, options.max - 1, options.min + 1, options.min].slice(0, options.count) : Array.from({ length: options.count }, (_, i) => options.min + (i % 2));
}

const BUILDERS: Record<QuestionType, (rng: Rng) => Core> = {
  count(rng) {
    const count = int(rng, 3, 10);
    const cells = shuffle(rng, Array.from({ length: DOT_GRID_CELLS }, (_, i) => i)).slice(0, count);
    return { kind: "dots", dots: cells.sort((a, b) => a - b), answer: count };
  },

  add10(rng) {
    const a = int(rng, 1, 9);
    const b = int(rng, 1, 10 - a);
    return sum("+", a, b, a + b);
  },

  sub10(rng) {
    const a = int(rng, 3, 10);
    const b = int(rng, 1, a - 1);
    return sum(MINUS, a, b, a - b);
  },

  add20(rng) {
    const a = int(rng, 6, 9);
    const b = int(rng, 11 - a, 9);
    return sum("+", a, b, a + b);
  },

  sub20(rng) {
    const a = int(rng, 11, 18);
    const b = int(rng, a - 10 + 1, 9);
    return sum(MINUS, a, b, a - b);
  },

  bond10(rng) {
    const x = int(rng, 1, 9);
    return { kind: "arith", expression: `${x} + ? = 10`, answer: 10 - x };
  },

  twoByOne(rng) {
    const forceBridge = rng() < 0.6;

    if (rng() < 0.5) {
      const b = int(rng, 2, 9);
      const a = forceBridge ? int(rng, 1, 8) * 10 + int(rng, 10 - b, 9) : int(rng, 11, 89);
      return sum("+", a, b, a + b);
    }

    const b = int(rng, 3, 9);
    const a = forceBridge ? int(rng, 2, 8) * 10 + int(rng, 0, b - 1) : int(rng, 21, 89);
    return sum(MINUS, a, b, a - b);
  },

  bond100(rng) {
    const x = int(rng, 1, 9) * 10;
    return { kind: "arith", expression: `${x} + ? = 100`, answer: 100 - x };
  },

  flash3(rng) {
    return { kind: "flash", steps: buildFlash(rng, { count: 3, min: 1, max: 9, withMinus: false }), answer: 0 };
  },

  twoByTwo(rng) {
    if (rng() < 0.5) {
      const aOnes = int(rng, 2, 9);
      const bOnes = int(rng, 10 - aOnes, 9);
      const a = int(rng, 1, 6) * 10 + aOnes;
      const b = int(rng, 1, 6) * 10 + bOnes;
      return sum("+", a, b, a + b);
    }

    const bOnes = int(rng, 1, 9);
    const aOnes = int(rng, 0, bOnes - 1);
    const aTens = int(rng, 3, 9);
    const a = aTens * 10 + aOnes;
    const b = int(rng, 1, aTens - 1) * 10 + bOnes;
    return sum(MINUS, a, b, a - b);
  },

  halfDouble(rng) {
    if (rng() < 0.5) {
      const n = 2 * int(rng, 10, 49);
      return { kind: "arith", phrase: { key: "half", value: n }, answer: n / 2 };
    }

    const m = int(rng, 11, 49);
    return { kind: "arith", phrase: { key: "double", value: m }, answer: m * 2 };
  },

  flash4(rng) {
    return { kind: "flash", steps: buildFlash(rng, { count: 4, min: 1, max: 9, withMinus: true }), answer: 0 };
  },

  times(rng) {
    const a = int(rng, 2, 9);
    const b = int(rng, 3, 9);
    return sum("×", a, b, a * b);
  },

  twoTimesOne(rng) {
    let a = int(rng, 11, 39);
    if (a % 10 === 0) {
      a += 1;
    }
    const b = int(rng, 2, 5);
    return sum("×", a, b, a * b);
  },

  flashTwo4(rng) {
    return { kind: "flash", steps: buildFlash(rng, { count: 4, min: 10, max: 39, withMinus: false }), answer: 0 };
  },

  threeDigit(rng) {
    if (rng() < 0.5) {
      const aOnes = int(rng, 2, 9);
      const bOnes = int(rng, 10 - aOnes, 9);
      const a = int(rng, 1, 6) * 100 + int(rng, 0, 9) * 10 + aOnes;
      const b = int(rng, 1, 6) * 100 + int(rng, 0, 9) * 10 + bOnes;
      return sum("+", a, b, a + b);
    }

    const bOnes = int(rng, 1, 9);
    const aOnes = int(rng, 0, bOnes - 1);
    const aHundreds = int(rng, 3, 9);
    const a = aHundreds * 100 + int(rng, 0, 9) * 10 + aOnes;
    const b = int(rng, 1, aHundreds - 1) * 100 + int(rng, 0, 9) * 10 + bOnes;
    return sum(MINUS, a, b, a - b);
  },

  twoTimesTwo(rng) {
    const a = int(rng, 12, 25);
    const b = pick(rng, [11, 12, 15] as const);
    return sum("×", a, b, a * b);
  },

  flashTwo5(rng) {
    return { kind: "flash", steps: buildFlash(rng, { count: 5, min: 10, max: 59, withMinus: true }), answer: 0 };
  },
};

/**
 * Builds one question. The same (seed, level, slot) always gives the same question, which is
 * what lets a child leave halfway and come back to exactly where they were.
 */
export function generateQuestion(seed: number, level: number, slot: number): Question {
  const type = LEVEL_SLOTS[level]?.[slot];
  if (!type) {
    throw new Error(`No question for level ${level}, slot ${slot}.`);
  }

  const core = BUILDERS[type](createRng(mixSeed(seed, level, slot)));
  const base = { id: `${level}-${slot}`, level, slot, type, timeLimitMs: getTimeLimitMs(level) };

  if (core.kind === "flash") {
    const steps = core.steps ?? [];
    return {
      ...base,
      kind: "flash",
      steps,
      intervalMs: FLASH_INTERVAL_MS[level],
      timeLimitMs: FLASH_ANSWER_LIMIT_MS,
      answer: steps.reduce((total, step) => total + step, 0),
    };
  }

  if (core.kind === "dots") {
    return { ...base, kind: "dots", dots: core.dots, showMs: DOTS_SHOW_MS, answer: core.answer };
  }

  return { ...base, kind: "arith", expression: core.expression, phrase: core.phrase, answer: core.answer };
}
