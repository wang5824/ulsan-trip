import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-teal-900/5 bg-white">
      <nav aria-label="주 메뉴" className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-xl font-bold text-white">u.</span>
          <span className="text-lg font-bold tracking-tight text-slate-900">울산, 나의 여행<span className="mt-0.5 block text-[10px] font-medium tracking-[0.2em] text-teal-700">MY ULSAN TRIP</span></span>
        </Link>
        <Link href="/survey" className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-teal-50 px-4 text-sm font-semibold text-teal-800 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">여행 만들기 <span aria-hidden="true" className="ml-2">↗</span></Link>
      </nav>
    </header>
  );
}
