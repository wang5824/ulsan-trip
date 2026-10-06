import type { PlaceStory } from "../data/place-stories";
import type { Place, UserProfile } from "../types/travel";

/** 유형별 말버릇. 문장 끝에 붙는 의성어·구호와 말투입니다. */
const VOICES: Record<string, { cry: string; style: "push" | "slow" | "curious" | "hungry" }> = {
  ANEF: { cry: "출항!", style: "push" },
  ANEL: { cry: "발자국 따라 간다.", style: "push" },
  ANTF: { cry: "돌진!", style: "hungry" },
  ANTL: { cry: "첨벙!", style: "hungry" },
  SNEF: { cry: "쉬엄쉬엄 가자.", style: "slow" },
  SNEL: { cry: "느릿느릿, 그래도 멀리.", style: "slow" },
  SNTF: { cry: "훨훨~", style: "slow" },
  SNTL: { cry: "오물오물.", style: "hungry" },
  ACEF: { cry: "어흥, 정주행 간다.", style: "curious" },
  ACEL: { cry: "숨은 얼굴 찾기 시작.", style: "curious" },
  ACTF: { cry: "핵심만 빠르게.", style: "push" },
  ACTL: { cry: "골목 냄새 킁킁.", style: "hungry" },
  SCEF: { cry: "오순도순 들어가 보자.", style: "slow" },
  SCEL: { cry: "두 팔 벌려 천천히.", style: "curious" },
  SCTF: { cry: "다 같이 고래고래!", style: "hungry" },
  SCTL: { cry: "동그랗게 여운 남기기.", style: "slow" },
};

export interface QuipContext {
  code: string;
  profile: UserProfile;
  place: Place;
  story?: PlaceStory;
  /** 도착 시각(자정부터 분) */
  arrivalMinutes: number;
  /** 이전 장소에서 이동 시간(분), 첫 장소면 0 */
  travelMinutes: number;
  isFirst: boolean;
  isLast: boolean;
}

interface Rule {
  when: (c: QuipContext) => boolean;
  say: (c: QuipContext) => string;
}

const hour = (c: QuipContext) => Math.floor(c.arrivalMinutes / 60);
const has = (c: QuipContext, tag: string) => c.story?.trend.includes(tag) ?? false;

/**
 * 장소 데이터·일정·유형에 맞는 문장을 우선순위대로 고릅니다. 사실은 데이터에 있는 것만 말합니다.
 * 위에서부터 조건을 만족하는 문장을 최대 2개 사용합니다.
 */
