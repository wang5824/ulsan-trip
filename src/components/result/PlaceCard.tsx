import { calculatePreferenceFit, type ScoredPlace } from "../../lib/recommendation";
import { DISTRICT_LABELS, type PlaceCategory, type PlaceType, type UserProfile } from "../../types/travel";
import { PLACE_CATEGORY_LABELS as categoryLabels } from "../../lib/place-categories";
import { getPlaceStory } from "../../data/place-stories";
import { petVerdict, wheelchairVerdict, type AccessVerdict } from "../../lib/access";
import type { PetroglyphType, GlyphKey } from "../../data/petroglyph-types";
import PetroglyphGlyph from "../petroglyph/PetroglyphGlyph";
import PlacePhoto from "./PlacePhoto";

const typeLabels: Record<PlaceType, string> = { attraction: "관광지", restaurant: "음식점", cafe: "카페" };
const typeTone: Record<PlaceType, string> = {
  attraction: "bg-sea text-white", restaurant: "bg-ochre text-white", cafe: "bg-ink text-paper",
};
const categoryGlyph: Record<PlaceCategory, GlyphKey> = {
  nature: "deer", sea: "whaleCalf", culture: "circles", experience: "hunter",
  korean: "boar", seafood: "seal", western: "boar", chinese: "boar", japanese: "seal",
  "fast-food": "boar", "other-food": "boar", cafe: "turtle",
};
const verdictText: Record<AccessVerdict, string> = { yes: "가능", partial: "일부 가능", no: "어려움", unknown: "미확인" };
const verdictTone: Record<AccessVerdict, string> = {
  yes: "border-sea/30 bg-sea-tint text-sea-2", partial: "border-sea/20 bg-sea-tint/50 text-sea-2",
  no: "border-ochre/30 bg-ochre-tint text-ochre-2", unknown: "border-line bg-paper text-ink-3",
};

function formatVisitors(count: number): string {
  if (count >= 10000) {
    const man = count / 10000;
    return `${man >= 100 ? Math.round(man).toLocaleString("ko-KR") : man.toFixed(1).replace(/\.0$/, "")}만 명`;
  }
  return `${count.toLocaleString("ko-KR")}명`;
}

// 장소 데이터에 공통 문구만 있는 경우 화면에서 생략합니다.
const isBoilerplate = (text: string) => /소개하는 방문 장소입니다\.?$/.test(text);

export interface PlaceCardProps {
  recommendation: ScoredPlace;
  traveler: PetroglyphType;
  profile: UserProfile;
  /** 캐릭터 한마디(코스 단위로 중복 없이 미리 계산) */
  quip: { lines: string[]; cry: string };
}

