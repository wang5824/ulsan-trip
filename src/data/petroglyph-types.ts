/**
 * 반구천의 암각화(반구대·천전리) 모티프로 만든 16가지 여행자 유형입니다.
 * 코드 순서: [여행 에너지 A/S][끌리는 무대 N/C][즐기는 방식 E/T][가고 싶은 곳 F/L]
 * 추천 코스의 로컬 장소 중 일부는 아직 장소 데이터에 없으므로, 추천 알고리즘이 아닌 소개 문구로만 사용합니다.
 */

export type GlyphKey =
  | "boat" | "hunter" | "boar" | "seal" | "whaleCalf" | "turtle" | "bird" | "deer"
  | "tiger" | "mask" | "leopard" | "wolf" | "fence" | "shaman" | "pod" | "circles";

export interface PetroglyphAxis {
  label: string;
  first: { code: string; label: string };
  second: { code: string; label: string };
}

export const PETROGLYPH_AXES: readonly PetroglyphAxis[] = [
  { label: "여행 에너지", first: { code: "A", label: "활동" }, second: { code: "S", label: "여유" } },
  { label: "끌리는 무대", first: { code: "N", label: "자연·바다" }, second: { code: "C", label: "문화·역사" } },
  { label: "즐기는 방식", first: { code: "E", label: "체험" }, second: { code: "T", label: "맛·풍경" } },
  { label: "가고 싶은 곳", first: { code: "F", label: "유명 명소" }, second: { code: "L", label: "조용한 로컬" } },
];

export interface PetroglyphType {
  code: string;
  name: string;
  glyph: GlyphKey;
  motif: string;
  tagline: string;
  keywords: readonly string[];
  course: string;
}