const RULES: Rule[] = [
  { when: c => c.place.type === "restaurant" && c.code[2] === "T", say: () => "드디어 내 시간. 배고프게 와야 손해 안 봐." },
  { when: c => c.place.type === "restaurant" && c.place.category === "seafood", say: () => "바다 도시 왔으면 해산물은 의무지." },
  { when: c => c.place.type === "restaurant" && c.place.category === "korean", say: () => "밥심으로 남은 일정 버티는 거야." },
  { when: c => c.place.type === "restaurant", say: () => "여기서 충전하고 다음으로!" },
  { when: c => c.place.type === "cafe", say: () => "다리 쉬는 타임. 창가 자리 있으면 무조건 거기." },
  { when: c => c.place.type === "cafe", say: () => "오늘 찍은 사진 정리하기 딱 좋은 자리야." },
  { when: c => has(c, "야경") && hour(c) >= 17, say: () => "도착하면 해 질 무렵이야. 불 켜지는 순간까지 버텨 봐." },
  { when: c => has(c, "야경") && hour(c) < 17, say: () => "여긴 밤에 진짜 얼굴이 나와. 일정 끝나고 다시 들러도 후회 없어." },
  { when: c => has(c, "일출") && hour(c) < 9, say: () => "아침 일찍 도착이라 해 뜨는 쪽 하늘이 아직 붉을지도 몰라." },
  { when: c => has(c, "일몰") && hour(c) >= 16, say: () => "노을 시간대에 딱 맞춰 도착해. 서쪽 하늘부터 확인!" },
  { when: c => has(c, "맨발걷기"), say: () => "신발 벗을 각오 해. 발바닥이 먼저 여행하는 곳이야." },
  { when: c => has(c, "캠핑"), say: () => "다음엔 하룻밤 자고 가도 좋겠다. 오늘은 분위기만 미리 맛보기." },
  { when: c => c.place.type === "attraction" && c.place.indoor === true, say: () => "실내라 비가 와도 일정이 안 무너져. 날씨 걱정은 접어 둬." },
  { when: c => c.profile.companion === "family" && has(c, "아이와 함께"), say: () => "아이들 체력 쏙 빠지는 곳. 오늘 밤 꿀잠 예약." },
  { when: c => c.profile.companion === "couple" && has(c, "인생샷"), say: () => "둘이 찍으면 프로필 사진 한 장은 건진다." },
  { when: c => has(c, "역사 탐방") && c.code[1] === "C", say: () => "안내판 그냥 지나치지 마. 여기 이야기가 꽤 세." },
  { when: c => has(c, "바다 뷰") && c.code[1] === "N", say: () => "파도 소리 들리면 잠깐 멈춰. 그게 이 코스의 하이라이트야." },
  { when: c => c.place.activityLevel >= 4 && c.code[0] === "S", say: () => "좀 걸어야 하는 곳이야. 중간중간 쉬면서 천천히 가자." },
  { when: c => c.place.activityLevel >= 4 && c.code[0] === "A", say: () => "다리 좀 쓰는 곳. 오늘 걸음 수 여기서 다 채운다." },
  { when: c => c.travelMinutes >= 40, say: c => `이동이 ${c.travelMinutes}분쯤 걸려. 가는 길에 간식 하나 챙겨.` },
  { when: c => c.travelMinutes > 0 && c.travelMinutes <= 10, say: c => `바로 옆이야. ${c.travelMinutes}분이면 도착.` },
  { when: c => has(c, "무료"), say: () => "입장료 0원. 아낀 돈은 다음 맛집에 쓰자." },
  { when: c => c.isFirst, say: () => "오늘의 첫 발자국은 여기서 찍는다." },
  { when: c => c.place.category === "culture", say: () => "안내판 하나만 읽어도 여행이 두 배 재밌어져." },
  { when: c => c.place.category === "culture", say: () => "사진보다 이야기가 오래 남는 곳이야." },
  { when: c => c.place.category === "experience", say: () => "구경만 하면 반칙! 직접 해 봐야 해." },
  { when: c => c.place.category === "nature", say: () => "잠깐 휴대폰 내려놓고 바람 소리 들어 봐." },
  { when: c => c.place.category === "sea", say: () => "바닷바람 세니까 겉옷 하나 챙겨." },
  { when: c => c.isLast, say: () => "오늘의 마지막 장면. 천천히 눈에 담고 가." },
];

const FALLBACK: Record<string, string> = {
  push: "동선 좋다. 여기 찍고 바로 다음으로!",
  slow: "서두를 필요 없어. 여기선 한 박자 쉬어 가자.",
  curious: "구석구석 살펴보면 숨은 이야기가 있을 거야.",
  hungry: "구경 끝나면 근처 간식부터 찾아보자.",
};

/**
 * 유형 캐릭터가 이 장소에서 할 말(1~2문장)과 구호를 돌려줍니다.
 * used를 넘기면 같은 코스의 앞 장소에서 한 말은 반복하지 않습니다(사용한 문장을 used에 추가합니다).
 */
export function characterQuips(context: QuipContext, used: Set<string> = new Set()): { lines: string[]; cry: string } {
  const voice = VOICES[context.code] ?? { cry: "", style: "curious" as const };
  const lines: string[] = [];
  for (const rule of RULES) {
    if (lines.length === 2) break;
    if (!rule.when(context)) continue;
    const line = rule.say(context);
    if (used.has(line)) continue;
    lines.push(line);
    used.add(line);
  }
  return { lines: lines.length ? lines : [FALLBACK[voice.style]], cry: voice.cry };
}
