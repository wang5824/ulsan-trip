import type { Metadata } from "next";
import SurveyForm from "@/src/components/survey/SurveyForm";

export const metadata: Metadata = {
  title: "여행 성향 설문 | 울산 여행",
  description: "13개의 질문(선택 항목 1개 포함)으로 나에게 맞는 울산 여행 성향을 알아보세요.",
};

export default function SurveyPage() {
  return <SurveyForm />;
}
