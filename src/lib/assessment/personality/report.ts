import { personalize, type AssessmentLocale, type ChildGender } from "../common";
import { DIMENSION_POLES, DIMENSIONS, type Dimension, type Pole } from "./questions";
import { POLES, POWER_TRAINING, PROFILES } from "./profiles";
import {
  getPowersToBuild,
  type PersonalityProfile,
  type PersonalityScore,
  type Strength,
} from "./scoring";

export type ReportItem = { title: string; text: string };

export type ReportDimension = {
  dimension: Dimension;
  pole: Pole;
  strength: Strength;
  firstPole: Pole;
  secondPole: Pole;
  firstPct: number;
  secondPct: number;
  title: string;
  text: string;
  bullets: string[];
};

export type PersonalityReport = {
  name: string;
  profile: PersonalityProfile;
  typeCode: string;
  superpower: string;
  title: string;
  variantTitle: string;
  tagline: string;
  overview: string;
  traits: ReportItem[];
  strengths: ReportItem[];
  challenges: ReportItem[];
  mathPower: string;
  buildNext: Array<{ power: PersonalityProfile; name: string; text: string }>;
  parentTips: string[];
  learnAtImath: string;
  closing: string;
  dimensions: ReportDimension[];
};

type Text = Record<AssessmentLocale, string>;

/**
 * Turns a score into fully written report text for one child, so the on-screen result and the
 * PDF always say exactly the same thing.
 */
export function buildReport(params: {
  score: PersonalityScore;
  name: string;
  gender: ChildGender;
  locale: AssessmentLocale;
}): PersonalityReport {
  const { score, name, gender, locale } = params;
  const content = PROFILES[score.profile];
  const say = (text: Text) => personalize(text[locale], gender, name);
  const sayItem = (entry: { title: Text; text: Text }) => ({ title: say(entry.title), text: say(entry.text) });
  const energyPole = score.dimensions.EI.pole === "E" ? "E" : "I";

  return {
    name,
    profile: score.profile,
    typeCode: score.typeCode,
    superpower: say(content.superpower),
    title: say(content.title),
    variantTitle: say(content.variants[energyPole]),
    tagline: say(content.tagline),
    overview: say(content.overview),
    traits: content.traits.map(sayItem),
    strengths: content.strengths.map(sayItem),
    challenges: content.challenges.map(sayItem),
    mathPower: say(content.mathPower),
    buildNext: getPowersToBuild(score.profile, score.scores).map((power) => ({
      power,
      name: say(PROFILES[power].superpower),
      text: say(POWER_TRAINING[power]),
    })),
    parentTips: content.parentTips.map(say),
    learnAtImath: say(content.learnAtImath),
    closing: say(content.closing),
    dimensions: DIMENSIONS.map((dimension) => {
      const result = score.dimensions[dimension];
      const poleContent = POLES[result.pole];

      return {
        dimension,
        pole: result.pole,
        strength: result.strength,
        firstPole: DIMENSION_POLES[dimension][0],
        secondPole: DIMENSION_POLES[dimension][1],
        firstPct: result.firstPct,
        secondPct: result.secondPct,
        title: say(poleContent.title),
        text: say(poleContent.text),
        bullets: poleContent.bullets.map(say),
      };
    }),
  };
}
