import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/src/components/SiteHeader";
import TravelProvider from "@/src/components/TravelProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "울산, 나의 여행 | 취향에 맞는 여행 코스",
  description: "10개의 질문으로 나의 여행 스타일을 알아보고 울산 여행 코스를 만나보세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#f8faf8] font-sans text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-950 [word-break:keep-all] [overflow-wrap:anywhere]">
        <TravelProvider>
          <SiteHeader />
          {children}
          <footer className="border-t border-teal-900/5 bg-white px-5 py-7 text-center text-xs leading-6 text-slate-500">울산, 나의 여행 <span aria-hidden="true" className="mx-2 text-slate-300">/</span> 취향을 따라 만나는 울산</footer>
        </TravelProvider>
      </body>
    </html>
  );
}
