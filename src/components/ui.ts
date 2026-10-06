/** 여러 화면에서 함께 쓰는 버튼·카드 스타일입니다. */
export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ochre";

export const buttonPrimary = `inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-ochre px-6 py-3 text-[15px] font-semibold text-white shadow-[0_6px_0_0_var(--color-ochre-2)] transition-[transform,box-shadow,background-color] hover:bg-ochre-2 active:translate-y-1 active:shadow-[0_2px_0_0_var(--color-ochre-2)] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0 ${focusRing}`;

export const buttonSecondary = `inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-line bg-card px-6 py-3 text-[15px] font-semibold text-ink-2 transition-colors hover:border-ink-3 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

export const buttonOnDark = `inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-bone/30 px-6 py-3 text-[15px] font-semibold text-bone transition-colors hover:border-bone hover:bg-bone/10 ${focusRing}`;

export const card = "rounded-[1.75rem] border border-line bg-card";

export const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.16em]";
