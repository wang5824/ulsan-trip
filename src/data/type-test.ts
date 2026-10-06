import type { GlyphKey } from "./petroglyph-types";

/**
 * 1단계 암각화 여행자 유형검사의 상황형 질문입니다.
 * 축 순서는 petroglyph-types.ts의 PETROGLYPH_AXES와 같습니다.
 * 0: 여행 에너지(A/S), 1: 끌리는 무대(N/C), 2: 즐기는 방식(E/T), 3: 가고 싶은 곳(F/L)
 * 축마다 3문항이라 동점이 없으며, 다수결로 유형 글자를 정합니다.
 */
export interface TypeTestOption {
  /** 이 선택지가 가리키는 축 글자(A·S·N·C·E·T·F·L 중 하나) */
  letter: string;
  label: string;
}

export interface TypeTestQuestion {
  id: string;
  axis: 0 | 1 | 2 | 3;
  scene: string;
  title: string;
  glyph: GlyphKey;
  options: readonly [TypeTestOption, TypeTestOption];
}

export const TYPE_TEST_QUESTIONS: readonly TypeTestQuestion[] = [
  { id: "q1", axis: 0, glyph: "bird", scene: "여행 첫날 아침 7시", title: "알람이 울렸다. 당신의 선택은?", options: [
    { letter: "A", label: "바로 일어나 바다 보러 출발! 아침 공기가 제일 좋아요" },
    { letter: "S", label: "5분만 더… 느긋하게 일어나 브런치부터 먹을래요" },
  ] },
  { id: "q2", axis: 1, glyph: "circles", scene: "여행 사진첩을 열었다", title: "가장 많이 남아 있는 사진은?", options: [
    { letter: "C", label: "오래된 건물, 유적, 전시 작품" },
    { letter: "N", label: "파도, 숲, 노을 같은 풍경" },
  ] },
  { id: "q3", axis: 2, glyph: "boat", scene: "울산에 왔으니 이건 꼭!", title: "‘이건 해봐야지’ 싶은 건?", options: [
    { letter: "E", label: "옹기 만들기, 고래바다여행선 같은 직접 해보는 체험" },
    { letter: "T", label: "언양불고기 한 접시와 창밖 바다 풍경" },
  ] },
  { id: "q4", axis: 3, glyph: "mask", scene: "코스를 짜기 시작했다", title: "가장 먼저 검색하는 건?", options: [
    { letter: "F", label: "‘울산 가볼 만한 곳 BEST 10’" },
    { letter: "L", label: "현지인 블로그의 ‘나만 아는 곳’" },
  ] },
  { id: "q5", axis: 0, glyph: "hunter", scene: "대왕암공원까지 걸어서 40분, 택시로 10분", title: "어떻게 갈까요?", options: [
    { letter: "S", label: "택시 타고 가서, 아낀 체력은 나중에 쓸래요" },
    { letter: "A", label: "해안길 따라 걸어가요. 그게 여행이죠" },
  ] },
  { id: "q6", axis: 1, glyph: "deer", scene: "비가 그친 오후, 딱 한 곳만 갈 수 있다면", title: "어디로 갈까요?", options: [
    { letter: "N", label: "안개 낀 태화강 십리대숲 산책" },
    { letter: "C", label: "울산암각화박물관에서 7천 년 전 이야기 듣기" },
  ] },
  { id: "q7", axis: 2, glyph: "seal", scene: "동행이 묻는다. “우리 뭐 할까?”", title: "당신의 대답은?", options: [
    { letter: "T", label: "“맛있는 거 먹으면서 경치 보자”" },
    { letter: "E", label: "“직접 해볼 수 있는 거 하자!”" },
  ] },
  { id: "q8", axis: 3, glyph: "wolf", scene: "유명한 맛집 앞, 대기 1시간", title: "어떻게 할까요?", options: [
    { letter: "F", label: "기다려서라도 먹어요. 유명한 데는 이유가 있으니까" },
    { letter: "L", label: "옆 골목 손님 없는 노포로 바로 들어가요" },
  ] },
  { id: "q9", axis: 0, glyph: "turtle", scene: "오후 3시, 다리가 슬슬 무거워진다", title: "다음 일정은?", options: [
    { letter: "A", label: "한 곳만 더! 아직 갈 데가 많아요" },
    { letter: "S", label: "카페에 앉아 바다 보며 한 시간 쉬어요" },
  ] },
  { id: "q10", axis: 1, glyph: "whaleCalf", scene: "여행 기념품 가게에 들렀다", title: "손이 가는 물건은?", options: [
    { letter: "N", label: "바다 풍경이 담긴 엽서와 몽돌 모양 소품" },
    { letter: "C", label: "지역 이야기가 담긴 책이나 전통 공예품" },
  ] },
  { id: "q11", axis: 2, glyph: "fence", scene: "여행이 끝나고 한 달 뒤", title: "가장 생생하게 떠오르는 건?", options: [
    { letter: "E", label: "처음 해본 경험과 손으로 만든 결과물" },
    { letter: "T", label: "그날 먹은 음식 맛과 창밖 풍경" },
  ] },
  { id: "q12", axis: 3, glyph: "pod", scene: "인생샷을 찍었는데 사람이 가득하다", title: "어떤 생각이 드나요?", options: [
    { letter: "L", label: "다음엔 사람 없는 곳을 찾아가야겠다" },
    { letter: "F", label: "그래도 여기 왔다는 인증이 중요하죠" },
  ] },
];
