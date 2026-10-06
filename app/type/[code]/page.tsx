import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PetroglyphGlyph from "@/src/components/petroglyph/PetroglyphGlyph";
import TypeResultActions from "@/src/components/test/TypeResultActions";
import { PETROGLYPH_AXES, PETROGLYPH_TYPES } from "@/src/data/petroglyph-types";
import { findPetroglyphType, getRelations } from "@/src/lib/petroglyph-type";
import { eyebrow, focusRing } from "@/src/components/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return PETROGLYPH_TYPES.map(type => ({ code: type.code }));
}

export async function generateMetadata({ params }: PageProps<"/type/[code]">): Promise<Metadata> {
  const { code } = await params;
  const type = findPetroglyphType(code);
  if (!type) return {};
  return {
    title: `${type.name} (${type.code}) | 암각화 여행자 유형`,
    description: `${type.tagline} 추천 코스: ${type.course}`,
  };
}

export default async function TypePage({ params }: PageProps<"/type/[code]">) {
  const { code } = await params;
  const type = findPetroglyphType(code);
  if (!type) notFound();
  const { best, pace } = getRelations(type.code);
  const relations = [
    { label: "찰떡궁합", note: "즐기는 방식만 반대라 서로의 코스를 채워줘요.", partner: findPetroglyphType(best)! },
    { label: "페이스 조심", note: "같은 곳을 좋아해도 걷는 속도가 달라요.", partner: findPetroglyphType(pace)! },
  ];

  return (
    <main className="flex-1 px-4 py-8 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <article className="animate-rise overflow-hidden rounded-[2rem] border border-line bg-card shadow-[0_30px_60px_-40px_rgba(42,36,31,0.5)]">
          <div className="grain-dark relative bg-rock px-6 pb-8 pt-8 text-bone sm:px-10 sm:pb-10 sm:pt-10">
            <div className="grid items-center gap-8 sm:grid-cols-[1fr_minmax(0,220px)]">
              <div className="order-2 min-w-0 sm:order-1">
                <p className={`${eyebrow} text-ochre-tint/80`}>암각화 여행자 유형</p>
                <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{type.name}</h1>
                <p className="mt-4 text-[15px] leading-8 text-bone/80">{type.tagline}</p>
                <p className="mt-3 text-xs text-bone/50">모티프 · {type.motif}</p>
              </div>
              <div className="order-1 mx-auto flex aspect-square w-44 items-center justify-center rounded-[1.75rem] border border-bone/10 bg-rock-2/70 text-ochre-tint shadow-[inset_0_2px_24px_rgba(0,0,0,0.35)] sm:order-2 sm:w-full">
                <PetroglyphGlyph glyph={type.glyph} label={type.motif} filterId={`type-${type.code}`} strokeWidth={2.8} className="h-[78%] w-[78%]" />
              </div>
            </div>
            <ol className="mt-8 grid grid-cols-4 gap-2 sm:gap-3">
              {PETROGLYPH_AXES.map((axis, index) => {
                const letter = type.code[index];
                const option = letter === axis.first.code ? axis.first : axis.second;
                return (
                  <li key={axis.label} className="rounded-2xl border border-bone/15 bg-bone/5 px-2 py-3 text-center">
                    <span className="block font-display text-2xl font-bold text-ochre-tint sm:text-3xl">{letter}</span>
                    <span className="mt-1 block text-[11px] leading-4 text-bone/70 sm:text-xs">{option.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="grid gap-8 p-6 sm:p-10">
            <TypeResultActions code={type.code} />

            <section aria-labelledby="keyword-heading">
              <h2 id="keyword-heading" className={`${eyebrow} text-ochre`}>이런 여행을 좋아해요</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {type.keywords.map(keyword => <li key={keyword} className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink-2">#{keyword}</li>)}
              </ul>
            </section>

            <section aria-labelledby="course-heading" className="rounded-3xl bg-sea p-6 text-sea-tint sm:p-7">
              <h2 id="course-heading" className={`${eyebrow} text-sea-tint/70`}>이 유형에게 어울리는 울산</h2>
              <p className="mt-3 font-display text-xl font-bold leading-relaxed text-white sm:text-2xl">{type.course}</p>
              <p className="mt-3 text-xs leading-5 text-sea-tint/70">유형 소개용 예시 코스예요. 실제 추천 코스는 2단계에서 동행·지역·시간을 반영해 새로 짜드려요.</p>
            </section>

            <section aria-labelledby="relation-heading">
              <h2 id="relation-heading" className={`${eyebrow} text-ochre`}>함께 여행한다면</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {relations.map(({ label, note, partner }) => (
                  <li key={label}>
                    <Link href={`/type/${partner.code}`} className={`group flex items-center gap-4 rounded-3xl border border-line bg-paper/60 p-4 transition-colors hover:border-ink-3 ${focusRing}`}>
                      <span className="grain-dark flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rock text-bone/85 group-hover:text-ochre-tint">
                        <PetroglyphGlyph glyph={partner.glyph} label="" filterId={`rel-${label}-${partner.code}`} className="h-12 w-12" />
                      </span>
                      <span className="min-w-0">
                        <span className="text-xs font-semibold text-ink-3">{label}</span>
                        <span className="mt-0.5 block font-display text-lg font-bold leading-snug">{partner.name} <span className="font-mono text-xs text-ochre">{partner.code}</span></span>
                        <span className="mt-1 block text-xs leading-5 text-ink-3">{note}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>

        <p className="mt-8 text-center text-sm">
          <Link href="/types" className={`font-semibold text-sea underline underline-offset-4 ${focusRing}`}>16유형 도감 전체 보기 →</Link>
        </p>
      </div>
    </main>
  );
}
