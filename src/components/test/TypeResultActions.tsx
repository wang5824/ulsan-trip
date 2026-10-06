"use client";

import { useState } from "react";
import Link from "next/link";
import { PETROGLYPH_AXES } from "../../data/petroglyph-types";
import { TYPE_TEST_QUESTIONS } from "../../data/type-test";
import { useTravel } from "../TravelProvider";
import { buttonPrimary, buttonSecondary, eyebrow } from "../ui";

const perAxis = TYPE_TEST_QUESTIONS.length / PETROGLYPH_AXES.length;

/** 내 검사 결과인 경우 성향 막대와 2단계 진입 버튼을, 아니면 검사 시작 버튼을 보여줍니다. */
export default function TypeResultActions({ code }: { code: string }) {
  const { ready, typeResult } = useTravel();
  const [copied, setCopied] = useState(false);
  const isMine = ready && typeResult?.code === code;

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (!ready) return <div aria-hidden="true" className="h-14" />;

  if (!isMine) {
    return (
      <section aria-label="유형검사 안내" className="flex flex-col gap-4 rounded-3xl border border-dashed border-line bg-paper/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-sm leading-6 text-ink-2">{typeResult ? "내 유형과 다른 그림이에요. 내 결과로 돌아가거나 다시 검사할 수 있어요." : "나는 어떤 그림일까요? 12개의 질문으로 확인해보세요."}</p>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          {typeResult && <Link href={`/type/${typeResult.code}`} className={buttonSecondary}>내 결과 보기</Link>}
          <Link href="/test" className={buttonPrimary}>{typeResult ? "다시 검사하기" : "나도 검사하기"}</Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="mine-heading" className="grid gap-6">
      <div>
        <h2 id="mine-heading" className={`${eyebrow} text-ochre`}>나의 검사 결과</h2>
        <ul className="mt-4 grid gap-3">
          {PETROGLYPH_AXES.map((axis, index) => {
            const first = typeResult.firstCounts[index];
            const percent = Math.round((first / perAxis) * 100);
            return (
              <li key={axis.label} className="grid grid-cols-[4.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 text-xs sm:grid-cols-[5.5rem_minmax(0,1fr)_5.5rem] sm:text-sm">
                <span className={`text-right ${first * 2 > perAxis ? "font-bold text-ink" : "text-ink-3"}`}>{axis.first.label}</span>
                <span className="relative h-2.5 overflow-hidden rounded-full bg-sand" role="img" aria-label={`${axis.label}: ${axis.first.label} ${first}문항, ${axis.second.label} ${perAxis - first}문항`}>
                  <span className="absolute inset-y-0 left-0 rounded-full bg-ochre" style={{ width: `${percent}%` }} />
                  <span className="absolute inset-y-0 left-1/2 w-px bg-card" />
                </span>
                <span className={first * 2 < perAxis ? "font-bold text-ink" : "text-ink-3"}>{axis.second.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="rounded-3xl bg-ochre-tint/60 p-5 sm:p-6">
        <p className="font-display text-lg font-bold text-ink">이제 이 취향으로 울산 하루 코스를 짜볼까요?</p>
        <p className="mt-1 text-sm leading-6 text-ink-2">동행·지역·이동수단·시간 등 6가지만 더 알려주시면 돼요.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href="/survey" className={buttonPrimary}>내 유형으로 코스 만들기 <span aria-hidden="true">→</span></Link>
          <button type="button" onClick={share} className={buttonSecondary}>{copied ? "링크를 복사했어요" : "결과 링크 복사"}</button>
        </div>
        <p aria-live="polite" className="sr-only">{copied ? "결과 링크를 복사했습니다." : ""}</p>
      </div>
    </section>
  );
}
