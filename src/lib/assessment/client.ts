import type { AssessmentApiFailure, AssessmentApiSuccess } from "@/lib/assessment/api-schema";

type ApiResponse = (AssessmentApiSuccess | AssessmentApiFailure) & { status: number };

/** Resolves with the HTTP status and body; rejects only when the network itself fails. */
export async function postAssessment(body: unknown): Promise<ApiResponse> {
  const response = await fetch("/api/assessments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({ ok: false, message: "" }))) as
    | AssessmentApiSuccess
    | AssessmentApiFailure;

  return { ...payload, status: response.status };
}

/**
 * Stores a finished result, creating the submission first if the earlier "start" call never got
 * through (for example the family was offline). Resolves with the submission id once the server
 * has the result, or null if it still hasn't; the child's result is shown either way.
 */
export async function completeSubmission(params: {
  submissionId?: string;
  start: () => unknown;
  complete: (submissionId: string) => unknown;
  attempts?: number;
}): Promise<string | null> {
  let submissionId = params.submissionId;

  for (let attempt = 0; attempt < (params.attempts ?? 2); attempt += 1) {
    try {
      if (!submissionId) {
        const started = await postAssessment(params.start());
        if (started.ok && started.submissionId) {
          submissionId = started.submissionId;
        }
      }

      if (submissionId) {
        const completed = await postAssessment(params.complete(submissionId));
        if (completed.ok) {
          return submissionId;
        }

        // The record is gone or the id is from another deployment: create a fresh one next attempt.
        if (completed.status === 404) {
          submissionId = undefined;
        }
      }
    } catch {
      // Network trouble: try again, then give up quietly.
    }
  }

  return null;
}
