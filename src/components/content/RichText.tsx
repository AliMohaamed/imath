import { Fragment } from "react";
import { Link } from "@/navigation";

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Renders text with [label](href) links: "/..." becomes a locale-aware internal link. */
export function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;

  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match;
    parts.push(text.slice(last, match.index));
    parts.push(
      href.startsWith("/") ? (
        <Link key={match.index} href={href} className="font-bold text-brand-violet underline underline-offset-4 hover:opacity-80">
          {label}
        </Link>
      ) : (
        <a key={match.index} href={href} target="_blank" rel="noopener" className="font-bold text-brand-violet underline underline-offset-4 hover:opacity-80">
          {label}
        </a>
      )
    );
    last = match.index + whole.length;
  }
  parts.push(text.slice(last));

  return <>{parts.map((part, index) => <Fragment key={index}>{part}</Fragment>)}</>;
}
