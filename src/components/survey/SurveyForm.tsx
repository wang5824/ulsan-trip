"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { surveyQuestions, type SurveyAnswers } from "../../data/survey";
import { buildUserProfile, isQuestionAnswered } from "../../lib/survey";
import { findPetroglyphType } from "../../lib/petroglyph-type";
import RequiredPlacesPicker from "./RequiredPlacesPicker";
import PetroglyphGlyph from "../petroglyph/PetroglyphGlyph";
import { placeCatalog } from "../../data/places";
import { getRequiredPlaceIssues } from "../../lib/recommendation";
import type { TravelRegion } from "../../types/travel";
import { useTravel } from "../TravelProvider";
import { buttonPrimary, buttonSecondary, eyebrow, focusRing } from "../ui";

const ADVANCE_DELAY_MS = 260;

export default function SurveyForm() {
  const { ready, typeResult } = useTravel();

  if (!ready) {
    return <main className="flex-1 px-5 py-20 text-center text-sm text-ink-3"><p role="status">불러오는 중…</p></main>;
  }
  if (!typeResult) {
    return (
      <main className="flex-1 px-4 py-12 sm:px-8 sm:py-20">
        <section aria-labelledby="gate-heading" className="animate-rise mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-line bg-card text-center">
          <div className="grain-dark flex justify-center bg-rock py-10 text-bone/85">
            <PetroglyphGlyph glyph="hunter" label="" filterId="gate-hunter" className="h-24 w-24" />
          </div>
          <div className="p-7 sm:p-9">
            <p className={`${eyebrow} text-ochre`}>Step 1 먼저</p>
            <h1 id="gate-heading" className="mt-3 font-display text-2xl font-bold leading-snug sm:text-3xl">코스를 짜기 전에<br />나의 여행 유형부터 알아볼까요?</h1>
            <p className="mt-4 text-sm leading-7 text-ink-2">유형검사에서 나온 취향(활동량·자연/문화·체험/맛집·유명/로컬)을 그대로 코스 추천에 사용해요. 12문항, 약 2분이면 끝나요.</p>
            <Link href="/test" className={`${buttonPrimary} mt-7 w-full sm:w-auto`}>유형검사 시작하기 <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>
    );
  }
  return <RouteSurvey />;
}

