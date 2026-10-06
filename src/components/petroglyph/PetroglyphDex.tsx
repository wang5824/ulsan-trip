"use client";

import { useState } from "react";
import Link from "next/link";
import PetroglyphGlyph from "./PetroglyphGlyph";
import { PETROGLYPH_AXES, PETROGLYPH_TYPES } from "@/src/data/petroglyph-types";
import { describeAxes, findPetroglyphType } from "@/src/lib/petroglyph-type";
import { useTravel } from "../TravelProvider";
import { buttonPrimary, eyebrow, focusRing } from "../ui";

export default function PetroglyphDex() {
  const { typeResult } = useTravel();
  const [picked, setPicked] = useState(["A", "N", "E", "F"]);
  const code = picked.join("");
  const current = findPetroglyphType(code);
  const mine = typeResult?.code;

  return (
    <div className="grid gap-14">
      <section aria-labelledby="dex-heading">
        <h2 id="dex-heading" className="sr-only">암각화 여행자 16유형</h2>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {PETROGLYPH_TYPES.map((type) => {
            const isMine = type.code === mine;
            return (
              <li key={type.code} id={type.code} className="scroll-mt-24">
                <Link href={`/type/${type.code}`} className={`group flex h-full flex-col rounded-3xl border bg-card p-3 transition-transform hover:-translate-y-1 sm:p-4 ${isMine ? "border-ochre ring-2 ring-ochre" : "border-line"} ${focusRing}`}>
                  <div className="grain-dark relative flex aspect-[4/3] items-center justify-center rounded-2xl bg-rock text-bone/85 transition-colors group-hover:text-ochre-tint">
                    <PetroglyphGlyph glyph={type.glyph} label={type.motif} filterId={`pecked-${type.code}`} className="h-[82%] w-[72%]" />
                    {isMine && <span className="absolute left-2 top-2 rounded-full bg-ochre px-2 py-0.5 text-[10px] font-bold text-white">나의 유형</span>}
                  </div>
                  <p className="mt-3 font-mono text-[11px] font-bold tracking-[0.2em] text-ochre">{type.code}</p>
                  <h3 className="mt-0.5 font-display text-base font-bold leading-snug sm:text-lg">{type.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-ink-3 sm:text-[13px]">{type.tagline}</p>
                  <p className="mt-auto pt-3 text-[11px] text-ink-3">{describeAxes(type.code).join(" · ")}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="finder-heading" className="rounded-[1.75rem] border border-line bg-sand/60 p-5 sm:p-8">
        <p className={`${eyebrow} text-ochre`}>Quick finder</p>
        <h2 id="finder-heading" className="mt-2 font-display text-2xl font-bold">성향을 골라 유형 찾아보기</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PETROGLYPH_AXES.map((axis, index) => (
            <div key={axis.label} role="group" aria-label={axis.label} className="min-w-0">
              <p className="mb-2 text-xs font-semibold text-ink-3">{axis.label}</p>
              <div className="flex rounded-full border border-line bg-card p-1">
                {[axis.first, axis.second].map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    aria-pressed={picked[index] === option.code}
                    onClick={() => setPicked((prev) => prev.map((value, i) => (i === index ? option.code : value)))}
                    className={`min-h-10 min-w-0 flex-1 rounded-full px-3 text-sm font-semibold transition-colors ${focusRing} ${picked[index] === option.code ? "bg-ink text-paper" : "text-ink-2 hover:bg-sand"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {current && (
          <p aria-live="polite" className="mt-6 text-sm leading-7 text-ink-2">
            → <Link href={`/type/${code}`} className={`font-display text-base font-bold text-sea underline underline-offset-4 ${focusRing}`}>{current.name} ({code})</Link> · {current.tagline}
          </p>
        )}
      </section>

      <section aria-labelledby="rule-heading" className="grid gap-8 lg:grid-cols-2">
        <div className="min-w-0">
          <p className={`${eyebrow} text-ochre`}>How it&apos;s decided</p>
          <h2 id="rule-heading" className="mt-2 font-display text-2xl font-bold">유형은 이렇게 정해져요</h2>
          <p className="mt-4 text-sm leading-7 text-ink-2">유형검사의 상황 질문 12개는 네 가지 축에 3문항씩 나뉘어 있어요. 축마다 더 많이 고른 쪽의 글자가 유형 코드가 되고, 고른 비율은 2단계 코스 추천의 취향 값으로 쓰여요.</p>
          <ul className="mt-5 grid gap-2 text-sm">
            {[
              ["A / S", "여행 에너지", "활동량과 휴식 빈도"],
              ["N / C", "끌리는 무대", "자연·바다 또는 문화·역사 관심"],
              ["E / T", "즐기는 방식", "체험 또는 맛집 관심"],
              ["F / L", "가고 싶은 곳", "유명 명소 또는 숨은 장소 선호"],
            ].map(([letters, axis, use]) => (
              <li key={letters} className="flex items-center gap-4 rounded-2xl border border-line bg-card px-4 py-3">
                <span className="w-14 shrink-0 font-display text-lg font-bold text-ochre">{letters}</span>
                <span className="min-w-0"><span className="font-semibold">{axis}</span><span className="block text-xs text-ink-3">추천에 반영: {use}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid content-start gap-4 text-sm leading-7 text-ink-2 lg:pt-12">
          <h2 className="font-display text-2xl font-bold text-ink">궁합 규칙</h2>
          <p><strong className="text-ink">찰떡궁합</strong>은 ‘즐기는 방식’만 반대인 유형이에요. 한 사람은 체험을, 다른 사람은 맛집을 골라 코스를 서로 채워줘요.</p>
          <p><strong className="text-ink">페이스 조심</strong>은 ‘여행 에너지’만 반대인 유형이에요. 같은 곳을 좋아해도 걷는 속도가 달라요.</p>
          <p className="text-xs leading-6 text-ink-3">동행인은 유형 계산에 쓰지 않아요. 그림은 반구천의 암각화 모티프를 단순화한 자체 도안이고, 유형별 예시 코스의 일부 장소는 아직 추천 데이터에 없어요.</p>
          <Link href="/test" className={`${buttonPrimary} mt-2 w-fit`}>유형검사로 내 그림 찾기 <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
