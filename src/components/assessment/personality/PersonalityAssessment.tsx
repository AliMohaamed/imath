"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/assessment/ProgressBar";
import { ResumeDialog } from "@/components/assessment/ResumeDialog";
import { EMPTY_INFO, hasAnyInfo, InfoStep, type InfoDraft } from "@/components/assessment/personality/InfoStep";
import { PersonalityResult } from "@/components/assessment/personality/PersonalityResult";
import { QuestionCard } from "@/components/assessment/personality/QuestionCard";
import { trackEvent } from "@/lib/analytics";
import { completeSubmission, postAssessment } from "@/lib/assessment/client";
import { createClientToken, getAgeFromDob, type AssessmentLocale } from "@/lib/assessment/common";
import { PERSONALITY_QUESTIONS, QUESTION_COUNT } from "@/lib/assessment/personality/questions";
import { isAnswerValue, isCompleteAnswerSet } from "@/lib/assessment/personality/scoring";
import { clearProgress, loadProgress, saveProgress, type FamilyDetails } from "@/lib/assessment/storage";

type Phase = "intro" | "info" | "questions" | "result";

type State = {
  phase: Phase;
  info: InfoDraft;
  /** One entry per question: -2, -1, 1, 2, or 0 while unanswered. */
  answers: number[];
  index: number;
  clientToken: string;
  submissionId?: string;
  /** True once the server has stored the finished result. */
  synced: boolean;
};

const ADVANCE_DELAY_MS = 250;

function createInitialState(): State {
  return {
    phase: "intro",
    info: EMPTY_INFO,
    answers: new Array(QUESTION_COUNT).fill(0),
    index: 0,
    clientToken: createClientToken(),
    synced: false,
  };
}

/** Saved data can be stale or edited by hand, so only trust it if it has the exact expected shape. */
function isValidState(value: State): boolean {
  return (
    ["intro", "info", "questions", "result"].includes(value.phase) &&
    typeof value.clientToken === "string" &&
    Array.isArray(value.answers) &&
    value.answers.length === QUESTION_COUNT &&
    value.answers.every((answer) => answer === 0 || isAnswerValue(answer)) &&
    Number.isInteger(value.index) &&
    value.index >= 0 &&
    value.index < QUESTION_COUNT &&
    typeof value.info === "object" &&
    value.info !== null &&
    (value.phase !== "result" || isCompleteAnswerSet(value.answers))
  );
}

/** Only a test that has actually begun counts; a half-filled form isn't worth interrupting a visitor for. */
function hasProgress(state: State) {
  return state.phase === "questions";
}

/** Saved state to start from: a begun test resumes, anything else starts at the intro with the typed details kept. */
function restoreState(saved: State): State {
  return hasProgress(saved) || saved.phase === "result" ? saved : { ...saved, phase: "intro" };
}

// Saved progress only exists in the browser, so the flow mounts after hydration.
const subscribeToNothing = () => () => {};

export function PersonalityAssessment() {
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );

  return isClient ? <PersonalityFlow /> : <div className="min-h-[60vh]" aria-hidden="true" />;
}

