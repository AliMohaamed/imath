import {
  DIMENSION_POLES,
  DIMENSIONS,
  PERSONALITY_QUESTIONS,
  QUESTION_COUNT,
  type Dimension,
  type Pole,
} from "./questions";

/** Answer scale: negative favours statement A, positive favours statement B. */
export const ANSWER_VALUES = [-2, -1, 1, 2] as const;
export type AnswerValue = (typeof ANSWER_VALUES)[number];

export const PERSONALITY_PROFILES = ["precision", "speed", "visualisation", "logic"] as const;
export type PersonalityProfile = (typeof PERSONALITY_PROFILES)[number];

export type Strength = "clearly" | "moderately" | "slightly";

/** Items per dimension, and the largest score one dimension can reach (every answer "strong"). */
export const ITEMS_PER_DIMENSION = QUESTION_COUNT / DIMENSIONS.length;
export const MAX_DIMENSION_SCORE = 2 * ITEMS_PER_DIMENSION;

export type DimensionResult = {
  /** Sum of the dimension's items, measured toward its second pole: -6 … +6 with three items. */
  raw: number;
  /** The pole that won. */
  pole: Pole;
  /** Share of the second pole, 0–100. */
  secondPct: number;
  /** Share of the first pole, 0–100. */
  firstPct: number;
  strength: Strength;
};

export type PersonalityScore = {
  dimensions: Record<Dimension, DimensionResult>;
  /** The four winning letters in E/I, S/N, T/F, J/P order, e.g. "ISFJ". */
  typeCode: string;
  profile: PersonalityProfile;
  /** Raw per-dimension scores, as stored and sent to the server. */
  scores: Record<Dimension, number>;
};

export function isAnswerValue(value: unknown): value is AnswerValue {
  return ANSWER_VALUES.includes(value as AnswerValue);
}

export function isCompleteAnswerSet(answers: readonly unknown[]): answers is AnswerValue[] {
  return answers.length === QUESTION_COUNT && answers.every(isAnswerValue);
}

/** "Clearly" from 60% of the maximum score, "moderately" from 30% (4+ and 2+ with three items). */
function getStrength(raw: number): Strength {
  const share = Math.abs(raw) / MAX_DIMENSION_SCORE;
  if (share >= 0.6) return "clearly";
  if (share >= 0.3) return "moderately";
  return "slightly";
}

/**
 * Pure scoring used by both the browser (instant result) and the server (which recomputes
 * from the raw answers so a stored result can't be tampered with).
 */
export function scoreAnswers(answers: readonly AnswerValue[]): PersonalityScore {
  if (!isCompleteAnswerSet(answers)) {
    throw new Error(`Expected ${QUESTION_COUNT} valid answers.`);
  }

  const raw: Record<Dimension, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };
  const anchorSign: Partial<Record<Dimension, number>> = {};

  PERSONALITY_QUESTIONS.forEach((question, index) => {
    const [, second] = DIMENSION_POLES[question.dimension];
    // Picking statement B moves toward B's pole; flip when B is the dimension's first pole.
    const direction = question.b.pole === second ? 1 : -1;
    const contribution = answers[index] * direction;

    raw[question.dimension] += contribution;
    if (question.anchor) {
      anchorSign[question.dimension] = Math.sign(contribution);
    }
  });

  const dimensions = {} as Record<Dimension, DimensionResult>;
  let typeCode = "";

  for (const dimension of DIMENSIONS) {
    const [first, second] = DIMENSION_POLES[dimension];
    const value = raw[dimension];
    // An exact tie is broken by the dimension's anchor question, which is never a zero.
    const sign = value !== 0 ? Math.sign(value) : (anchorSign[dimension] ?? 1);
    const pole = sign > 0 ? second : first;
    const secondPct = Math.round(50 + (value / MAX_DIMENSION_SCORE) * 50);

    dimensions[dimension] = {
      raw: value,
      pole,
      secondPct,
      firstPct: 100 - secondPct,
      strength: getStrength(value),
    };
    typeCode += pole;
  }

  return {
    dimensions,
    typeCode,
    profile: getProfile(dimensions.SN.pole, dimensions.TF.pole, dimensions.JP.pole),
    scores: { EI: raw.EI, SN: raw.SN, TF: raw.TF, JP: raw.JP },
  };
}

/**
 * How strongly the answers point to each superpower, from -12 to +12. Practical (S) and
 * imaginative (N) answers split the four powers; structure (J/P) and decision style (T/F)
 * then separate the two powers within each.
 */
export function getPowerFits(scores: Record<Dimension, number>): Record<PersonalityProfile, number> {
  return {
    precision: -scores.SN - scores.JP,
    speed: -scores.SN + scores.JP,
    visualisation: scores.SN + scores.TF,
    logic: scores.SN - scores.TF,
  };
}

/** The three powers other than the child's own, weakest first: the ones iMath will build next. */
export function getPowersToBuild(profile: PersonalityProfile, scores: Record<Dimension, number>) {
  const fits = getPowerFits(scores);

  return PERSONALITY_PROFILES.filter((power) => power !== profile).sort((a, b) => fits[a] - fits[b]);
}

/** Practical types are split by structure (J/P); imaginative types by decision style (T/F). */
export function getProfile(sn: Pole, tf: Pole, jp: Pole): PersonalityProfile {
  if (sn === "S") {
    return jp === "J" ? "precision" : "speed";
  }

  return tf === "F" ? "visualisation" : "logic";
}
