import type { Metadata } from "next";
import SurveyForm from "@/src/components/survey/SurveyForm";

export const metadata: Metadata = {
  title: "코스 만들기 | 울산, 나의 여행",
  description: "내 암각화 여행자 유형에 동행·지역·이동수단·시간을 더해 울산 하루 코스를 추천받아 보세요.",
};

export default function SurveyPage() {
  return <SurveyForm />;
}
