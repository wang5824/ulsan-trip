"use client";

import { useState } from "react";
import Link from "next/link";
import PetroglyphGlyph from "./PetroglyphGlyph";
import { PETROGLYPH_AXES, PETROGLYPH_TYPES } from "@/src/data/petroglyph-types";
import { describeAxes, findPetroglyphType, getRelations } from "@/src/lib/petroglyph-type";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700";

export default function PetroglyphDex() {
  const [picked, setPicked] = useState(["A", "N", "E", "F"]);
  const code = picked.join("");
  const current = findPetroglyphType(code);

  return (
    <div className="grid gap-10">
      <section aria-labelledby="finder-heading" className="rounded-3xl border border-teal-100 bg-teal-50/60 p-5 sm:p-7">
        <h2 id="finder-heading" className="text-lg font-bold">내 유형 바로 찾기</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PETROGLYPH_AXES.map((axis, index) => (
            <div key={axis.label} role="group" aria-label={axis.label} className="min-w-0">
              <p className="mb-1.5 text-xs font-semibold text-slate-500">{axis.label}</p>
              <div className="flex overflow-hidden rounded-full border border-slate-200 bg-white">
                {[axis.first, axis.second].map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    aria-pressed={picked[index] === option.code}
                    onClick={() => setPicked((prev) => prev.map((value, i) => (i === index ? option.code : value)))}
                    className={`min-h-11 min-w-0 flex-1 px-3 text-sm font-semibold transition-colors ${focusRing} ${picked[index] === option.code ? "bg-teal-700 text-white" : "text-slate-700 hover:bg-teal-50"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {current && (
          <p aria-live="polite" className="mt-4 text-sm leading-7 text-slate-600">
            당신은 <a href={`#${code}`} className="font-bold text-teal-800 underline underline-offset-4">{current.name} ({code})</a> · {current.tagline}
          </p>
        )}
      </section>

      <section aria-labelledby="dex-heading">
        <h2 id="dex-heading" className="text-xl font-bold">암각화 여행자 16유형</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PETROGLYPH_TYPES.map((type) => {
            const { best, pace } = getRelations(type.code);
            const active = type.code === code;
            return (
              <article key={type.code} id={type.code} className={`grid scroll-mt-6 content-start gap-3 rounded-2xl border bg-white p-4 transition-shadow ${active ? "border-orange-600 ring-2 ring-orange-600" : "border-slate-200"}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="shrink-0 whitespace-nowrap font-mono text-sm font-bold tracking-widest text-teal-700">{type.code}</span>
                  <span className="min-w-0 rounded-xl bg-teal-50 px-2.5 py-0.5 text-right text-[11px] leading-5 text-teal-900">{describeAxes(type.code).join(" · ")}</span>
                </div>
                <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-stone-200 text-slate-700">
                  <PetroglyphGlyph glyph={type.glyph} label={type.motif} filterId={`pecked-${type.code}`} className="h-[88%] w-[78%]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{type.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{type.tagline}</p>
                  <p className="mt-1 text-xs text-slate-500">모티프: {type.motif}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {type.keywords.map((keyword) => <span key={keyword} className="rounded-full bg-[#f3f7f4] px-2.5 py-1 text-xs text-slate-700">{keyword}</span>)}
                </div>
                <dl className="grid gap-2 border-t border-dashed border-slate-200 pt-3 text-sm">
                  <div><dt className="text-xs font-semibold text-slate-500">추천 코스</dt><dd>{type.course}</dd></div>
                  <div><dt className="text-xs font-semibold text-slate-500">찰떡궁합</dt><dd><a href={`#${best}`} className="text-teal-800 underline underline-offset-4">{findPetroglyphType(best)?.name} ({best})</a></dd></div>
                  <div><dt className="text-xs font-semibold text-slate-500">페이스 조심</dt><dd><a href={`#${pace}`} className="text-teal-800 underline underline-offset-4">{findPetroglyphType(pace)?.name} ({pace})</a></dd></div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="rule-heading" className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <h2 id="rule-heading" className="text-xl font-bold">설문 응답으로 유형 정하기</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead><tr className="text-xs text-slate-500"><th className="border-b border-slate-200 py-2 pr-3 font-medium">축</th><th className="border-b border-slate-200 py-2 pr-3 font-medium">설문 문항</th><th className="border-b border-slate-200 py-2 font-medium">기준</th></tr></thead>
              <tbody className="align-top">
                <tr><td className="border-b border-slate-100 py-2 pr-3 font-mono text-teal-700">A / S</td><td className="border-b border-slate-100 py-2 pr-3">활동량, 휴식 빈도</td><td className="border-b border-slate-100 py-2">활동량 4~5 → A, 1~2 → S, 3이면 휴식 ‘자주’ → S</td></tr>
                <tr><td className="border-b border-slate-100 py-2 pr-3 font-mono text-teal-700">N / C</td><td className="border-b border-slate-100 py-2 pr-3">자연, 역사·문화 관심도</td><td className="border-b border-slate-100 py-2">문화에만 관심(4점 이상) → C, 그 외 N</td></tr>
                <tr><td className="border-b border-slate-100 py-2 pr-3 font-mono text-teal-700">E / T</td><td className="border-b border-slate-100 py-2 pr-3">체험, 맛집 관심도</td><td className="border-b border-slate-100 py-2">맛집에만 관심(4점 이상) → T, 그 외 E</td></tr>
                <tr><td className="py-2 pr-3 font-mono text-teal-700">F / L</td><td className="py-2 pr-3">어떤 장소를 더 좋아하시나요?</td><td className="py-2">숨은 장소 → L, 대표 관광지·둘 다 → F</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid content-start gap-3 text-sm leading-7 text-slate-600">
          <h2 className="text-xl font-bold text-slate-900">궁합 규칙</h2>
          <p><strong className="text-slate-900">찰떡궁합</strong>은 ‘즐기는 방식’만 반대인 유형이에요. 한 사람은 체험을, 다른 사람은 맛집을 골라 코스를 서로 채워줘요.</p>
          <p><strong className="text-slate-900">페이스 조심</strong>은 ‘여행 에너지’만 반대인 유형이에요. 같은 곳을 좋아해도 걷는 속도가 달라요.</p>
          <p>동행인은 유형 계산에 쓰지 않아요. 그림은 반구천의 암각화 모티프를 단순화한 자체 도안이고, 로컬 추천 코스의 일부 장소는 아직 추천 데이터에 없어요.</p>
          <Link href="/survey" className={`mt-2 inline-flex min-h-12 w-fit items-center rounded-2xl bg-teal-700 px-5 font-semibold text-white hover:bg-teal-800 ${focusRing}`}>설문으로 내 유형 알아보기 <span aria-hidden="true" className="ml-2">→</span></Link>
        </div>
      </section>
    </div>
  );
}