export const PETROGLYPH_TYPES: readonly PetroglyphType[] = [
  { code: "ANEF", name: "고래잡이 선단", glyph: "boat", motif: "배 위에서 작살을 든 고래잡이들", tagline: "울산에 왔으면 대표 명소는 다 찍어야죠. 하루를 꽉 채우는 원정대예요.", keywords: ["대표 명소", "일정 꽉꽉", "인증샷"], course: "대왕암공원 출렁다리 → 간절곶 → 장생포 고래문화마을" },
  { code: "ANEL", name: "걷는 사냥꾼", glyph: "hunter", motif: "활을 당기고 서 있는 사냥꾼", tagline: "관광버스가 안 오는 해안길을 찾아 끝까지 걸어가는 탐험가예요.", keywords: ["숨은 길", "해안 트레킹", "사람 적은 곳"], course: "강동 화암주상절리 → 정자항 해안길 → 주전몽돌해변" },
  { code: "ANTF", name: "돌진 멧돼지", glyph: "boar", motif: "땅을 박차고 달리는 멧돼지", tagline: "유명한 맛집과 명소를 쉬지 않고 돌파하는 미식 원정가예요.", keywords: ["유명 맛집", "명소 순회", "걷고 먹기"], course: "대왕암공원 → 언양불고기 거리 → 간절곶" },
  { code: "ANTL", name: "파도 타는 물개", glyph: "seal", motif: "바다를 미끄러지는 물개", tagline: "현지인만 아는 작은 포구를 돌며 그날 잡은 해산물을 먹어요.", keywords: ["작은 포구", "현지 횟집", "바닷길 산책"], course: "슬도 등대 산책 → 방어진항 횟집 → 주전몽돌해변" },
  { code: "SNEF", name: "새끼 업은 고래", glyph: "whaleCalf", motif: "새끼를 등에 업고 헤엄치는 어미 고래", tagline: "검증된 대표 공원에서 편하게 쉬엄쉬엄 즐겨요.", keywords: ["대표 공원", "쉬엄쉬엄", "실패 없는 선택"], course: "태화강 국가정원 십리대숲 → 울산대공원" },
  { code: "SNEL", name: "느긋한 거북", glyph: "turtle", motif: "천천히 그러나 멀리 가는 거북", tagline: "아무도 없는 강가 바위 앞에서 오래 머무는 산책가예요.", keywords: ["조용한 강변", "느린 산책", "혼자만의 시간"], course: "선바위 → 태화강 상류 강변길 산책" },
  { code: "SNTF", name: "바다새", glyph: "bird", motif: "바다 위를 나는 새", tagline: "유명한 일출 명소에서 해를 보고 오션뷰 카페로 향해요.", keywords: ["일출 명소", "오션뷰 카페", "감성 사진"], course: "간절곶 일출 → 진하해변 카페 → 명선도" },
  { code: "SNTL", name: "풀 뜯는 사슴", glyph: "deer", motif: "풀을 뜯는 사슴", tagline: "계곡물 소리 들리는 한적한 곳에서 시골 밥상과 쉼을 즐겨요.", keywords: ["계곡 쉼터", "시골 밥상", "한적함"], course: "작괘천(작천정) 계곡 → 언양 시골 카페" },
  { code: "ACEF", name: "줄무늬 호랑이", glyph: "tiger", motif: "줄무늬가 선명한 호랑이", tagline: "세계유산은 꼭 제대로 봐야 하는 정통파 탐구자예요.", keywords: ["세계유산", "해설 듣기", "정주행"], course: "반구대 암각화 → 울산암각화박물관 → 천전리 각석" },
  { code: "ACEL", name: "가면 쓴 사람", glyph: "mask", motif: "바위에 새겨진 사람 얼굴", tagline: "벽화 골목과 작은 문화 공간을 발굴하는 동네 탐험가예요.", keywords: ["벽화 골목", "문화 공간", "발굴하는 재미"], course: "장생포 문화창고 → 신화마을 벽화골목" },
  { code: "ACTF", name: "점박이 표범", glyph: "leopard", motif: "점무늬가 새겨진 표범", tagline: "핵심 유적만 빠르게 보고 지역 대표 음식으로 마무리해요.", keywords: ["효율 동선", "대표 메뉴", "짧고 굵게"], course: "반구대 암각화 → 언양기와집불고기" },
  { code: "ACTL", name: "골목 늑대", glyph: "wolf", motif: "귀를 세운 늑대", tagline: "오래된 원도심 골목과 시장에서 진짜 울산 맛을 찾아요.", keywords: ["원도심 골목", "전통시장", "야시장"], course: "중구 문화의거리 → 중앙전통시장(큰애기야시장)" },
  { code: "SCEF", name: "울타리 마을", glyph: "fence", motif: "짐승을 가둔 울타리", tagline: "잘 알려진 전통 마을에서 체험을 느긋하게 즐겨요.", keywords: ["전통 체험", "대표 마을", "여유 일정"], course: "외고산 옹기마을 체험 → 함양집 본점" },
  { code: "SCEL", name: "두 팔 든 제사장", glyph: "shaman", motif: "두 팔을 높이 든 사람", tagline: "옛 성곽과 정자를 천천히 걸으며 의미를 곱씹는 사색가예요.", keywords: ["옛 성곽", "정자", "사색"], course: "언양읍성 → 집청정 정자 → 반구천 산책" },
  { code: "SCTF", name: "고래 떼", glyph: "pod", motif: "함께 헤엄치는 고래 떼", tagline: "울산 하면 고래! 대표 고래 명소에서 이야기 듣고 든든하게 먹어요.", keywords: ["고래 이야기", "대표 명소", "든든한 한 끼"], course: "장생포 고래문화마을 → 고래박물관 → 함양집 본점" },
  { code: "SCTL", name: "천전리 동심원", glyph: "circles", motif: "천전리 바위의 동심원과 마름모", tagline: "사람 없는 옛 성터를 거닐고 바닷가 작은 카페에서 여운을 즐겨요.", keywords: ["옛 성터", "작은 카페", "느린 하루"], course: "서생포왜성 산책 → 서생 바닷가 카페" },
];

