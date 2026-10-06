import type { Metadata } from "next";
import { Gowun_Batang, IBM_Plex_Sans_KR } from "next/font/google";
import SiteHeader from "@/src/components/SiteHeader";
import TravelProvider from "@/src/components/TravelProvider";
import "./globals.css";

// 한글 글꼴은 용량이 커서 미리 불러오지 않고, 글꼴이 준비되기 전에는 시스템 글꼴을 사용합니다.
const plexKr = IBM_Plex_Sans_KR({
  variable: "--font-plex-kr",
  weight: ["400", "500", "600", "700"],
  preload: false,
  display: "swap",
});

const gowun = Gowun_Batang({
  variable: "--font-gowun",
  weight: ["400", "700"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "울산, 나의 여행 | 암각화 여행자 유형과 맞춤 코스",
  description: "12개의 상황 질문으로 나의 암각화 여행자 유형을 찾고, 6개의 질문으로 울산 여행 코스를 추천받아 보세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${plexKr.variable} ${gowun.variable} h-full antialiased`}>
      <body className="grain flex min-h-full flex-col bg-paper font-sans text-ink antialiased selection:bg-ochre-tint selection:text-ink [word-break:keep-all] [overflow-wrap:anywhere]">
        <TravelProvider>
          <SiteHeader />
          {children}
          <footer className="border-t border-line px-5 py-8 text-center text-xs leading-6 text-ink-3">
            <p className="font-display text-sm text-ink-2">울산, 나의 여행</p>
            <p className="mt-1">반구천의 암각화에서 시작하는 취향 여행 · 그림은 암각화 모티프를 단순화한 자체 도안입니다.</p>
          </footer>
        </TravelProvider>
      </body>
    </html>
  );
}
