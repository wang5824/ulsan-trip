import Link from "next/link";
import PetroglyphGlyph from "./petroglyph/PetroglyphGlyph";
import { focusRing } from "./ui";

const links = [
  { href: "/types", label: "16유형 도감" },
  { href: "/survey", label: "코스 만들기" },
  { href: "/test", label: "유형검사" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <nav aria-label="주 메뉴" className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:min-h-18 sm:px-8">
        <Link href="/" className={`flex min-w-0 items-center gap-2.5 rounded-lg ${focusRing}`}>
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rock text-bone">
            <PetroglyphGlyph glyph="whaleCalf" label="" filterId="pecked-logo" className="h-7 w-7" />
          </span>
          <span className="truncate font-display text-lg font-bold tracking-tight text-ink">울산, 나의 여행</span>
        </Link>
        <ul className="flex shrink-0 items-center gap-0.5 text-sm font-semibold sm:gap-1">
          {links.map(({ href, label }, index) => (
            <li key={href} className={index === 2 ? "" : "hidden sm:block"}>
              <Link href={href} className={`inline-flex min-h-10 items-center rounded-full px-3.5 transition-colors ${index === 2 ? "bg-ink text-paper hover:bg-rock-2" : "text-ink-2 hover:bg-sand hover:text-ink"} ${focusRing}`}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
