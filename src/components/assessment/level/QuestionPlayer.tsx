"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { NumberPad } from "@/components/assessment/level/NumberPad";
import type { AnswerRecord } from "@/lib/assessment/level/engine";
import { DOT_GRID_CELLS, type Question } from "@/lib/assessment/level/generator";
import { FLASH_GAP_MS } from "@/lib/assessment/level/levels";
import { cn } from "@/lib/utils";

const MAX_DIGITS = 4;
const READY_MS = 900;
const COUNTDOWN_STEP_MS = 700;
const FEEDBACK_MS = 1000;

type Stage =
  | { name: "ready"; count?: number }
  | { name: "showing"; index: number; visible: boolean }
  | { name: "answering" }
  | { name: "feedback"; correct: boolean; timedOut: boolean };

/** Flashed numbers are shown with their sign so a child can tell an add from a take-away. */
function formatStep(step: number, index: number) {
  if (index === 0) return String(step);
  return step < 0 ? `−${-step}` : `+${step}`;
}

/**
 * Plays one question from start to finish: get ready, show the dots or flash the numbers,
 * take the answer against a calm timer, then show friendly feedback and report the result.
 * Mount it with a fresh `key` for every question so it always starts clean.
 */
export function QuestionPlayer({
  question,
  onDone,
}: {
  question: Question;
  onDone: (answer: AnswerRecord, correct: boolean) => void;
}) {
  const t = useTranslations("Assessment.level.play");
  const [stage, setStage] = useState<Stage>(() =>
    question.kind === "arith" ? { name: "answering" } : { name: "ready", count: question.kind === "flash" ? 3 : undefined }
  );
  const [value, setValue] = useState("");

  const answeredAt = useRef<number>(0);
  const finished = useRef(false);
  const valueRef = useRef("");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(
    () => () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    },
    []
  );

  // Intro: a short "get ready", a 3-2-1 for flashes, then the dots or numbers themselves.
  useEffect(() => {
    if (stage.name !== "ready") return;

    if (question.kind === "flash" && stage.count !== undefined && stage.count > 1) {
      const count = stage.count;
      const timer = setTimeout(() => setStage({ name: "ready", count: count - 1 }), COUNTDOWN_STEP_MS);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setStage({ name: "showing", index: 0, visible: true }), question.kind === "flash" ? COUNTDOWN_STEP_MS : READY_MS);
    return () => clearTimeout(timer);
  }, [stage, question.kind]);

  useEffect(() => {
    if (stage.name !== "showing") return;

    if (question.kind === "dots") {
      const timer = setTimeout(() => setStage({ name: "answering" }), question.showMs);
      return () => clearTimeout(timer);
    }

    const steps = question.steps ?? [];
    const delay = stage.visible ? question.intervalMs ?? 1500 : FLASH_GAP_MS;
    const timer = setTimeout(() => {
      if (stage.visible) {
        setStage({ name: "showing", index: stage.index, visible: false });
      } else if (stage.index + 1 < steps.length) {
        setStage({ name: "showing", index: stage.index + 1, visible: true });
      } else {
        setStage({ name: "answering" });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [stage, question]);

  const finish = useCallback(
    (correct: boolean, timedOut: boolean) => {
      if (finished.current) return;
      finished.current = true;

      const timeMs = timedOut ? question.timeLimitMs : Math.round(performance.now() - answeredAt.current);
      setStage({ name: "feedback", correct, timedOut });
      feedbackTimer.current = setTimeout(() => onDone({ correct, timedOut, timeMs }, correct), FEEDBACK_MS);
    },
    [onDone, question.timeLimitMs]
  );

  const submit = useCallback(() => {
    const typed = valueRef.current;
    if (typed === "") return;
    finish(Number(typed) === question.answer, false);
  }, [finish, question.answer]);

  // The timer starts when the child can actually answer, not while numbers are still flashing.
  useEffect(() => {
    if (stage.name !== "answering") return;

    answeredAt.current = performance.now();
    const timer = setTimeout(() => finish(false, true), question.timeLimitMs);
    return () => clearTimeout(timer);
  }, [stage.name, finish, question.timeLimitMs]);

  useEffect(() => {
    if (stage.name !== "answering") return;

    const onKey = (event: KeyboardEvent) => {
      if (/^\d$/.test(event.key)) {
        setValue((current) => (current.length < MAX_DIGITS ? current + event.key : current));
      } else if (event.key === "Backspace") {
        setValue((current) => current.slice(0, -1));
      } else if (event.key === "Enter") {
        submit();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage.name, submit]);

  const prompt = question.kind === "dots" ? t("dotsAsk") : question.kind === "flash" ? t("flashAsk") : null;

  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center gap-6 text-center">
      {stage.name === "ready" ? (
        <div className="space-y-2" aria-live="assertive">
          <p className="text-3xl font-black text-brand-violet md:text-4xl">{t("ready")}</p>
          {stage.count !== undefined ? (
            <p className="text-7xl font-black text-brand-orange" dir="ltr">
              {stage.count}
            </p>
          ) : null}
        </div>
      ) : null}

      {stage.name === "showing" && question.kind === "dots" ? <DotGrid cells={question.dots ?? []} /> : null}

      {stage.name === "showing" && question.kind === "flash" ? (
        <p
          className="flex h-40 items-center justify-center text-8xl font-black text-brand-violet md:text-9xl"
          dir="ltr"
          aria-live="assertive"
        >
          {stage.visible ? formatStep(question.steps?.[stage.index] ?? 0, stage.index) : ""}
        </p>
      ) : null}

      {stage.name === "answering" ? (
        <>
          <div className="w-full max-w-xs space-y-3">
            {question.kind === "arith" && question.phrase ? (
              <p className="text-4xl font-black tracking-wide text-slate-900 md:text-5xl">
                {t(question.phrase.key, { value: question.phrase.value })}
              </p>
            ) : question.kind === "arith" ? (
              <p className="text-4xl font-black tracking-wide text-slate-900 md:text-5xl" dir="ltr">
                {question.expression}
              </p>
            ) : (
              <p className="text-2xl font-black text-slate-900 md:text-3xl">{prompt}</p>
            )}
            <div
              className="flex h-16 items-center justify-center rounded-2xl border-2 border-brand-violet/30 bg-white text-4xl font-black text-brand-violet"
              dir="ltr"
              role="status"
              aria-label={t("answer")}
            >
              {value || <span className="text-slate-300">?</span>}
            </div>
            <TimerBar durationMs={question.timeLimitMs} />
          </div>
          <NumberPad
            onDigit={(digit) => setValue((current) => (current.length < MAX_DIGITS ? current + digit : current))}
            onDelete={() => setValue((current) => current.slice(0, -1))}
            onSubmit={submit}
            canSubmit={value !== ""}
            deleteLabel={t("delete")}
            submitLabel={t("check")}
          />
        </>
      ) : null}

      {stage.name === "feedback" ? (
        <div className="space-y-3" aria-live="assertive">
          <Image
            src={stage.correct ? "/assessment/glowing-star.png" : "/assessment/light-bulb.png"}
            alt=""
            width={112}
            height={112}
            className="mx-auto h-28 w-28 animate-bounce"
          />
          <p className={cn("text-3xl font-black", stage.correct ? "text-emerald-600" : "text-brand-orange")}>
            {stage.correct ? t("great") : stage.timedOut ? t("timeUp") : t("tryAgain")}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function DotGrid({ cells }: { cells: number[] }) {
  return (
    <div className="grid grid-cols-4 gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200" aria-live="assertive">
      {Array.from({ length: DOT_GRID_CELLS }, (_, cell) => (
        <div key={cell} className="flex h-14 w-14 items-center justify-center md:h-16 md:w-16">
          {cells.includes(cell) ? <span className="h-11 w-11 rounded-full bg-brand-orange shadow-md md:h-12 md:w-12" /> : null}
        </div>
      ))}
    </div>
  );
}

/** A slim bar that quietly drains; deliberately not a ticking clock. */
function TimerBar({ durationMs }: { durationMs: number }) {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRunning(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
      <div
        className="h-full rounded-full bg-brand-violet/60 ease-linear motion-reduce:transition-none"
        style={{ width: running ? "0%" : "100%", transition: `width ${durationMs}ms linear` }}
      />
    </div>
  );
}
