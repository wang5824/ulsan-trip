/** 2단계 경로 추천 설문입니다. 여행 취향은 1단계 유형검사 결과를 사용합니다. */
export const surveyQuestions = [
  { id: "companion", title: "누구와 여행하시나요?", help: "동행에 맞춰 장소의 분위기를 골라요.", options: [
    { value: "solo", label: "혼자" }, { value: "couple", label: "연인" },
    { value: "friends", label: "친구" }, { value: "family", label: "가족" },
  ] },
  { id: "region", title: "울산의 어느 지역을 여행하고 싶으신가요?", help: "선택한 구·군 안에서만 장소를 추천해요.", options: [
    { value: "all", label: "울산 전체", hint: "지역 제한 없이 추천" },
    { value: "ulju", label: "울주군", hint: "간절곶·반구대·영남알프스" }, { value: "buk", label: "북구", hint: "강동 해변·주상절리" },
    { value: "dong", label: "동구", hint: "대왕암공원·주전 몽돌" }, { value: "jung", label: "중구", hint: "태화강·원도심" },
    { value: "nam", label: "남구", hint: "장생포·울산대공원" },
  ] },
  { id: "transport", title: "주로 어떻게 이동하시나요?", help: "이동수단에 따라 장소 사이 거리를 조절해요.", options: [
    { value: "car", label: "자가용" }, { value: "public-transit", label: "대중교통" },
  ] },
  { id: "time", title: "몇 시부터 몇 시까지 여행할 수 있나요?", help: "같은 날의 시작·종료 시간을 선택해주세요. 한국 시각 기준입니다.", options: [] },
  { id: "preferredFood", title: "어떤 음식을 가장 선호하시나요?", help: "코스 중간 식사 장소를 고를 때 반영해요.", options: [
    { value: "any", label: "상관없어요" }, { value: "korean", label: "한식" },
    { value: "seafood", label: "해산물" }, { value: "western", label: "양식" },
    { value: "vegetarian", label: "채식" },
  ] },
  { id: "requiredPlaces", title: "꼭 방문하고 싶은 장소가 있나요?", help: "선택 사항이에요. 원하는 장소가 없으면 그대로 넘어가세요.", options: [] },
] as const;

export type QuestionId = (typeof surveyQuestions)[number]["id"];
export type SurveyAnswers = Partial<Record<Exclude<QuestionId, "time" | "requiredPlaces">, string>> & {
  requiredPlaceIds?: string[];
  startTime?: string;
  endTime?: string;
};
