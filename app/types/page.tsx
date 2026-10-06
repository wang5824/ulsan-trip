import type { Metadata } from "next";
import PetroglyphDex from "@/src/components/petroglyph/PetroglyphDex";

export const metadata: Metadata = {
  title: "암각화 여행자 16유형 도감 | 울산, 나의 여행",
  description: "반구천의 암각화 모티프로 만든 16가지 울산 여행자 유형을 알아보세요.",
};

export default function TypesPage() {
  return (
    <main className="flex-1 px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-10">
        <header className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ochre">반구천의 암각화 · 여행자 도감</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">바위에 새겨진<br />16명의 여행자</h1>
          <p className="mt-5 text-[15px] leading-8 text-ink-2">7천 년 전 반구대 바위에 새겨진 고래, 사슴, 호랑이, 사냥꾼이 오늘의 여행 유형이 됩니다. 그림을 누르면 유형의 특징과 궁합을 볼 수 있어요.</p>
        </header>
        <PetroglyphDex />
      </div>
    </main>
  );
}
