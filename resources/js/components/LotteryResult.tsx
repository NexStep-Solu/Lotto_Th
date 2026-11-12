import { DigitTiles, NumberChips } from '@/components/lottery/DigitTiles';
import PrizeLedger, { type PrizeEntry } from '@/components/lottery/PrizeLedger';
import { type LotteryPayload } from '@/components/lottery/TicketChecker';
import { convertThaiDate, prizeTranslate, runningTranslate } from '@/lib/lottoTranslate';
import { cn } from '@/lib/utils';

function EmptyDraw() {
    return (
        <section className="rounded-2xl border border-dashed border-[#17251c]/15 bg-[#fbf9f2]/55 px-6 py-14 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02]">
            <p className="eyebrow text-[#0c5c43] dark:text-[#8be0c4]">Awaiting results</p>
            <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">No draw published yet</h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-relaxed">
                This draw has not been published by the source yet. Pick an earlier draw from the archive, or check back after the results are
                announced.
            </p>
        </section>
    );
}

export default function LotteryResult({ data }: { data?: LotteryPayload | null }) {
    const prizes = data?.response?.prizes ?? [];
    const running = data?.response?.runningNumbers ?? [];
    const date = data?.response?.date;

    if (!data?.response || (prizes.length === 0 && running.length === 0)) {
        return <EmptyDraw />;
    }

    const firstPrize = prizes.find((prize) => prize.id === 'prizeFirst');
    const nearFirst = prizes.find((prize) => prize.id === 'prizeFirstNear');
    const otherPrizes = prizes.filter((prize) => !['prizeFirst', 'prizeFirstNear'].includes(prize.id));
    const prizeTotal = prizes.reduce((sum, prize) => sum + (prize.number?.length ?? 0), 0);

    return (
        <div className="space-y-5 sm:space-y-6">
            <header className="flex flex-col gap-5 border-b border-[#17251c]/10 pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-white/[0.08]">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0c5c43] dark:bg-[#3cbf96]" />
                        <p className="eyebrow text-[#0c5c43] dark:text-[#8be0c4]">Thai government lottery</p>
                    </div>
                    <h2 className="font-display mt-2.5 text-[2rem] leading-[0.95] tracking-tight sm:text-[2.75rem]">
                        Draw of {date ? convertThaiDate(date) : 'an unlisted date'}
                    </h2>
                    <p className="text-muted-foreground mt-2 max-w-lg text-xs leading-relaxed">
                        First prize, neighbouring numbers, running prizes and every published tier — all on one sheet.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0c5c43]/20 bg-[#0c5c43]/[0.06] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#0c5c43] uppercase dark:border-[#8be0c4]/20 dark:bg-[#8be0c4]/10 dark:text-[#8be0c4]">
                        Official summary
                    </span>
                    <span className="font-ticket text-muted-foreground text-[10px] tabular-nums">
                        {prizes.length} tiers · {prizeTotal} numbers
                    </span>
                </div>
            </header>

            {firstPrize && (
                <section
                    className={cn(
                        'ticket-surface relative overflow-hidden rounded-2xl border border-[#17251c]/10 p-5 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_24px_60px_-46px_rgba(18,32,25,0.6)] sm:p-7',
                        'dark:border-white/[0.09] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_24px_60px_-46px_rgba(0,0,0,0.9)]',
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#0c5c43]/[0.08] blur-3xl dark:bg-[#3cbf96]/[0.08]"
                    />

                    <div className="relative flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="eyebrow text-[#0c5c43] dark:text-[#8be0c4]">First prize</p>
                            <h3 className="font-display mt-2 text-3xl leading-none tracking-tight">The winning number</h3>
                        </div>
                        <div className="rounded-xl border border-[#17251c]/10 bg-[#fffdf7]/80 px-3.5 py-2.5 text-right dark:border-white/10 dark:bg-white/[0.06]">
                            <p className="eyebrow text-muted-foreground text-[9px]">Prize per ticket</p>
                            <p className="font-ticket mt-1 text-base font-medium text-[#0c5c43] tabular-nums dark:text-[#8be0c4]">
                                {firstPrize.reward.toLocaleString()} THB
                            </p>
                        </div>
                    </div>

                    <div className="relative mt-7 overflow-x-auto pb-1 sm:mt-9">
                        <DigitTiles number={firstPrize.number?.[0]} size="xl" tone="solid" className="min-w-max" />
                    </div>

                    <div className="relative mt-6 grid gap-4 border-t border-dashed border-[#17251c]/15 pt-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-start dark:border-white/10">
                        <div>
                            <p className="eyebrow text-muted-foreground">Near first</p>
                            <p className="text-muted-foreground mt-1 text-[11px]">Off-by-one numbers</p>
                        </div>
                        <NumberChips numbers={nearFirst?.number} tone="outline" className="sm:justify-end" />
                    </div>
                </section>
            )}

            {running.length > 0 && (
                <section className="overflow-hidden rounded-2xl border border-[#17251c]/10 bg-[#fbf9f2]/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.025]">
                    <header className="flex items-end justify-between gap-3 border-b border-[#17251c]/10 px-5 py-4 dark:border-white/[0.07]">
                        <div>
                            <p className="eyebrow text-muted-foreground">Running prizes</p>
                            <h3 className="font-display mt-1.5 text-2xl leading-none tracking-tight">The short numbers</h3>
                        </div>
                        <span className="font-ticket text-muted-foreground text-[10px] tabular-nums">{running.length} categories</span>
                    </header>

                    <div className="grid divide-y divide-[#17251c]/[0.07] sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/[0.06]">
                        {running.map((entry) => (
                            <div key={entry.id} className="px-5 py-5">
                                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.13em] uppercase">
                                    {runningTranslate[entry.name] ?? entry.name}
                                </p>
                                <p className="font-ticket text-muted-foreground/80 mt-1 text-[10px] tabular-nums">
                                    {entry.reward.toLocaleString()} THB
                                </p>
                                <NumberChips numbers={entry.number} tone="accent" className="mt-3" />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <PrizeLedger
                prizes={otherPrizes}
                nameFor={(prize: PrizeEntry) => prizeTranslate[prize.name] ?? prize.name}
                currency="THB"
                title="Every published tier"
                description="Tap “Show all” on a tier to reveal its full number set."
            />
        </div>
    );
}