/** 100×100 viewBox 기준 선 그림입니다. 암각화 모티프를 단순화한 자체 도안입니다. */
export const GLYPH_PATHS: Record<GlyphKey, string> = {
  boat: "M8 62 Q50 86 92 62 M14 64 Q50 78 86 64 M26 66 V44 M38 70 V42 M50 71 V42 M62 70 V42 M74 66 V44 M80 52 L95 30 M23 40 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M35 38 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M47 38 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M59 38 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M71 40 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0",
  hunter: "M37 20 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M44 27 V58 M44 58 L32 86 M44 58 L56 86 M44 36 L66 44 M44 36 L30 50 M66 22 Q82 44 66 66 M66 22 V66 M58 44 L90 44 M84 40 L90 44 L84 48",
  boar: "M16 54 Q18 30 50 30 Q76 30 82 46 L92 50 L84 58 Q78 66 50 66 Q22 66 16 54 Z M84 52 L92 46 M28 64 V80 M40 66 V82 M60 66 V82 M72 64 V80 M36 30 L38 22 L42 30 M48 30 L50 22 L54 30 M16 50 Q8 46 10 38",
  seal: "M10 60 Q30 40 60 42 Q80 44 86 34 Q92 28 94 36 Q92 48 80 54 Q60 66 30 66 Z M40 64 L32 78 L48 70 M62 60 L66 74 L72 60 M10 60 L4 52 M10 60 L4 68",
  whaleCalf: "M6 64 Q24 42 58 48 Q74 52 80 58 L94 48 L90 62 L94 76 L80 66 Q68 76 42 76 Q18 76 6 64 Z M30 46 Q38 32 56 36 Q64 38 66 42 L74 36 L72 44 L74 52 L66 46 Q58 50 46 50 M14 52 Q12 40 18 34 M14 52 Q20 42 26 40",
  turtle: "M24 52 a26 20 0 1 0 52 0 a26 20 0 1 0 -52 0 M50 32 V72 M30 44 Q50 54 70 44 M30 60 Q50 50 70 60 M76 50 Q88 44 90 52 Q88 60 76 56 M32 36 L22 26 M68 36 L76 26 M32 68 L22 78 M68 68 L76 78 M24 52 L14 54",
  bird: "M8 40 Q30 26 48 46 Q66 26 92 40 M48 46 Q50 58 46 70 M40 66 L46 72 L52 66 M14 72 Q26 64 34 72 M66 74 Q78 66 88 74",
  deer: "M24 52 Q30 40 56 42 Q66 42 70 36 L74 24 Q80 22 82 28 L80 38 Q76 46 70 52 Q60 60 36 60 Q26 60 24 52 Z M30 58 L26 84 M38 60 L36 84 M58 58 L62 84 M66 56 L72 82 M76 24 L72 10 M74 16 L66 10 M78 24 L86 10 M82 16 L90 12 M24 50 L18 46",
  tiger: "M14 50 Q20 34 50 36 Q72 36 80 42 Q90 40 92 48 Q92 58 82 58 Q72 66 46 66 Q20 66 14 50 Z M32 38 L28 64 M44 36 L42 66 M56 36 L56 66 M68 38 L70 64 M24 62 L22 84 M36 66 L36 84 M62 66 L64 84 M76 60 L80 82 M14 48 Q4 40 8 28 Q12 22 16 28 M84 42 L84 34 L88 40",
  mask: "M50 10 Q80 12 80 46 Q80 82 50 90 Q20 82 20 46 Q20 12 50 10 Z M32 42 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M56 42 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M50 50 V62 M38 72 Q50 80 62 72 M26 22 L18 12 M74 22 L82 12 M50 10 V2",
  leopard: "M10 52 Q18 38 48 38 Q72 38 80 44 Q92 42 92 52 Q90 60 80 58 Q70 64 44 64 Q18 64 10 52 Z M28 48 h4 M40 54 h4 M50 46 h4 M60 54 h4 M68 47 h4 M34 44 h3 M22 60 L18 82 M34 63 L33 84 M60 63 L62 84 M72 60 L78 80 M10 50 Q0 34 12 24",
  wolf: "M12 54 Q18 40 46 40 Q66 40 74 34 L78 22 L82 32 L86 24 L88 36 Q94 42 88 48 Q80 52 74 52 Q66 64 42 64 Q20 64 12 54 Z M24 62 L20 84 M36 64 L34 84 M58 62 L60 84 M68 58 L74 82 M12 52 Q2 58 6 70",
  fence: "M12 22 H88 V80 H12 Z M12 36 H88 M12 52 H88 M12 66 H88 M30 22 V80 M50 22 V80 M70 22 V80 M34 46 Q40 40 48 42 L52 38 L54 44 Q56 50 48 52 Q38 54 34 46 Z",
  shaman: "M42 22 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M50 30 V64 M50 64 L36 88 M50 64 L64 88 M50 40 L28 30 L22 12 M50 40 L72 30 L78 12 M22 12 L16 8 M22 12 L20 4 M22 12 L28 6 M78 12 L84 8 M78 12 L80 4 M78 12 L72 6",
  pod: "M6 40 Q16 28 34 32 Q42 34 46 38 L54 32 L52 40 L54 48 L46 42 Q38 48 24 48 Q12 48 6 40 Z M40 70 Q50 58 68 62 Q76 64 80 68 L88 62 L86 70 L88 78 L80 72 Q72 78 58 78 Q46 78 40 70 Z M52 18 Q60 10 72 12 Q78 14 80 16 L86 12 L84 18 L86 24 L80 20 Q74 24 66 24 Q56 24 52 18 Z",
  circles: "M14 50 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 M22 50 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M30 50 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M66 30 L84 50 L66 70 L48 50 Z M66 40 L75 50 L66 60 L57 50 Z M10 84 Q30 76 50 84 Q70 92 90 84",
};
