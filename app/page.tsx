import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex-1 bg-[#f8faf8]">
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="mb-6 inline-flex rounded-full border border-teal-200 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-teal-800">나의 취향으로 만나는 울산</p>
          <h1 className="text-4xl font-bold leading-[1.25] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">당신에게 맞는<br /><span className="text-teal-700">울산을 발견하세요</span></h1>
          <p className="mt-6 max-w-md text-base leading-8 text-slate-600">간단한 설문을 기반으로 울산 관광지와 로컬 맛집을 추천하는 서비스입니다.<br />함께하는 사람과 여행 취향에 맞춰, 나만의 울산 여행을 찾아보세요.</p>
          <Link href="/survey" className="mt-8 inline-flex min-h-14 w-full items-center justify-between gap-8 rounded-2xl bg-teal-700 px-6 py-4 font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 sm:w-auto">나만의 여행 찾기 <span aria-hidden="true">→</span></Link>
          <p className="mt-4 text-xs leading-5 text-slate-500">10개의 질문 · 로그인 없이 시작해요</p>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-teal-100 bg-cyan-50 p-6 sm:p-8">
          <figure className="overflow-hidden rounded-2xl bg-white">
            <div className="px-5 pt-5">
              <p className="text-xs font-bold tracking-[0.25em] text-teal-800">HELLO, ULSAN</p>
              <p className="mt-2 text-lg font-bold text-slate-900">반구대 암각화</p>
            </div>
            <Image
              src="/images/bangudae-petroglyphs.jpg"
              alt="바위 표면에 동물과 고래 등의 형상이 새겨진 반구대 암각화"
              width={7898}
              height={4004}
              sizes="(max-width: 639px) calc(100vw - 88px), (max-width: 1023px) calc(100vw - 128px), 440px"
              preload
              className="my-4 h-auto w-full"
            />
            <figcaption className="px-5 pb-5 text-[11px] leading-5 text-slate-500">
              사진: <a href="https://commons.wikimedia.org/wiki/File:Bangudae3.jpg" className="underline underline-offset-2">울산암각화박물관 / Wikimedia Commons</a>
              {" · "}<a href="https://creativecommons.org/licenses/by-sa/3.0/" className="underline underline-offset-2">CC BY-SA 3.0</a>
              {" · 크기 조정"}
            </figcaption>
          </figure>
          <div className="relative mt-4 ml-4 rounded-2xl border border-white bg-white p-5 shadow-sm sm:ml-10 sm:p-6">
            <p className="text-xs font-semibold tracking-widest text-teal-700">YOUR TRAVEL MOOD</p>
            <p className="mt-3 text-xl font-bold text-slate-900">오늘은 어떤 여행이 좋을까요?</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["푸른 자연", "맛있는 한 끼", "새로운 체험", "여유로운 쉼"].map((label) => <span key={label} className="rounded-full bg-[#f3f7f4] px-3 py-2 text-xs font-medium text-slate-600">{label}</span>)}
            </div>
          </div>
          <p className="mt-5 text-right text-xs tracking-wide text-teal-800">취향을 따라, 울산을 발견하는 하루</p>
        </div>
      </section>
      <section aria-labelledby="travel-features" className="border-t border-teal-900/5 bg-white px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[0.2em] text-teal-700">MAKE IT YOURS</p>
          <h2 id="travel-features" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">취향을 따라, 로컬을 만나는 여행</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">어디부터 가야 할지 고민된다면, 좋아하는 여행부터 이야기해주세요. 울산을 알아가는 하루를 함께 그려드릴게요.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
            {[
              ["01", "맞춤형 추천", "동행인, 관심사, 활동량과 휴식 취향까지. 10개의 질문을 바탕으로 나에게 어울리는 장소와 추천 이유를 확인해요."],
              ["02", "울산 로컬 여행", "관광지와 로컬 맛집, 쉬어갈 카페를 함께 살펴보세요. 추천 일정과 지도에서 방문 순서를 한눈에 확인할 수 있어요."],
              ["03", "관광두레 업체 소개", "관광두레로 등록된 업체는 별도 배지로 소개하고 추천에 가점을 더해요. 여행 취향과의 적합도도 함께 고려해요."],
            ].map(([number, title, description]) => (
              <article key={number} className="rounded-2xl bg-[#f8faf8] p-6 sm:p-7">
                <span className="text-sm font-bold tabular-nums text-teal-700">{number}</span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-teal-100 bg-teal-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h3 className="text-lg font-bold text-teal-950">당신의 울산 여행은 어떤 모습인가요?</h3>
              <p className="mt-2 text-sm leading-6 text-teal-800">설문에 답하고, 나만의 추천 일정과 지도를 만나보세요.</p>
            </div>
            <Link href="/survey" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-4 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">나만의 여행 찾기 <span aria-hidden="true">→</span></Link>
          </div>
          <p className="mt-8 text-xs leading-6 text-slate-500">현재는 개발용 가상 장소로 추천을 체험할 수 있습니다. 실제 방문 정보는 제공하지 않습니다.</p>
        </div>
      </section>
    </main>
  );
}