function RouteSurvey() {
  const { typeResult, completeSurvey } = useTravel();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const type = findPetroglyphType(typeResult!.code)!;
  const taste = typeResult!.taste;
  const question = surveyQuestions[step];
  const isLast = step === surveyQuestions.length - 1;
  const isChoice = question.id !== "time" && question.id !== "requiredPlaces";
  const draftProfile = buildUserProfile(answers, taste);
  const requiredIssues = draftProfile ? getRequiredPlaceIssues(draftProfile, placeCatalog) : [];
  const canContinue = isQuestionAnswered(question.id, answers) && (!isLast || requiredIssues.length === 0);
  const invalidTime = question.id === "time" && answers.startTime && answers.endTime && !isQuestionAnswered("time", answers);
  const total = surveyQuestions.length;

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [step]);
  useEffect(() => () => {
    if (advanceTimer.current !== null) clearTimeout(advanceTimer.current);
  }, []);

  function goToStep(nextStep: number) {
    if (advanceTimer.current !== null) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    setStep(nextStep);
  }

  function choose(value: string) {
    if (isPending || question.id === "time" || question.id === "requiredPlaces") return;
    setAnswers(current => ({ ...current, [question.id]: value }));
    if (advanceTimer.current !== null) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => goToStep(step + 1), ADVANCE_DELAY_MS);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue || isPending) return;
    if (isLast) {
      const profile = buildUserProfile(answers, taste);
      if (!profile) return;
      completeSurvey(profile);
      startTransition(() => router.push("/result"));
    } else goToStep(step + 1);
  }

  const optionGrid = question.id === "region" || question.id === "preferredFood" ? "sm:grid-cols-2" : "grid-cols-2";

  return (
    <main className="flex-1 px-4 py-8 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-xl">
        <Link href={`/type/${type.code}`} className={`flex items-center gap-3 rounded-2xl border border-line bg-card/80 p-3 pr-4 transition-colors hover:border-ink-3 ${focusRing}`}>
          <span className="grain-dark flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rock text-ochre-tint">
            <PetroglyphGlyph glyph={type.glyph} label="" filterId="survey-type" className="h-9 w-9" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold text-ink-3">내 유형으로 코스를 만들고 있어요</span>
            <span className="block truncate font-display text-base font-bold">{type.name} <span className="font-mono text-xs text-ochre">{type.code}</span></span>
          </span>
        </Link>

        <div className="mt-7 flex items-center justify-between text-xs font-semibold text-ink-3">
          <span className="font-display text-sm text-ink-2">코스 설계</span>
          <span className="tabular-nums">{isPending ? "코스를 짜는 중…" : `${step + 1} / ${total}`}</span>
        </div>
        <div role="progressbar" aria-label="코스 설계 진행률" aria-valuemin={0} aria-valuemax={total} aria-valuenow={step} className="mt-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
          {surveyQuestions.map((item, index) => <span key={item.id} className={`h-1.5 rounded-full ${index === step ? "bg-sea" : index < step ? "bg-ink-2" : "bg-line"}`} />)}
        </div>

        <form key={question.id} onSubmit={submit} className="animate-rise mt-7 rounded-[2rem] border border-line bg-card p-5 shadow-[0_20px_50px_-30px_rgba(42,36,31,0.45)] sm:p-8">
          <h1 id="question-title" ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold leading-snug tracking-tight outline-none sm:text-[1.75rem]">{question.title}</h1>
          <p id="question-help" className="mb-7 mt-3 text-sm leading-6 text-ink-3">{question.help}{isChoice && <span className="mt-1 block">선택하면 다음 질문으로 넘어가요.</span>}</p>
          {question.id === "requiredPlaces" ? (
            <RequiredPlacesPicker selectedIds={answers.requiredPlaceIds ?? []} region={answers.region as TravelRegion | undefined}
              onChange={requiredPlaceIds => setAnswers(current => ({ ...current, requiredPlaceIds }))}
              onExpandRegion={() => setAnswers(current => ({ ...current, region: "all" }))} />
          ) : question.id === "time" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {([["startTime", "시작 시간"], ["endTime", "종료 시간"]] as const).map(([key, label]) => (
                <div key={key}>
                  <label htmlFor={key} className="mb-2 block text-sm font-semibold text-ink-2">{label}</label>
                  <input id={key} type="time" required value={answers[key] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [key]: event.target.value }))} aria-invalid={Boolean(invalidTime)} aria-describedby={invalidTime ? "time-error" : "question-help"} className="block min-h-14 w-full min-w-0 rounded-2xl border border-line bg-paper px-4 py-3 font-display text-lg focus:border-sea focus:outline-2 focus:outline-sea" />
                </div>
              ))}
              {invalidTime && <p id="time-error" role="alert" className="text-sm text-ochre-2 sm:col-span-2">종료 시간은 시작 시간보다 늦어야 합니다.</p>}
            </div>
          ) : (
            <fieldset aria-labelledby="question-title" aria-describedby="question-help" className={`grid gap-2.5 ${optionGrid}`}>
              {question.options.map((option) => {
                const checked = answers[question.id] === option.value;
                const hint = "hint" in option ? option.hint : undefined;
                return (
                  <button key={option.value} type="button" aria-pressed={checked} disabled={isPending} onClick={() => choose(option.value)} className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${focusRing} ${checked ? "border-sea bg-sea-tint/70" : "border-line bg-paper/60 hover:border-ink-3"}`}>
                    <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${checked ? "border-sea" : "border-line"}`}>{checked && <span className="h-2.5 w-2.5 rounded-full bg-sea" />}</span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold">{option.label}</span>
                      {hint && <span className="mt-0.5 block text-xs text-ink-3">{hint}</span>}
                    </span>
                  </button>
                );
              })}
            </fieldset>
          )}
          {isLast && requiredIssues.length > 0 && <div role="alert" className="mt-5 rounded-2xl bg-ochre-tint/70 p-4 text-sm leading-6 text-ink">
            <ul className="list-disc space-y-2 pl-4">{requiredIssues.map(issue => <li key={issue}>{issue}</li>)}</ul>
            <p className="mt-2">여행 시간을 늘리거나 필수 장소를 조정해주세요.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => goToStep(surveyQuestions.findIndex(item => item.id === "time"))} className={`min-h-10 rounded-full border border-ochre/40 bg-card px-4 font-semibold ${focusRing}`}>여행 시간 수정</button>
              {answers.region !== "all" && <button type="button" onClick={() => setAnswers(current => ({ ...current, region: "all" }))} className={`min-h-10 rounded-full border border-ochre/40 bg-card px-4 font-semibold ${focusRing}`}>여행 지역을 울산 전체로 변경</button>}
            </div>
          </div>}
          <div className="mt-8 flex gap-3 border-t border-line pt-6">
            <button type="button" disabled={step === 0 || isPending} onClick={() => goToStep(step - 1)} className={`${buttonSecondary} flex-1`}>이전</button>
            {(!isChoice || canContinue) && <button type="submit" disabled={!canContinue || isPending} className={`${buttonPrimary} flex-[1.4]`}>{isPending ? "이동 중…" : isLast ? "코스 보기" : "다음"}</button>}
          </div>
        </form>
      </div>
    </main>
  );
}
