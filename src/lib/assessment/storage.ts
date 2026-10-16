export type AssessmentKind = "personality" | "level";
export type AssessmentStatus = "none" | "in_progress" | "completed";

/** Anything saved must carry a `phase` so the hub can tell progress from a finished result. */
export type StoredProgress = { phase: string };

type Envelope<T> = {
  v: number;
  savedAt: number;
  data: T;
};

// Bump a kind's version whenever its question bank or state shape changes, so old saves are ignored.
// Personality v2: the bank went from 20 to 12 questions.
const STORAGE_VERSIONS: Record<AssessmentKind, number> = { personality: 2, level: 1 };
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
// Filling in the details form doesn't count as starting the test (matches the resume prompt in each flow).
const IDLE_PHASES = new Set(["intro", "none", "info"]);
const RESULT_PHASE = "result";

export const STORAGE_CHANGE_EVENT = "imath:assessment-storage";

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
  }
}

function storageKey(kind: AssessmentKind) {
  return `imath.assessment.${kind}.v${STORAGE_VERSIONS[kind]}`;
}

function getStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function loadProgress<T extends StoredProgress>(kind: AssessmentKind, now = Date.now()) {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(storageKey(kind));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Envelope<T>;
    const isValid =
      parsed?.v === STORAGE_VERSIONS[kind] &&
      typeof parsed.savedAt === "number" &&
      typeof parsed.data?.phase === "string";

    if (!isValid || now - parsed.savedAt > MAX_AGE_MS) {
      storage.removeItem(storageKey(kind));
      return null;
    }

    return { data: parsed.data, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

export function saveProgress<T extends StoredProgress>(kind: AssessmentKind, data: T) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    const envelope: Envelope<T> = { v: STORAGE_VERSIONS[kind], savedAt: Date.now(), data };
    storage.setItem(storageKey(kind), JSON.stringify(envelope));
    notifyChange();
  } catch {
    // Storage can be full or blocked; the assessment still works, it just can't resume.
  }
}

export function clearProgress(kind: AssessmentKind) {
  try {
    getStorage()?.removeItem(storageKey(kind));
    notifyChange();
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

export function getAssessmentStatus(kind: AssessmentKind): AssessmentStatus {
  const saved = loadProgress(kind);
  if (!saved) {
    return "none";
  }

  if (saved.data.phase === RESULT_PHASE) {
    return "completed";
  }

  return IDLE_PHASES.has(saved.data.phase) ? "none" : "in_progress";
}

const PREFILL_KEY = "imath.assessment.prefill.v1";

/** Details a family has already typed into an assessment. */
export type FamilyDetails = LevelPrefill & { parentName?: string };

export type LevelPrefill = {
  studentName: string;
  studentAge: number;
  phoneCountryCode: string;
  phoneNumber: string;
};

/** Lets the personality result hand a family's details to the level test so they aren't typed twice. */
export function savePrefill(prefill: LevelPrefill) {
  try {
    window.sessionStorage.setItem(PREFILL_KEY, JSON.stringify(prefill));
  } catch {
    // Not essential: the family can type the details again.
  }
}

export function consumePrefill(): LevelPrefill | null {
  try {
    const raw = window.sessionStorage.getItem(PREFILL_KEY);
    window.sessionStorage.removeItem(PREFILL_KEY);
    return raw ? (JSON.parse(raw) as LevelPrefill) : null;
  } catch {
    return null;
  }
}

const BOOKING_PREFILL_KEY = "imath.assessment.booking-prefill.v1";

export type BookingPrefill = Partial<FamilyDetails> & {
  previousExperience?: "none" | "some" | "advanced";
  source: string;
};

/** Hands an assessment result's details to the booking form on the home page. */
export function saveBookingPrefill(prefill: BookingPrefill) {
  try {
    window.sessionStorage.setItem(BOOKING_PREFILL_KEY, JSON.stringify(prefill));
  } catch {
    // Not essential: the family can type the details again.
  }
}

export function consumeBookingPrefill(): BookingPrefill | null {
  try {
    const raw = window.sessionStorage.getItem(BOOKING_PREFILL_KEY);
    window.sessionStorage.removeItem(BOOKING_PREFILL_KEY);
    return raw ? (JSON.parse(raw) as BookingPrefill) : null;
  } catch {
    return null;
  }
}

/** A level result says how much mental math a child already knows, which the booking form asks too. */
export function experienceForLevel(level: number): "none" | "some" | "advanced" {
  if (level <= 1) return "none";
  return level <= 4 ? "some" : "advanced";
}
