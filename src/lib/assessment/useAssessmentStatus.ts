"use client";

import { useSyncExternalStore } from "react";
import {
  getAssessmentStatus,
  STORAGE_CHANGE_EVENT,
  type AssessmentKind,
  type AssessmentStatus,
} from "@/lib/assessment/storage";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORAGE_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORAGE_CHANGE_EVENT, onChange);
  };
}

/** Reads saved progress from the browser; renders as "none" on the server and during hydration. */
export function useAssessmentStatus(kind: AssessmentKind): AssessmentStatus {
  return useSyncExternalStore(
    subscribe,
    () => getAssessmentStatus(kind),
    () => "none"
  );
}
