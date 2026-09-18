const ratingOptions = [
  { value: "1", label: "1 · 전혀 좋아하지 않아요" },
  { value: "2", label: "2 · 별로 좋아하지 않아요" },
  { value: "3", label: "3 · 보통이에요" },
  { value: "4", label: "4 · 좋아해요" },
  { value: "5", label: "5 · 아주 좋아해요" },
];

export const surveyQuestions = [
  { id: "companion", title: "누구와 여행하시나요?", options: [
    { value: "solo", label: "혼자" }, { value: "couple", label: "연인" },
    { value: "friends", label: "친구" }, { value: "family", label: "가족" },
  ] },
  { id: "transport", title: "주로 어떻게 이동하시나요?", options: [
    { value: "car", label: "자가용" }, { value: "public-transit", label: "대중교통" },
  ] },
  { id: "activityLevel", title: "활동적인 여행을 얼마나 좋아하시나요?", options: ratingOptions },
  { id: "restFrequency", title: "여행 중 휴식이 얼마나 자주 필요한가요?", options: [
    { value: "5", label: "자주 · 틈틈이 쉬고 싶어요" },
    { value: "3", label: "보통 · 적당히 쉬고 싶어요" },
    { value: "1", label: "적게 · 쉬는 시간이 적어도 괜찮아요" },
  ] },
  { id: "nature", title: "자연을 즐기는 여행을 얼마나 좋아하시나요?", options: ratingOptions },
  { id: "food", title: "맛집을 찾아가는 여행을 얼마나 좋아하시나요?", options: ratingOptions },
  { id: "culture", title: "역사와 문화를 알아가는 여행을 얼마나 좋아하시나요?", options: ratingOptions },
  { id: "experience", title: "직접 참여하는 체험을 얼마나 좋아하시나요?", options: ratingOptions },
  { id: "preferredFood", title: "어떤 음식을 가장 선호하시나요?", options: [
    { value: "any", label: "상관없어요" }, { value: "korean", label: "한식" },
    { value: "seafood", label: "해산물" }, { value: "western", label: "양식" },
    { value: "vegetarian", label: "채식" },
  ] },
  { id: "time", title: "몇 시부터 몇 시까지 여행할 수 있나요?", options: [] },
] as const;

export type QuestionId = (typeof surveyQuestions)[number]["id"];
export type SurveyAnswers = Partial<Record<Exclude<QuestionId, "time">, string>> & {
  startTime?: string;
  endTime?: string;
};
