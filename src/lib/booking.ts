import { z } from "zod";

export const AGE_OPTIONS = Array.from({ length: 15 }, (_, index) => index + 4);

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
export const BOOKING_DAY_COUNT = 4;
export const BOOKING_START_HOUR = 10;
export const BOOKING_END_HOUR = 21;
export const SAME_DAY_MINIMUM_NOTICE_HOURS = 2;

export const bookingFormSchema = z.object({
  parentName: z.string().trim().min(2).max(80),
  studentName: z.string().trim().min(2).max(80),
  studentAge: z.coerce.number().int().min(4).max(18),
  phoneCountryCode: z.string().trim().regex(/^\+\d{1,4}$/),
  phoneNumber: z.string().trim().min(6).max(20).regex(/^[0-9()\-\s]+$/),
  email: z.union([z.literal(""), z.string().trim().email().max(120)]).optional(),
  previousExperience: z.enum(EXPERIENCE_OPTIONS),
  timezone: z.string().trim().min(1).max(80),
  preferredSlots: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)).length(1),
  countryCode: z.string().trim().length(2).optional(),
  locale: z.enum(["ar", "en"]),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export function formatPhoneNumber(countryCode: string, phoneNumber: string) {
  const normalizedLocalNumber = phoneNumber.replace(/\s+/g, " ").trim();
  return `${countryCode} ${normalizedLocalNumber}`;
}

export type BookingLocale = "ar" | "en";

export type BookableDateOption = {
  value: string;
  shortLabel: string;
  longLabel: string;
  isToday: boolean;
};

export type BookingTimeSlot = {
  value: string;
  label: string;
  hour: number;
};

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function buildPreferredSlotValue(dateKey: string, timeValue: string) {
  return `${dateKey}T${timeValue}`;
}

export function parsePreferredSlotValue(value: string) {
  const [dateKey, timeValue] = value.split("T");

  if (!dateKey || !timeValue) {
    return null;
  }

  return { dateKey, timeValue };
}

function formatDayLabel(date: Date, locale: BookingLocale, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function getBookableDateOptions(locale: BookingLocale, now = new Date()): BookableDateOption[] {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Array.from({ length: BOOKING_DAY_COUNT }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const isToday = index === 0;

    return {
      value: formatDateKey(date),
      shortLabel: formatDayLabel(date, locale, { weekday: "short", day: "numeric", month: "short" }),
      longLabel: formatDayLabel(date, locale, { weekday: "long", day: "numeric", month: "long" }),
      isToday,
    };
  });
}

export function getHourlyTimeSlots(locale: BookingLocale): BookingTimeSlot[] {
  return Array.from({ length: BOOKING_END_HOUR - BOOKING_START_HOUR + 1 }, (_, index) => {
    const hour = BOOKING_START_HOUR + index;
    const date = new Date(2000, 0, 1, hour, 0, 0, 0);

    return {
      value: `${String(hour).padStart(2, "0")}:00`,
      label: new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
      }).format(date),
      hour,
    };
  });
}

export function getAvailableTimeSlotsForDate(
  dateKey: string,
  locale: BookingLocale,
  now = new Date()
) {
  const slots = getHourlyTimeSlots(locale);
  const selectedDate = parseDateKey(dateKey);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isToday = selectedDate.getTime() === startOfToday.getTime();

  if (!isToday) {
    return slots;
  }

  const threshold = new Date(now.getTime() + SAME_DAY_MINIMUM_NOTICE_HOURS * 60 * 60 * 1000);

  return slots.filter((slot) => {
    const slotDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      slot.hour,
      0,
      0,
      0
    );

    return slotDate.getTime() >= threshold.getTime();
  });
}

export function formatPreferredSlotValue(value: string, locale: BookingLocale) {
  const parsed = parsePreferredSlotValue(value);

  if (!parsed) {
    return value;
  }

  const [hours, minutes] = parsed.timeValue.split(":").map(Number);
  const date = parseDateKey(parsed.dateKey);
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
