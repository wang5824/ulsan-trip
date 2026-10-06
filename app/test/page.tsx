import type { Metadata } from "next";
import TypeTest from "@/src/components/test/TypeTest";

export const metadata: Metadata = {
  title: "암각화 여행자 유형검사 | 울산, 나의 여행",
  description: "12개의 상황 질문으로 반구천의 암각화 16유형 중 나와 닮은 여행자 그림을 찾아보세요.",
};

export default function TestPage() {
  return <TypeTest />;
}
