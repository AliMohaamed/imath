import type { Article } from "@/content/types";
import { whatIsMentalMath } from "./what-is-mental-math";
import { mentalMathBenefits } from "./mental-math-benefits-for-kids";
import { mentalMathVsAbacus } from "./mental-math-vs-abacus";

/** Guides under /resources, in the order shown on the hub page. */
export const RESOURCES: Article[] = [whatIsMentalMath, mentalMathBenefits, mentalMathVsAbacus];

export function getResource(slug: string) {
  return RESOURCES.find((resource) => resource.slug === slug);
}

/** Replaces [label](href) links with their label, for meta and JSON-LD text. */
export function stripLinks(text: string) {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}
