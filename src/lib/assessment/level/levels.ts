import type { Bilingual } from "../personality/questions";

export const MAX_LEVEL = 6;
export const QUESTIONS_PER_ROUND = 3;
/** A round is passed with at least this many correct answers out of three. */
export const PASS_THRESHOLD = 2;

export type QuestionType =
  | "count"
  | "add10"
  | "sub10"
  | "add20"
  | "sub20"
  | "bond10"
  | "twoByOne"
  | "bond100"
  | "flash3"
  | "twoByTwo"
  | "halfDouble"
  | "flash4"
  | "times"
  | "twoTimesOne"
  | "flashTwo4"
  | "threeDigit"
  | "twoTimesTwo"
  | "flashTwo5";

/** The three question types of each round, in the order they are asked. */
export const LEVEL_SLOTS: Record<number, readonly [QuestionType, QuestionType, QuestionType]> = {
  1: ["count", "add10", "sub10"],
  2: ["add20", "sub20", "bond10"],
  3: ["twoByOne", "bond100", "flash3"],
  4: ["twoByTwo", "halfDouble", "flash4"],
  5: ["times", "twoTimesOne", "flashTwo4"],
  6: ["threeDigit", "twoTimesTwo", "flashTwo5"],
};

/** How long a flashed number stays on screen, by level (flash questions start at level 3). */
export const FLASH_INTERVAL_MS: Record<number, number> = { 3: 1500, 4: 1200, 5: 1500, 6: 1200 };
export const FLASH_GAP_MS = 250;
export const DOTS_SHOW_MS = 2000;
export const FLASH_ANSWER_LIMIT_MS = 15000;

export function getTimeLimitMs(level: number) {
  return 20000 + (level - 1) * 2000;
}

/** A child answering a correct question in this median time (or faster) earns three stars. */
export const SPEED_TARGET_MS: Record<number, number> = {
  1: 6000,
  2: 8000,
  3: 10000,
  4: 14000,
  5: 16000,
  6: 20000,
};

export type LevelContent = {
  name: Bilingual;
  canDo: [Bilingual, Bilingual, Bilingual];
  next: [Bilingual, Bilingual, Bilingual];
};

const t = (en: string, ar: string): Bilingual => ({ en, ar });

/** Level 0 means the child hasn't passed level 1 yet; it is framed as a friendly starting point. */
export const LEVELS: Record<number, LevelContent> = {
  0: {
    name: t("Ready to Start", "جاهز للبداية"),
    canDo: [
      t("Ready to learn with a patient tutor", "جاهز للتعلّم مع معلّم صبور"),
      t("Eager to try new number games", "متحمّس لتجربة ألعاب الأرقام"),
      t("A fresh start with no bad habits to unlearn", "بداية جديدة دون عادات خاطئة"),
    ],
    next: [
      t("Recognising small quantities quickly", "التعرّف على الكميات الصغيرة بسرعة"),
      t("Adding and subtracting within 10", "الجمع والطرح داخل 10"),
      t("Building confidence with numbers", "بناء الثقة مع الأرقام"),
    ],
  },
  1: {
    name: t("Number Explorer", "مستكشف الأرقام"),
    canDo: [
      t("Recognises up to 10 objects at a glance", "التعرّف على حتى 10 أشياء بنظرة واحدة"),
      t("Adds within 10", "الجمع داخل 10"),
      t("Subtracts within 10", "الطرح داخل 10"),
    ],
    next: [
      t("Adding and subtracting within 20", "الجمع والطرح داخل 20"),
      t("Making 10 quickly", "تكوين العدد 10 بسرعة"),
      t("Working with carrying", "الجمع مع الحمل"),
    ],
  },
  2: {
    name: t("Quick Adder", "الجامع السريع"),
    canDo: [
      t("Adds and subtracts within 20", "الجمع والطرح داخل 20"),
      t("Finds the missing number to make 10", "إيجاد العدد الناقص لتكوين 10"),
      t("Bridges through 10 with ease", "العبور عبر العدد 10 بسهولة"),
    ],
    next: [
      t("Working with two-digit numbers", "العمل مع الأعداد من رقمين"),
      t("Making 100 with tens", "تكوين 100 بالعشرات"),
      t("Following flashed number sequences", "متابعة سلاسل الأرقام الخاطفة"),
    ],
  },
  3: {
    name: t("Two-Digit Starter", "بطل العددين"),
    canDo: [
      t("Adds and subtracts one-digit numbers to two-digit numbers", "جمع وطرح عدد من رقم واحد مع عدد من رقمين"),
      t("Makes 100 using tens", "تكوين 100 باستخدام العشرات"),
      t("Adds three flashed digits", "جمع ثلاثة أرقام خاطفة"),
    ],
    next: [
      t("Adding and subtracting two-digit numbers with carrying", "جمع وطرح الأعداد من رقمين مع الحمل والاستلاف"),
      t("Doubles and halves", "الضعف والنصف"),
      t("Longer flash sequences with subtraction", "سلاسل خاطفة أطول مع الطرح"),
    ],
  },
  4: {
    name: t("Mental Builder", "البنّاء الذهني"),
    canDo: [
      t("Adds and subtracts two-digit numbers with carrying", "جمع وطرح الأعداد من رقمين مع الحمل والاستلاف"),
      t("Finds doubles and halves", "إيجاد الضعف والنصف"),
      t("Follows four flashed digits, including subtraction", "متابعة أربعة أرقام خاطفة مع الطرح"),
    ],
    next: [
      t("Times tables up to 9 × 9", "جدول الضرب حتى 9 × 9"),
      t("Multiplying a two-digit by a one-digit number", "ضرب عدد من رقمين في عدد من رقم واحد"),
      t("Flashing two-digit numbers", "الأرقام الخاطفة من رقمين"),
    ],
  },
  5: {
    name: t("Speed Calculator", "الحاسب السريع"),
    canDo: [
      t("Recalls the times tables", "استرجاع جدول الضرب"),
      t("Multiplies two-digit by one-digit numbers", "ضرب عدد من رقمين في عدد من رقم واحد"),
      t("Adds four flashed two-digit numbers", "جمع أربعة أعداد خاطفة من رقمين"),
    ],
    next: [
      t("Adding and subtracting three-digit numbers", "جمع وطرح الأعداد من ثلاثة أرقام"),
      t("Easy two-digit multiplication", "ضرب أعداد من رقمين بسهولة"),
      t("Long mixed flash chains", "سلاسل خاطفة طويلة ومتنوعة"),
    ],
  },
  6: {
    name: t("Mental Math Champion", "بطل الحساب الذهني"),
    canDo: [
      t("Adds and subtracts three-digit numbers", "جمع وطرح الأعداد من ثلاثة أرقام"),
      t("Multiplies two-digit numbers such as 25 × 12", "ضرب أعداد من رقمين مثل 25 × 12"),
      t("Tracks five flashed two-digit numbers, with subtraction", "متابعة خمسة أعداد خاطفة من رقمين مع الطرح"),
    ],
    next: [
      t("Advanced mental abacus techniques", "تقنيات متقدّمة في المعداد الذهني"),
      t("Even faster speed with the same accuracy", "سرعة أكبر مع الدقة نفسها"),
      t("Challenge rounds and friendly competitions", "جولات تحدٍّ ومنافسات ودّية"),
    ],
  },
};
