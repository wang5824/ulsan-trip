"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import PetroglyphGlyph from "../petroglyph/PetroglyphGlyph";
import { TYPE_TEST_QUESTIONS } from "../../data/type-test";
import { scoreTypeTest } from "../../lib/type-test";
import { useTravel } from "../TravelProvider";
import { focusRing } from "../ui";

const ADVANCE_DELAY_MS = 260;

export default function TypeTest() {
  const total = TYPE_TEST_QUESTIONS.length;
  const [step, setStep] = useState(0);
  const [letters, setLetters] = useState<(string | undefined)[]>(() => Array(total).fill(undefined));
  const [isPending, startTransition] = useTransition();
  const { completeTypeTest } = useTravel();
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const question = TYPE_TEST_QUESTIONS[step];

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [step]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function choose(letter: string) {
    if (isPending) return;
    const next = letters.map((value, index) => (index === step ? letter : value));
    setLetters(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (step < total - 1) {
        setStep(step + 1);
        return;
      }
      const result = scoreTypeTest(next);
      if (!result) {
        // 건너뛴 문항이 있으면 첫 번째 빈 문항으로 돌아갑니다.
        setStep(Math.max(0, next.findIndex(value => value === undefined)));
        return;
      }
      completeTypeTest(result);
      startTransition(() => router.push(`/type/${result.code}`));
    }, ADVANCE_DELAY_MS);
  }

  const answered = letters.filter(Boolean).length;

  return (
    <main className="flex-1 px-4 py-8 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-3">
          <span className="font-display text-sm text-ink-2">암각화 여행자 유형검사</span>
          <span className="tabular-nums">{isPending ? "결과를 새기는 중…" : `${step + 1} / ${total}`}</span>
        </div>
        <div role="progressbar" aria-label="유형검사 진행률" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered} className="mt-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
          {TYPE_TEST_QUESTIONS.map((item, index) => (
            <span key={item.id} className={`h-1.5 rounded-full transition-colors ${index === step ? "bg-ochre" : letters[index] ? "bg-ink-2" : "bg-line"}`} />
          ))}
        </div>

        <section key={question.id} aria-labelledby="question-title" className="animate-rise mt-7 overflow-hidden rounded-[2rem] border border-line bg-card shadow-[0_20px_50px_-30px_rgba(42,36,31,0.45)]">
          <div className="grain-dark relative flex items-end justify-between gap-4 bg-rock px-6 pb-6 pt-7 text-bone sm:px-8">
            <div className="min-w-0">
              <p className="font-display text-3xl font-bold text-ochre-tint">Q.{String(step + 1).padStart(2, "0")}</p>
              <p className="mt-3 text-sm leading-6 text-bone/75">{question.scene}</p>
            </div>
            <PetroglyphGlyph glyph={question.glyph} label="" filterId={`test-${question.id}`} className="h-20 w-20 shrink-0 text-bone/80 sm:h-24 sm:w-24" />
          </div>
          <div className="p-5 sm:p-8">
            <h1 id="question-title" ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold leading-snug tracking-tight outline-none sm:text-[1.75rem]">{question.title}</h1>
            <div role="group" aria-labelledby="question-title" className="mt-7 grid gap-3">
              {question.options.map((option, index) => {
                const selected = letters[step] === option.letter;
                return (
                  <button
                    key={option.letter}
                    type="button"
                    aria-pressed={selected}
                    disabled={isPending}
                    onClick={() => choose(option.letter)}
                    className={`group flex min-h-18 w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all sm:px-5 ${focusRing} ${selected ? "border-ochre bg-ochre-tint/70" : "border-line bg-paper/60 hover:-translate-y-0.5 hover:border-ink-3 hover:bg-card"}`}
                  >
                    <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold transition-colors ${selected ? "bg-ochre text-white" : "bg-sand text-ink-2 group-hover:bg-ink group-hover:text-paper"}`}>{index === 0 ? "가" : "나"}</span>
                    <span className="text-[15px] font-medium leading-6 text-ink sm:text-base">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between text-sm">
          <button type="button" disabled={step === 0 || isPending} onClick={() => setStep(step - 1)} className={`min-h-11 rounded-full px-4 font-semibold text-ink-2 hover:bg-sand disabled:opacity-0 ${focusRing}`}>← 이전 질문</button>
          {letters[step] && step < total - 1 && (
            <button type="button" onClick={() => setStep(step + 1)} className={`min-h-11 rounded-full px-4 font-semibold text-ink-2 hover:bg-sand ${focusRing}`}>다음 →</button>
          )}
        </div>
        <p className="mt-6 text-center text-xs leading-5 text-ink-3">정답은 없어요. 처음 떠오르는 쪽을 골라주세요.</p>
      </div>
    </main>
  );
}
