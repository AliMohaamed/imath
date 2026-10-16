import type { Locale } from "@/navigation";

/**
 * Long-form bilingual content (guides and the program page). Paragraph and list text may
 * contain [label](/path) links: paths starting with "/" become locale-aware internal links.
 */
export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export type ContentSection = {
  heading: string;
  blocks: ContentBlock[];
};

export type ArticleCopy = {
  /** <title> without the "| iMath" suffix; keep it under ~50 characters. */
  title: string;
  /** Meta description, 155 characters or fewer. */
  description: string;
  h1: string;
  /** The direct answer, shown first: what search engines and AI answers quote. */
  summary: string;
  sections: ContentSection[];
  faq: Array<{ question: string; answer: string }>;
};

export type Article = {
  slug: string;
  publishedAt: string;
  updatedAt: string;
  /** Published research or references cited in the text. */
  sources: Array<{ label: string; url: string }>;
  /** Slugs of related guides, shown at the end of the article. */
  related: string[];
  copy: Record<Locale, ArticleCopy>;
};