function PersonalityFlow() {
  const locale = useLocale() as AssessmentLocale;
  const t = useTranslations("Assessment.personality");

  const [saved] = useState(() => {
    const stored = loadProgress<State>("personality");
    return stored && isValidState(stored.data) ? stored.data : null;
  });
  const [state, setState] = useState<State>(() => (saved ? restoreState(saved) : createInitialState()));
  const [showResume, setShowResume] = useState(() => (saved ? hasProgress(saved) : false));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncing = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  const cancelAdvance = useCallback(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  useEffect(() => cancelAdvance, [cancelAdvance]);

  useEffect(() => {
    if (showResume || state.phase === "intro" || (state.phase === "info" && !hasAnyInfo(state.info))) {
      return;
    }

    saveProgress("personality", state);
  }, [state, showResume]);

  // Move focus to the new step so keyboard and screen-reader users land at its start.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    headingRef.current?.focus();
  }, [state.phase, state.index]);

  useEffect(() => {
    if (showResume) {
      trackEvent("assessment_resume_shown", { type: "personality", phase: state.phase });
    }
    // Only the moment the dialog appears matters, not later phase changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResume]);

  // Store the finished result. Runs again on a later visit if the first attempt never got through.
  useEffect(() => {
    if (state.phase !== "result" || state.synced || syncing.current) {
      return;
    }

    syncing.current = true;

    completeSubmission({
      submissionId: state.submissionId,
      start: () => buildInfoBody({ ...state, submissionId: undefined }, locale),
      complete: (submissionId) => ({
        action: "complete",
        type: "personality",
        locale,
        clientToken: state.clientToken,
        submissionId,
        answers: state.answers,
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
    cancelAdvance();
    clearProgress("personality");
    setError(null);
    setState(createInitialState());
  };

  const handleResumeRestart = () => {
    trackEvent("assessment_resume_restart", { type: "personality" });
    restart();
    setShowResume(false);
  };

  const handleResumeContinue = () => {
    trackEvent("assessment_resume_continue", { type: "personality", phase: state.phase });
    setShowResume(false);
  };

  const start = () => {
    trackEvent("assessment_start", { type: "personality", from: "intro" });
    setState((current) => ({ ...current, phase: "info" }));
  };

  const submitInfo = async () => {
    setError(null);
    setSubmitting(true);

    // The record is created when the form is first completed so a parent who drops out can still be contacted.
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

    trackEvent("assessment_info_completed", { type: "personality" });
    setState((current) => ({ ...current, phase: "questions" }));
  };

  const answer = (value: number) => {
    const questionIndex = state.index;
    cancelAdvance();

    setState((current) => {
      const answers = [...current.answers];
      answers[questionIndex] = value;
      return { ...current, answers };
    });

    // 0 means the parent switched statements and hasn't said how well the new one fits yet.
    if (value === 0) {
      return;
    }

    trackEvent("assessment_question_answered", { type: "personality", index: questionIndex });

    if (questionIndex < QUESTION_COUNT - 1) {
      advanceTimer.current = setTimeout(() => {
        setState((current) =>
          current.index === questionIndex && current.phase === "questions"
            ? { ...current, index: questionIndex + 1 }
            : current
        );
      }, ADVANCE_DELAY_MS);
    }
  };

  const goBack = () => {
    cancelAdvance();
    setState((current) =>
      current.index > 0 ? { ...current, index: current.index - 1 } : { ...current, phase: "info" }
    );
  };

  const finish = () => {
    if (!isCompleteAnswerSet(state.answers)) {
      return;
    }

    cancelAdvance();
    trackEvent("assessment_completed", { type: "personality" });
    setState((current) => ({ ...current, phase: "result" }));
  };

  const studentName = state.info.studentName.trim();
  const question = PERSONALITY_QUESTIONS[state.index];
  const currentAnswer = state.answers[state.index];
  const isLast = state.index === QUESTION_COUNT - 1;

  return (
    <section className="bg-gradient-to-b from-brand-violet/5 to-white py-10 md:py-16" aria-live="polite">
      {showResume ? <ResumeDialog onContinue={handleResumeContinue} onRestart={handleResumeRestart} /> : null}

      <div className="container mx-auto max-w-3xl px-4">
        {state.phase === "intro" ? (
          <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-sm md:p-10">
            <Image src="/assessment/brain.png" alt="" width={112} height={112} className="mx-auto h-28 w-28" priority />
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-violet/10 px-4 py-2 text-xs font-black text-brand-violet">
                <Clock className="h-3.5 w-3.5" />
                {t("intro.duration")}
              </div>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-black tracking-tight text-slate-900 outline-none md:text-4xl">
                {t("intro.title")}
              </h1>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                {t("intro.description")}
              </p>
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
            <InfoStep
              info={state.info}
              submitting={submitting}
              error={error}
              onChange={(info) => setState((current) => ({ ...current, info }))}
              onSubmit={submitInfo}
            />
          </div>
        ) : null}

        {state.phase === "questions" ? (
          <div className="space-y-6">
            <ProgressBar
              value={state.index + 1}
              max={QUESTION_COUNT}
              label={t("questions.progress", { current: state.index + 1, total: QUESTION_COUNT })}
            />
            <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-8">
              <h1 ref={headingRef} tabIndex={-1} className="sr-only">
                {t("questions.heading", { name: studentName })}
              </h1>
              <QuestionCard
                key={question.id}
                question={question}
                locale={locale}
                name={studentName}
                value={currentAnswer}
                onAnswer={answer}
              />
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <Button variant="ghost" onClick={goBack}>
                  <ArrowLeft className="me-1 h-4 w-4 rtl:rotate-180" />
                  {t("questions.back")}
                </Button>
                {isLast ? (
                  <Button
                    size="lg"
                    className="bg-brand-orange text-white hover:bg-brand-orange/90"
                    disabled={currentAnswer === 0}
                    onClick={finish}
                  >
                    {t("questions.submit")}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {state.phase === "result" ? (
          <PersonalityResult
            ref={headingRef}
            name={studentName}
            gender={state.info.gender === "girl" ? "girl" : "boy"}
            answers={state.answers}
            family={getFamilyDetails(state.info)}
            onRetake={restart}
          />
        ) : null}
      </div>
    </section>
  );
}

/** Details the level test and the booking form can reuse, so the family doesn't type them twice. */
function getFamilyDetails(info: InfoDraft): FamilyDetails {
  const age = getAgeFromDob(info.studentDob);

  return {
    parentName: info.parentName.trim(),
    studentName: info.studentName.trim(),
    studentAge: age !== null && age >= 4 && age <= 18 ? age : 8,
    phoneCountryCode: info.phoneCountryCode,
    phoneNumber: info.phoneNumber,
  };
}

/** Creates the record, or updates its details once it exists. */
function buildInfoBody(state: State, locale: AssessmentLocale) {
  return {
    ...(state.submissionId ? { action: "update", submissionId: state.submissionId } : { action: "start" }),
    type: "personality",
    locale,
    clientToken: state.clientToken,
    info: {
      parentName: state.info.parentName,
      parentEmail: state.info.parentEmail,
      phoneCountryCode: state.info.phoneCountryCode,
      phoneNumber: state.info.phoneNumber,
      studentName: state.info.studentName,
      studentDob: state.info.studentDob,
      gender: state.info.gender,
    },
  };
}
