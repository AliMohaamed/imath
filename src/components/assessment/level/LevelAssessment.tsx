"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeDialog } from "@/components/assessment/ResumeDialog";
import { EMPTY_LEVEL_INFO, hasAnyLevelInfo, LevelInfoStep, type LevelInfoDraft } from "@/components/assessment/level/LevelInfoStep";
import { LevelResultView } from "@/components/assessment/level/LevelResultView";
import { QuestionPlayer } from "@/components/assessment/level/QuestionPlayer";
import { trackEvent } from "@/lib/analytics";
import { completeSubmission, postAssessment } from "@/lib/assessment/client";
import { createClientToken, type AssessmentLocale } from "@/lib/assessment/common";
import {
  createRun,
  getCurrentQuestion,
  isValidRunState,
  recordAnswer,
  summarizeRun,
  type AnswerRecord,
  type LevelResult,
  type RunState,
} from "@/lib/assessment/level/engine";
import type { Question } from "@/lib/assessment/level/generator";
import { QUESTIONS_PER_ROUND } from "@/lib/assessment/level/levels";
import { clearProgress, consumePrefill, loadProgress, saveProgress } from "@/lib/assessment/storage";
import { cn } from "@/lib/utils";

type Phase = "intro" | "info" | "howto" | "playing" | "result";
type Transition = "start" | "up" | "down";

type State = {
  phase: Phase;
  info: LevelInfoDraft;
  run: RunState | null;
  result: LevelResult | null;
  clientToken: string;
  submissionId?: string;
  /** True once the server has stored the finished result. */
  synced: boolean;
};

const TRANSITION_MS = 1600;

/** The warm-up question: easy, fixed, and never counted. */
const PRACTICE_QUESTION: Question = {
  id: "practice",
  level: 1,
  slot: 0,
  type: "add10",
  kind: "arith",
  expression: "2 + 1 = ?",
  answer: 3,
  timeLimitMs: 30000,
};

function createInitialState(): State {
  const prefill = consumePrefill();

  return {
    phase: "intro",
    info: prefill
      ? {
          studentName: prefill.studentName,
          studentAge: prefill.studentAge,
          phoneCountryCode: prefill.phoneCountryCode,
          phoneNumber: prefill.phoneNumber,
        }
      : EMPTY_LEVEL_INFO,
    run: null,
    result: null,
    clientToken: createClientToken(),
    synced: false,
  };
}

/** Saved data can be stale or edited by hand, so only trust it if it has the exact expected shape. */
function isValidState(value: State): boolean {
  const phases: Phase[] = ["intro", "info", "howto", "playing", "result"];

  return (
    phases.includes(value.phase) &&
    typeof value.clientToken === "string" &&
    typeof value.info === "object" &&
    value.info !== null &&
    (value.run === null || isValidRunState(value.run)) &&
    (value.phase !== "playing" || (value.run !== null && !value.run.finished)) &&
    (value.phase !== "result" ||
      (value.result !== null &&
        typeof value.result === "object" &&
        Number.isInteger(value.result.placementLevel) &&
        value.result.placementLevel >= 0 &&
        value.result.placementLevel <= 6 &&
        Array.isArray(value.result.rounds) &&
        value.result.rounds.length > 0))
  );
}

/** Only a test that has actually begun counts; a half-filled form isn't worth interrupting a visitor for. */
function hasProgress(state: State) {
  return state.phase === "howto" || state.phase === "playing";
}

/** Saved state to start from: a begun test resumes, anything else starts at the intro with the typed details kept. */
function restoreState(saved: State): State {
  return hasProgress(saved) || saved.phase === "result" ? saved : { ...saved, phase: "intro" };
}

// Saved progress only exists in the browser, so the flow mounts after hydration.
const subscribeToNothing = () => () => {};

export function LevelAssessment() {
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );

  return isClient ? <LevelFlow /> : <div className="min-h-[60vh]" aria-hidden="true" />;
}

