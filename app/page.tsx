import Link from "next/link";
import Image from "next/image";
import PetroglyphGlyph from "@/src/components/petroglyph/PetroglyphGlyph";
import { PETROGLYPH_TYPES } from "@/src/data/petroglyph-types";
import { TYPE_TEST_QUESTIONS } from "@/src/data/type-test";
import { surveyQuestions } from "@/src/data/survey";
import BangudaeForecast from "@/src/components/home/BangudaeForecast";
import { buttonOnDark, buttonPrimary, eyebrow, focusRing } from "@/src/components/ui";

// 히어로의 '바위 면'에 흩어 놓을 그림 배치입니다. 위치는 % 단위입니다.
const rockGlyphs = [
  { code: "SNEF", x: 4, y: 6, size: 34, rotate: -6 },
  { code: "ANEF", x: 50, y: 2, size: 30, rotate: 4 },
  { code: "ACEF", x: 60, y: 36, size: 34, rotate: -3 },
  { code: "SNTL", x: 10, y: 44, size: 24, rotate: 8 },
  { code: "ANEL", x: 36, y: 34, size: 22, rotate: 0 },
  { code: "SCTF", x: 38, y: 66, size: 30, rotate: -8 },
  { code: "SCTL", x: 76, y: 70, size: 18, rotate: 0 },
  { code: "ANTL", x: 4, y: 76, size: 24, rotate: 5 },
] as const;

