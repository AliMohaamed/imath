import { z } from "zod";

export const AGE_OPTIONS = Array.from({ length: 14 }, (_, index) => index + 5);

export const PHONE_COUNTRY_OPTIONS = [
  { value: "+20", country: "EG" },
  { value: "+966", country: "SA" },
  { value: "+965", country: "KW" },
  { value: "+971", country: "AE" },
  { value: "+974", country: "QA" },
  { value: "+1", country: "US" },
  { value: "+44", country: "GB" },
] as const;

export const EXPERIENCE_OPTIONS = ["none", "some", "advanced"] as const;
export const PREFERRED_SLOT_OPTIONS = [
  "weekday_morning",
  "weekday_afternoon",
  "weekday_evening",
  "weekend_morning",
  "weekend_afternoon",
  "weekend_evening",
] as const;

export const bookingFormSchema = z.object({
  parentName: z.string().trim().min(2).max(80),
  studentName: z.string().trim().min(2).max(80),
  studentAge: z.coerce.number().int().min(5).max(18),
  phoneCountryCode: z.string().trim().regex(/^\+\d{1,4}$/),
  phoneNumber: z.string().trim().min(6).max(20).regex(/^[0-9()\-\s]+$/),
  email: z.union([z.literal(""), z.string().trim().email().max(120)]).optional(),
  previousExperience: z.enum(EXPERIENCE_OPTIONS),
  timezone: z.string().trim().min(1).max(80),
  preferredSlots: z.array(z.enum(PREFERRED_SLOT_OPTIONS)).min(1).max(PREFERRED_SLOT_OPTIONS.length),
  countryCode: z.string().trim().length(2).optional(),
  locale: z.enum(["ar", "en"]),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export function formatPhoneNumber(countryCode: string, phoneNumber: string) {
  const normalizedLocalNumber = phoneNumber.replace(/\s+/g, " ").trim();
  return `${countryCode} ${normalizedLocalNumber}`;
}