function LevelFlow() {
  const locale = useLocale() as AssessmentLocale;
  const t = useTranslations("Assessment.level");

  const [saved] = useState(() => {
    const stored = loadProgress<State>("level");
    return stored && isValidState(stored.data) ? stored.data : null;
  });
  const [state, setState] = useState<State>(() => (saved ? restoreState(saved) : createInitialState()));
  const [showResume, setShowResume] = useState(() => (saved ? hasProgress(saved) : false));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transition, setTransition] = useState<Transition | null>(null);

  const syncing = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (showResume || state.phase === "intro" || (state.phase === "info" && !hasAnyLevelInfo(state.info))) {
      return;
    }

    saveProgress("level", state);
  }, [state, showResume]);

  // Move focus to the new step so keyboard and screen-reader users land at its start.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    headingRef.current?.focus();
  }, [state.phase]);

  useEffect(() => {
    if (showResume) {
      trackEvent("assessment_resume_shown", { type: "level", phase: state.phase });
    }
    // Only the moment the dialog appears matters, not later phase changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResume]);

  useEffect(() => {
    if (!transition) {
      return;
    }

    const timer = setTimeout(() => setTransition(null), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [transition]);

  // Store the finished result. Runs again on a later visit if the first attempt never got through.
  useEffect(() => {
    if (state.phase !== "result" || state.synced || syncing.current || !state.result) {
      return;
    }

    syncing.current = true;
    const result = state.result;

    completeSubmission({
      submissionId: state.submissionId,
      start: () => buildInfoBody({ ...state, submissionId: undefined }, locale),
      complete: (submissionId) => ({
        action: "complete",
        type: "level",
        locale,
        clientToken: state.clientToken,
        submissionId,
        result,
      }),
    })
      .then((submissionId) => {
        if (submissionId) {
          setState((current) => ({ ...current, submissionId, synced: true }));
        }
      })
      .finally(() => {
        syncing.current = false;
      });
  }, [state, locale]);

  const restart = () => {
    clearProgress("level");
    setError(null);
    setTransition(null);
    setState(createInitialState());
  };

  const handleResumeRestart = () => {
    trackEvent("assessment_resume_restart", { type: "level" });
    restart();
    setShowResume(false);
  };

  const handleResumeContinue = () => {
    trackEvent("assessment_resume_continue", { type: "level", phase: state.phase });
    setShowResume(false);
  };

  const start = () => {
    trackEvent("assessment_start", { type: "level", from: "intro" });
    setState((current) => ({ ...current, phase: "info" }));
  };

  const submitInfo = async () => {
    setError(null);
    setSubmitting(true);

    // The record is created when the form is first completed so a family who drops out can still be contacted.
    // Coming back to edit the details updates that record instead of leaving the old ones on file.
    try {
      const response = await postAssessment(buildInfoBody(state, locale));

      if (response.ok && response.submissionId) {
        const submissionId = response.submissionId;
        setState((current) => ({ ...current, submissionId }));
      } else if (response.status === 404) {
        // The record no longer exists; a fresh one is created when the result is stored.
        setState((current) => ({ ...current, submissionId: undefined }));
      } else if (response.status === 400) {
        setError(t("errors.generic"));
        return;
      }
      // Rate limits and server errors never block the child: the result is still shown and stored later.
    } catch {
      // Offline or the server is down: carry on, the result is still shown and stored later.
    } finally {
      setSubmitting(false);
    }

    trackEvent("assessment_info_completed", { type: "level" });
    setState((current) => ({ ...current, phase: "howto" }));
  };

  const finishPractice = () => {
    const age = Number(state.info.studentAge) || 8;

    setTransition("start");
    setState((current) => ({
      ...current,
      phase: "playing",
      run: createRun(age, Math.floor(Math.random() * 2 ** 31)),
    }));
  };

  const handleAnswer = (answer: AnswerRecord) => {
    const run = state.run;
    if (!run) {
      return;
    }

    const next = recordAnswer(run, answer);
    trackEvent("assessment_question_answered", { type: "level", level: run.level, correct: answer.correct });

    if (next.rounds.length > run.rounds.length) {
      const round = next.rounds[next.rounds.length - 1];
      trackEvent("level_round_result", { level: round.level, correct: round.answers.filter((entry) => entry.correct).length });
    }

    if (next.finished) {
      const result = summarizeRun(next);
      trackEvent("assessment_completed", { type: "level", level: result.placementLevel });
      setState((current) => ({ ...current, run: next, result, phase: "result" }));
      return;
    }

    if (next.rounds.length > run.rounds.length) {
      setTransition(next.level > run.level ? "up" : "down");
    }

    setState((current) => ({ ...current, run: next }));
  };

  const studentName = state.info.studentName.trim();
  const question = state.run && state.phase === "playing" ? getCurrentQuestion(state.run) : null;

  return (
    <section className="bg-gradient-to-b from-brand-orange/5 to-white py-10 md:py-16" aria-live="polite">
      {showResume ? <ResumeDialog onContinue={handleResumeContinue} onRestart={handleResumeRestart} /> : null}

      <div className="container mx-auto max-w-2xl px-4">
        {state.phase === "intro" ? (
          <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-sm md:p-10">
            <Image src="/assessment/rocket.png" alt="" width={112} height={112} className="mx-auto h-28 w-28" priority />
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange/10 px-4 py-2 text-xs font-black text-brand-orange">
                <Clock className="h-3.5 w-3.5" />
                {t("intro.duration")}
              </div>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-black tracking-tight text-slate-900 outline-none md:text-4xl">
                {t("intro.title")}
              </h1>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">{t("intro.description")}</p>
              <p className="text-sm font-bold text-brand-violet">{t("intro.tip")}</p>
            </div>
            <Button size="lg" className="bg-brand-orange px-8 text-white hover:bg-brand-orange/90" onClick={start}>
              {t("intro.cta")}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        ) : null}

        {state.phase === "info" ? (
          <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="space-y-2">
              <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-black tracking-tight text-slate-900 outline-none md:text-3xl">
                {t("info.title")}
              </h1>
              <p className="text-sm leading-relaxed text-slate-600">{t("info.description")}</p>
            </div>
            <LevelInfoStep
              info={state.info}
              submitting={submitting}
              error={error}
              onChange={(info) => setState((current) => ({ ...current, info }))}
              onSubmit={submitInfo}
            />
          </div>
        ) : null}

        {state.phase === "howto" ? (
          <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-8">
            <div className="space-y-2 text-center">
              <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-black tracking-tight text-slate-900 outline-none md:text-3xl">
                {t("howto.title")}
              </h1>
              <p className="text-sm leading-relaxed text-slate-600">{t("howto.text")}</p>
            </div>
            <QuestionPlayer key="practice" question={PRACTICE_QUESTION} onDone={finishPractice} />
          </div>
        ) : null}

        {state.phase === "playing" && state.run && question ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-full bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200">
              <h1 ref={headingRef} tabIndex={-1} className="text-sm font-black text-brand-violet outline-none">
                {t("play.level", { level: state.run.level })}
              </h1>
              <div className="flex items-center gap-2" role="img" aria-label={t("play.question", { current: state.run.slot + 1 })}>
                {Array.from({ length: QUESTIONS_PER_ROUND }, (_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-3 w-3 rounded-full transition-colors",
                      index < state.run!.slot ? "bg-brand-violet" : index === state.run!.slot ? "bg-brand-orange" : "bg-slate-200"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-8">
              {transition ? (
                <TransitionCard kind={transition} />
              ) : (
                <QuestionPlayer key={`${state.run.rounds.length}-${state.run.slot}`} question={question} onDone={handleAnswer} />
              )}
            </div>
          </div>
        ) : null}

        {state.phase === "result" && state.result ? (
          <LevelResultView ref={headingRef} name={studentName}
            result={state.result}
            family={{
              studentName,
              studentAge: Number(state.info.studentAge) || 8,
              phoneCountryCode: state.info.phoneCountryCode,
              phoneNumber: state.info.phoneNumber,
            }}
            onRetake={restart} />
        ) : null}
      </div>
    </section>
  );

}

function TransitionCard({ kind }: { kind: Transition }) {
  const t = useTranslations("Assessment.level.play");

  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center gap-4 text-center" aria-live="assertive">
      <Image
        src={kind === "up" ? "/assessment/rocket.png" : kind === "down" ? "/assessment/seedling.png" : "/assessment/glowing-star.png"}
        alt=""
        width={128}
        height={128}
        className="h-32 w-32 animate-bounce"
      />
      <p className="text-3xl font-black text-brand-violet">
        {kind === "up" ? t("levelUp") : kind === "down" ? t("tryEasier") : t("warmupDone")}
      </p>
      {kind === "up" ? <p className="text-base text-slate-600">{t("levelUpText")}</p> : null}
    </div>
  );
}

/** Creates the record, or updates its details once it exists. */
function buildInfoBody(state: State, locale: AssessmentLocale) {
  return {
    ...(state.submissionId ? { action: "update", submissionId: state.submissionId } : { action: "start" }),
    type: "level",
    locale,
    clientToken: state.clientToken,
    info: {
      studentName: state.info.studentName,
      studentAge: state.info.studentAge,
      phoneCountryCode: state.info.phoneCountryCode,
      phoneNumber: state.info.phoneNumber,
    },
  };
}