export default function Home() {
  const preview = PETROGLYPH_TYPES.slice(0, 8);
  return (
    <main className="flex-1">
      <section className="grain-dark relative overflow-hidden bg-rock text-bone">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="animate-rise">
            <p className={`${eyebrow} text-ochre-tint/80`}>7천 년 전 · 반구천의 암각화 · 울산</p>
            <h1 className="mt-5 font-display text-[2.1rem] font-bold leading-[1.3] tracking-tight sm:text-5xl sm:leading-[1.25]">
              바위에 새긴 그림이<br /><span className="text-ochre-tint">오늘의 여행</span>이 됩니다
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-8 text-bone/75">
              고래, 사슴, 호랑이, 사냥꾼. 상황 질문 {TYPE_TEST_QUESTIONS.length}개로 나와 닮은 암각화 그림을 찾고, 그 취향으로 울산 하루 코스를 받아보세요.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/test" className={buttonPrimary}>유형검사 시작하기 <span aria-hidden="true">→</span></Link>
              <Link href="/types" className={buttonOnDark}>16유형 먼저 보기</Link>
            </div>
            <p className="mt-5 text-xs text-bone/50">약 2분 · 로그인 없이 바로 시작</p>
          </div>

          <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[440px] rounded-[2.5rem] border border-bone/10 bg-rock-2/60 shadow-[inset_0_2px_30px_rgba(0,0,0,0.35)]">
            {rockGlyphs.map(({ code, x, y, size, rotate }, index) => {
              const type = PETROGLYPH_TYPES.find(item => item.code === code)!;
              return (
                <div key={code} className={`absolute ${index === 2 ? "text-ochre-tint" : "text-bone/70"}`} style={{ left: `${x}%`, top: `${y}%`, width: `${size}%`, transform: `rotate(${rotate}deg)` }}>
                  <PetroglyphGlyph glyph={type.glyph} label="" filterId={`hero-${code}`} className="h-auto w-full" />
                </div>
              );
            })}
            <span className="absolute bottom-5 right-6 font-display text-xs tracking-[0.3em] text-bone/40">BANGUDAE</span>
          </div>
        </div>
      </section>

      <BangudaeForecast />

      <section aria-labelledby="flow-heading" className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className={`${eyebrow} text-ochre`}>How it works</p>
          <h2 id="flow-heading" className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">두 번의 질문, 하나의 여행</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { step: "01", title: "암각화 여행자 유형검사", body: `‘알람이 울렸다, 당신의 선택은?’ 같은 상황 질문 ${TYPE_TEST_QUESTIONS.length}개로 네 가지 여행 성향을 읽어요.`, meta: `${TYPE_TEST_QUESTIONS.length}문항 · 약 2분`, glyph: "hunter" as const },
              { step: "02", title: "16유형 중 나의 그림", body: "고래잡이 선단부터 천전리 동심원까지, 나와 닮은 그림과 찰떡궁합 동행 유형을 알려드려요.", meta: "공유 가능한 결과 페이지", glyph: "whaleCalf" as const },
              { step: "03", title: "내 유형으로 코스 설계", body: "동행·지역·이동수단·시간만 더하면 유형 취향에 맞는 관광지와 맛집, 카페를 동선 순서대로 짜드려요.", meta: `${surveyQuestions.length}문항 · 일정과 지도`, glyph: "boat" as const },
            ].map(item => (
              <li key={item.step} className="group relative overflow-hidden rounded-[1.75rem] border border-line bg-card p-7">
                <div className="flex items-start justify-between">
                  <span className="font-display text-4xl font-bold text-ochre/90">{item.step}</span>
                  <PetroglyphGlyph glyph={item.glyph} label="" filterId={`flow-${item.step}`} className="h-14 w-14 text-ink-3/60 transition-colors group-hover:text-ochre" />
                </div>
                <h3 className="mt-6 text-lg font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-2">{item.body}</p>
                <p className="mt-5 inline-flex rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink-2">{item.meta}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="dex-preview" className="border-y border-line bg-sand/60 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className={`${eyebrow} text-ochre`}>16 Travelers</p>
              <h2 id="dex-preview" className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">바위에 새겨진 16명의 여행자</h2>
            </div>
            <Link href="/types" className={`text-sm font-semibold text-sea underline underline-offset-4 ${focusRing}`}>도감 전체 보기 →</Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {preview.map(type => (
              <li key={type.code}>
                <Link href={`/type/${type.code}`} className={`group block rounded-3xl border border-line bg-card p-4 transition-transform hover:-translate-y-1 ${focusRing}`}>
                  <div className="grain-dark flex aspect-[4/3] items-center justify-center rounded-2xl bg-rock text-bone/85 transition-colors group-hover:text-ochre-tint">
                    <PetroglyphGlyph glyph={type.glyph} label={type.motif} filterId={`preview-${type.code}`} className="h-[80%] w-[70%]" />
                  </div>
                  <p className="mt-3 font-mono text-[11px] font-bold tracking-[0.2em] text-ochre">{type.code}</p>
                  <p className="mt-0.5 font-display text-base font-bold leading-snug">{type.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="origin-heading" className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <figure className="overflow-hidden rounded-[1.75rem] border border-line bg-card">
            <Image
              src="/images/bangudae-petroglyphs.jpg"
              alt="바위 표면에 동물과 고래 등의 형상이 새겨진 반구대 암각화"
              width={7898}
              height={4004}
              sizes="(max-width: 1023px) calc(100vw - 40px), 540px"
              className="h-auto w-full"
            />
            <figcaption className="px-3 py-1 text-right text-[9px] leading-3 text-ink-3 transition-colors hover:text-ink-2 focus-within:text-ink-2">
              사진: <a href="https://commons.wikimedia.org/wiki/File:Bangudae3.jpg" className="underline-offset-2 hover:underline focus-visible:underline">울산암각화박물관 / Wikimedia Commons</a>
              {" · "}<a href="https://creativecommons.org/licenses/by-sa/3.0/" className="underline-offset-2 hover:underline focus-visible:underline">CC BY-SA 3.0</a>
              {" · 크기 조정"}
            </figcaption>
          </figure>
          <div>
            <p className={`${eyebrow} text-ochre`}>Why petroglyphs</p>
            <h2 id="origin-heading" className="mt-3 font-display text-3xl font-bold leading-snug tracking-tight sm:text-4xl">울산 사람들은 아주 오래전부터 여행자였어요</h2>
            <p className="mt-6 text-[15px] leading-8 text-ink-2">반구대 바위에는 배를 타고 고래를 쫓던 사람, 숲에서 사슴을 기다리던 사람의 모습이 새겨져 있어요. 누군가는 바다로, 누군가는 숲으로 향했던 그 마음이 오늘의 여행 취향과 다르지 않다고 생각했어요.</p>
            <p className="mt-4 text-[15px] leading-8 text-ink-2">추천은 울산 관광지·음식점·카페 500여 곳의 정적 데이터와 규칙 기반 점수로 계산해요. 관광두레 업체는 배지로 소개하고 가점을 더해요.</p>
            <Link href="/test" className={`${buttonPrimary} mt-9`}>나의 그림 찾기 <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