export default function PlaceCard({ recommendation, traveler, profile, quip }: PlaceCardProps) {
  const { place } = recommendation;
  const story = getPlaceStory(place.id);
  const preferenceFit = calculatePreferenceFit(recommendation);
  const needs = profile.accessNeeds;
  const wheel = wheelchairVerdict(place);
  const pets = petVerdict(place);
  const showWheel = needs?.wheelchair || (wheel !== "unknown" && story?.barrierFree);
  const showPets = needs?.pets || (pets !== "unknown" && story?.pets);
  const blogSearch = `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(`울산 ${place.name}`)}`;

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-line bg-card">
      <PlacePhoto titles={story?.wikiTitles} alt={place.name} glyph={categoryGlyph[place.category]} glyphId={`photo-${place.id}`} />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className={`rounded-full px-3 py-1 ${typeTone[place.type]}`}>{typeLabels[place.type]} · {categoryLabels[place.category]}</span>
          <span className="rounded-full bg-sand px-3 py-1 text-ink-2">{place.district ? DISTRICT_LABELS[place.district] : "지역 미확인"}</span>
          {place.isTourismDure && <span className="rounded-full bg-ochre-tint px-3 py-1 text-ochre-2">관광두레</span>}
        </div>
        <h3 className="mt-4 font-display text-xl font-bold leading-snug tracking-tight sm:text-2xl">{place.name}</h3>
        <p className="mt-1.5 text-xs leading-5 text-ink-3">{place.address ?? "주소 미확인"} · {place.indoor === null ? "실내외 미확인" : place.indoor ? "실내" : "야외"}</p>

        {Boolean(story?.visitors || story?.trend.length) && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {story?.visitors && (
              <a href={story.visitors.source} target="_blank" rel="noreferrer" title={story.visitors.label} className="inline-flex items-baseline gap-1 rounded-full bg-ink px-3 py-1 text-xs text-paper hover:bg-rock-2">
                <span className="font-display text-sm font-bold">{formatVisitors(story.visitors.count)}</span>
                <span className="text-paper/70">{story.visitors.year} {story.visitors.label}</span>
              </a>
            )}
            {story?.trend.map(tag => <span key={tag} className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-2">#{tag}</span>)}
          </div>
        )}

        {place.description && !isBoilerplate(place.description) && <p className="mt-4 text-sm leading-7 text-ink-2">{place.description}</p>}

        <div className="relative mt-5 rounded-2xl bg-rock p-4 pl-[4.25rem] text-bone">
          <span className="absolute left-3 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rock-2 text-ochre-tint">
            <PetroglyphGlyph glyph={traveler.glyph} label="" filterId={`quip-${place.id}`} className="h-9 w-9" />
          </span>
          <p className="text-[11px] font-semibold text-bone/55">{traveler.name}의 한마디</p>
          <p className="mt-1 text-sm leading-6">
            {quip.lines.join(" ")} <span className="font-display font-bold text-ochre-tint">{quip.cry}</span>
          </p>
          {story?.tip && (
            <p className="mt-3 border-t border-bone/10 pt-3 text-[13px] leading-6 text-bone/85">
              <span className="mr-1.5 rounded bg-ochre px-1.5 py-0.5 text-[10px] font-bold text-white">현장 메모</span>
              {story.tip.text}
              {story.tip.source && <a href={story.tip.source} target="_blank" rel="noreferrer" className="ml-1.5 text-[11px] text-bone/50 underline underline-offset-2">출처</a>}
            </p>
          )}
          <p className="mt-3 flex items-center gap-2 text-[11px] text-bone/50">
            내 취향과
            <span className="relative h-1 w-12 overflow-hidden rounded-full bg-bone/15" aria-hidden="true"><span className="absolute inset-y-0 left-0 rounded-full bg-ochre-tint" style={{ width: `${preferenceFit}%` }} /></span>
            <span className="tabular-nums text-bone/70">{preferenceFit}%</span>
          </p>
        </div>

        {(showWheel || showPets) && (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {showWheel && (
              <li className={`rounded-xl border px-3 py-2 text-xs leading-5 ${verdictTone[wheel]}`}>
                <span className="font-bold">휠체어·유모차 {verdictText[wheel]}</span>
                {story?.barrierFree?.note && <span className="block opacity-80">{story.barrierFree.note}</span>}
                {!story?.barrierFree && wheel === "unknown" && <span className="block opacity-80">방문 전 경사·계단을 확인해 주세요.</span>}
              </li>
            )}
            {showPets && (
              <li className={`rounded-xl border px-3 py-2 text-xs leading-5 ${verdictTone[pets]}`}>
                <span className="font-bold">반려동물 동반 {verdictText[pets]}</span>
                {story?.pets?.note && <span className="block opacity-80">{story.pets.note}</span>}
                {!story?.pets && pets === "unknown" && <span className="block opacity-80">{place.type === "attraction" ? "목줄·배변봉투는 기본, 동반 규정은 현장 확인." : "식당·카페 동반 여부는 방문 전 문의해 주세요."}</span>}
              </li>
            )}
          </ul>
        )}

        <div className="mt-5 border-t border-dashed border-line pt-4">
          <p className="text-xs font-bold text-ink-2">다녀온 사람들 이야기</p>
          <ul className="mt-2 grid gap-1.5">
            {story?.blogs.map(blog => (
              <li key={blog.url}>
                <a href={blog.url} target="_blank" rel="noreferrer" className="group flex items-start gap-2 text-sm leading-6 text-ink hover:text-sea">
                  <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-ochre" />
                  <span className="min-w-0"><span className="underline decoration-line underline-offset-4 group-hover:decoration-sea">{blog.title}</span> <span className="text-xs text-ink-3">{blog.source}{blog.date ? ` · ${blog.date}` : ""}</span></span>
                </a>
              </li>
            ))}
            <li>
              <a href={blogSearch} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-sea underline underline-offset-4">네이버 블로그 후기 더 보기 ↗</a>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
}
