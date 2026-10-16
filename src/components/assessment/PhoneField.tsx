import { PHONE_CODES } from "@/lib/assessment/common";
import { inputClassName } from "@/components/assessment/ui";

export function PhoneField({
  id,
  code,
  number,
  placeholder,
  invalid,
  onCodeChange,
  onNumberChange,
}: {
  id: string;
  code: string;
  number: string;
  placeholder: string;
  invalid: boolean;
  onCodeChange: (value: string) => void;
  onNumberChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3" dir="ltr">
      <select
        aria-label="Country code"
        className={inputClassName}
        value={code}
        onChange={(event) => onCodeChange(event.target.value)}
      >
        {PHONE_CODES.map((option) => (
          <option key={`${option.country}-${option.value}`} value={option.value}>
            {option.country} {option.value}
          </option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className={inputClassName}
        placeholder={placeholder}
        value={number}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(event) => onNumberChange(event.target.value)}
      />
    </div>
  );
}
