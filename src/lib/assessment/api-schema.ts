import { z } from "zod";
import { QUESTION_COUNT } from "@/lib/assessment/personality/questions";
import { levelInfoSchema, personalityInfoSchema } from "@/lib/assessment/common";

import { MAX_LEVEL } from "@/lib/assessment/level/levels";

const base = {
  clientToken: z.string().regex(/^[0-9a-f]{32}$/),
  locale: z.enum(["ar", "en"]),
};

export const assessmentRequestSchema = z.union([
  z.object({
    ...base,
    action: z.literal("start"),
    type: z.literal("personality"),
    countryCode: z.string().trim().length(2).optional(),
    info: personalityInfoSchema,
  }),
  z.object({
    ...base,
    action: z.literal("start"),
    type: z.literal("level"),
    countryCode: z.string().trim().length(2).optional(),
    info: levelInfoSchema,
  }),
  // Sent when the family goes back and edits their details after the record was created.
  z.object({
    ...base,
    action: z.literal("update"),
    type: z.literal("personality"),
    submissionId: z.string().min(1).max(64),
    info: personalityInfoSchema,
  }),
  z.object({
    ...base,
    action: z.literal("update"),
    type: z.literal("level"),
    submissionId: z.string().min(1).max(64),
    info: levelInfoSchema,
  }),
  z.object({
    ...base,
    action: z.literal("complete"),
    type: z.literal("personality"),
    submissionId: z.string().min(1).max(64),
    // The server recomputes the result from these, so none is accepted from the client.
    answers: z
      .array(z.union([z.literal(-2), z.literal(-1), z.literal(1), z.literal(2)]))
      .length(QUESTION_COUNT),
  }),
  z.object({
    ...base,
    action: z.literal("complete"),
    type: z.literal("level"),
    submissionId: z.string().min(1).max(64),
    result: z.object({
      placementLevel: z.number().int().min(0).max(MAX_LEVEL),
      accuracy: z.number().min(0).max(100),
      speedStars: z.number().int().min(0).max(3),
      rounds: z
        .array(
          z.object({
            level: z.number().int().min(1).max(MAX_LEVEL),
            correct: z.number().int().min(0).max(10),
            total: z.number().int().min(1).max(10),
            medianMs: z.number().min(0).max(600_000),
          })
        )
        .min(1)
        .max(12),
    }),
  }),
]);

export type AssessmentRequest = z.infer<typeof assessmentRequestSchema>;

export type AssessmentApiSuccess = { ok: true; submissionId?: string };
export type AssessmentApiFailure = {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
