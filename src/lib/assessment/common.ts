import { z } from "zod";
import { PHONE_COUNTRY_OPTIONS } from "@/lib/booking";

export type AssessmentLocale = "ar" | "en";
export type ChildGender = "boy" | "girl";
export type Localized = Record<AssessmentLocale, string>;

/**
 * Copy can contain `{male|female}` gender pairs and `{name}` placeholders.
 * Arabic needs real gender agreement, so every child-facing sentence is
 * written once with both forms instead of falling back to the masculine.
 */
export function personalize(text: string, gender: ChildGender, name: string) {
  return text
    .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, male: string, female: string) =>
      gender === "girl" ? female : male
    )
    .replaceAll("{name}", name.trim());
}

export function pick(text: Localized, locale: AssessmentLocale) {
  return text[locale];
}

export function getAgeFromDob(dob: string, now = new Date()) {
  const [year, month, day] = dob.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  let age = now.getFullYear() - year;
  const hasHadBirthday =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  if (!hasHadBirthday) {
    age -= 1;
  }

  return age;
}

export const PHONE_CODES = PHONE_COUNTRY_OPTIONS;

const phoneCodeSchema = z.string().trim().regex(/^\+\d{1,4}$/);
const phoneNumberSchema = z.string().trim().min(6).max(20).regex(/^[0-9()\-\s]+$/);
const nameSchema = z.string().trim().min(2).max(80);

export const personalityInfoSchema = z
  .object({
    parentName: nameSchema,
    parentEmail: z.string().trim().email().max(120),
    phoneCountryCode: phoneCodeSchema,
    phoneNumber: phoneNumberSchema,
    studentName: nameSchema,
    studentDob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    gender: z.enum(["boy", "girl"]),
  })
  .refine(
    (value) => {
      const age = getAgeFromDob(value.studentDob);
      return age !== null && age >= 3 && age <= 18;
    },
    { path: ["studentDob"], message: "invalid_dob" }
  );

export type PersonalityInfo = z.infer<typeof personalityInfoSchema>;

export const levelInfoSchema = z.object({
  studentName: nameSchema,
  studentAge: z.coerce.number().int().min(4).max(18),
  phoneCountryCode: phoneCodeSchema,
  phoneNumber: phoneNumberSchema,
});

export type LevelInfo = z.infer<typeof levelInfoSchema>;

/** Generates an unguessable token that lets this browser update the record it created. */
export function createClientToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
