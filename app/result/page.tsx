import type { Metadata } from "next";
import RecommendationResult from "@/src/components/result/RecommendationResult";

export const metadata: Metadata = {
  title: "당신을 위한 울산 여행 | 추천 일정",
  description: "설문에서 선택한 여행 성향에 맞춘 울산 추천 코스를 확인하세요.",
};

export default function ResultPage() {
  return <RecommendationResult />;
}
