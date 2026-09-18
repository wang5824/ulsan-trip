"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { surveyQuestions, type SurveyAnswers } from "../../data/survey";
import { buildUserProfile, isQuestionAnswered } from "../../lib/survey";
import { useRouter } from "next/navigation";
import { useTravel } from "../TravelProvider";

const buttonStyle = "min-h-14 rounded-2xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-40";

export default function SurveyForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const router = useRouter();
  const { completeSurvey } = useTravel();
  const [isPending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const question = surveyQuestions[step];
  const isLast = step === surveyQuestions.length - 1;
  const canContinue = isQuestionAnswered(question.id, answers);
  const progress = isPending ? 100 : Math.round((step / surveyQuestions.length) * 100);
  const invalidTime = question.id === "time" && answers.startTime && answers.endTime && !canContinue;

  useEffect(() => { headingRef.current?.focus(); }, [step]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue || isPending) return;
    if (isLast) {
      const profile = buildUserProfile(answers);
      if (!profile) return;
      completeSurvey(profile);
      startTransition(() => router.push("/result"));
    } else setStep((current) => current + 1);
  }

  return (
    <main className="flex-1 bg-[#f8faf8] px-5 py-10 text-slate-900 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-xl">
        <p className="mb-6 text-center text-xs font-bold tracking-[0.15em] text-teal-700">나에게 맞는 울산 여행</p>
        <div className="mb-3 flex justify-between text-xs font-semibold tabular-nums text-slate-600">
          <span>{isPending ? "추천 결과로 이동 중" : `질문 ${step + 1} / ${surveyQuestions.length}`}</span>
          <span>{progress}%</span>
        </div>
        <div role="progressbar" aria-label="설문 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mb-6 h-1.5 overflow-hidden rounded-full bg-teal-100">
          <div className="h-full rounded-full bg-teal-700 transition-all motion-reduce:transition-none" style={{ width: `${progress}%` }} />
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-teal-900/5 bg-white p-5 shadow-sm sm:p-9">
          <h1 id="question-title" ref={headingRef} tabIndex={-1} className="text-2xl font-bold leading-snug tracking-tight outline-none sm:text-3xl">{question.title}</h1>
          <p id="question-help" className="mb-8 mt-4 text-sm leading-7 text-slate-500">{question.id === "time" ? "같은 날의 시작·종료 시간을 선택해주세요. 한국 시각 기준입니다." : "가장 가까운 답변 하나를 선택해주세요."}</p>
          {question.id === "time" ? (
            <div className="space-y-5">
              {([ ["startTime", "시작 시간"], ["endTime", "종료 시간"] ] as const).map(([key, label]) => (
                <div key={key}>
                  <label htmlFor={key} className="mb-2 block text-sm font-medium">{label}</label>
                  <input id={key} type="time" required value={answers[key] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [key]: event.target.value }))} aria-invalid={Boolean(invalidTime)} aria-describedby={invalidTime ? "time-error" : "question-help"} className="block min-h-14 w-full min-w-0 rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-teal-700 focus:outline-2 focus:outline-teal-700" />
                </div>
              ))}
              {invalidTime && <p id="time-error" role="alert" className="text-sm text-red-700">종료 시간은 시작 시간보다 늦어야 합니다.</p>}
            </div>
          ) : (
            <fieldset key={question.id} aria-labelledby="question-title" aria-describedby="question-help" className="space-y-3">
              {question.options.map((option) => (
                <label key={option.value} className={`flex min-h-16 cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors hover:border-teal-400 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-700 sm:p-5 ${answers[question.id] === option.value ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600" : "border-slate-200"}`}>
                  <input type="radio" name={question.id} value={option.value} checked={answers[question.id] === option.value} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.value }))} className="h-5 w-5 shrink-0 accent-teal-700" />
                  <span className="text-sm font-medium sm:text-base">{option.label}</span>
                </label>
              ))}
            </fieldset>
          )}
          <div className="mt-8 flex gap-3 border-t border-slate-100 pt-6">
            <button type="button" disabled={step === 0 || isPending} onClick={() => setStep((current) => current - 1)} className={`${buttonStyle} flex-1 bg-slate-100 hover:bg-slate-200`}>이전</button>
            <button type="submit" disabled={!canContinue || isPending} className={`${buttonStyle} flex-1 bg-teal-700 text-white hover:bg-teal-800`}>{isPending ? "이동 중…" : isLast ? "추천 결과 보기" : "다음"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
