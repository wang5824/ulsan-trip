import type { Metadata } from "next";
import PetroglyphDex from "@/src/components/petroglyph/PetroglyphDex";

export const metadata: Metadata = {
  title: "암각화 여행자 유형 | 울산, 나의 여행",
  description: "반구천의 암각화 모티프로 만든 16가지 울산 여행자 유형을 알아보세요.",
};

export default function TypesPage() {
  return (
    <main className="flex-1 bg-[#f8faf8] px-5 py-10 text-slate-900 sm:px-8 sm:py-14">
      <div className="mx-auto grid max-w-6xl gap-10">
        <header className="max-w-3xl">
          <p className="text-xs font-bold tracking-[0.2em] text-teal-700">반구천의 암각화 · 여행자 도감</p>
          <h1 className="mt-4 text-3xl font-bold leading-snug tracking-tight sm:text-5xl">나는 어떤 암각화 여행자일까?</h1>
          <p className="mt-5 text-base leading-8 text-slate-600">7천 년 전 반구대 바위에 새겨진 고래, 사슴, 호랑이, 사냥꾼이 오늘의 여행 유형이 됩니다. 설문 응답으로 네 가지 성향을 정하면 16개 그림 중 하나가 당신의 여행 캐릭터가 돼요.</p>
        </header>
        <PetroglyphDex />
      </div>
    </main>
  );
}
