import { DigitTiles, NumberChips } from '@/components/lottery/DigitTiles';
import PrizeLedger, { type PrizeEntry } from '@/components/lottery/PrizeLedger';
import { type LotteryPayload } from '@/components/lottery/TicketChecker';
import { sgPrizeNames } from '@/lib/lottoTranslate';
import { cn } from '@/lib/utils';

type SgPrize = NonNullable<NonNullable<LotteryPayload['response']>['prizes']>[number];

type SgLotteryResultData = LotteryPayload;

const CURRENCY = 'SGD';

function EmptyDraw() {
    return (
        <section className="rounded-2xl border border-dashed border-[#17251c]/15 bg-[#fbf9f2]/55 px-6 py-14 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02]">
            <p className="eyebrow text-[#0c5c43] dark:text-[#8be0c4]">Awaiting results</p>
            <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">No draw published yet</h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-relaxed">
                This Singapore Sweep draw has not been published by the source yet. Choose an earlier draw from the archive, or check back after the
                results are announced.
            </p>
        </section>
    );
}

function PrizeCard({ label, prize, className, featured = false }: { label: string; prize: SgPrize; className?: string; featured?: boolean }) {
    return (
        <section
            className={cn(
                'ticket-surface relative overflow-hidden rounded-2xl border border-[#17251c]/10 p-5 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_24px_60px_-46px_rgba(18,32,25,0.6)]',
                'dark:border-white/[0.09] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_24px_60px_-46px_rgba(0,0,0,0.9)]',
                featured ? 'sm:p-7' : 'sm:p-5',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="eyebrow text-[#0c5c43] dark:text-[#8be0c4]">{label}</p>
                    <p className="text-muted-foreground mt-1.5 text-[11px]">
                        {prize.reward.toLocaleString()} {CURRENCY} per ticket
                    </p>
                </div>
                {featured && (
                    <span className="rounded-full border border-[#b08d57]/30 bg-[#b08d57]/[0.1] px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] text-[#7d6138] uppercase dark:border-[#d8b47a]/25 dark:bg-[#d8b47a]/10 dark:text-[#e6c795]">
                        Top prize
                    </span>
                )}
            </div>

            <div className={cn('mt-5 overflow-x-auto pb-1', featured && 'mt-7 sm:mt-8')}>
                <DigitTiles number={prize.number?.[0]} size={featured ? 'xl' : 'lg'} tone="solid" className="min-w-max" />
            </div>

            {(prize.number?.length ?? 0) > 1 && (
                <div className="mt-4 border-t border-dashed border-[#17251c]/15 pt-3 dark:border-white/10">
                    <p className="text-muted-foreground text-[10px] tracking-[0.13em] uppercase">Other winning numbers</p>
                    <NumberChips numbers={prize.number?.slice(1)} tone="outline" className="mt-2" />
                </div>
            )}
        </section>
    );
}

export default function SgLotteryResult({ data }: { data?: SgLotteryResultData | null }) {
    const prizes = data?.response?.prizes ?? [];
    const twoDLuck = data?.response?.twoDLuck ?? [];

    if (!data?.response || (prizes.length === 0 && twoDLuck.length === 0)) {
        return <EmptyDraw />;
    }

    const firstPrize = prizes.find((prize) => prize.id === 'firstPrize');
    const secondPrize = prizes.find((prize) => prize.id === 'secondPrize');
    const thirdPrize = prizes.find((prize) => prize.id === 'thirdPrize');
    const otherPrizes = prizes.filter((prize) => !['firstPrize', 'secondPrize', 'thirdPrize'].includes(prize.id));
    const prizeTotal = prizes.reduce((sum, prize) => sum + (prize.number?.length ?? 0), 0);

    return (
        <div className="space-y-5 sm:space-y-6">
            <header className="flex flex-col gap-5 border-b border-[#17251c]/10 pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-white/[0.08]">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0c5c43] dark:bg-[#3cbf96]" />
                        <p className="eyebrow text-[#0c5c43] dark:text-[#8be0c4]">Singapore Sweep</p>
                    </div>
                    <h2 className="font-display mt-2.5 text-[2rem] leading-[0.95] tracking-tight sm:text-[2.75rem]">
                        {data.response.drawNo ? `Draw #${data.response.drawNo}` : 'Latest sweep draw'}
                    </h2>
                    <p className="text-muted-foreground mt-2 max-w-lg text-xs leading-relaxed">
                        {data.response.date
                            ? `Published ${data.response.date}. All prize tiers, including 2D Delight, on one sheet.`
                            : 'All published prize tiers from this Singapore Sweep draw.'}
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

            <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
                {firstPrize && <PrizeCard label="1st prize" prize={firstPrize} featured />}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    {secondPrize && <PrizeCard label="2nd prize" prize={secondPrize} />}
                    {thirdPrize && <PrizeCard label="3rd prize" prize={thirdPrize} />}
                </div>
            </div>

            {twoDLuck.length > 0 && (
                <section className="overflow-hidden rounded-2xl border border-[#8a4b2f]/20 bg-[#8a4b2f]/[0.05] backdrop-blur-xl dark:border-[#e0a07e]/20 dark:bg-[#e0a07e]/[0.06]">
                    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="eyebrow text-[#8a4b2f] dark:text-[#e0a07e]">2D Delight</p>
                            <h3 className="font-display mt-1.5 text-2xl leading-none tracking-tight">Match the last two digits</h3>
                            <p className="text-muted-foreground mt-1.5 text-[11px]">Last two digits of your ticket. Pays 6 SGD per winning ticket.</p>
                        </div>
                        <NumberChips numbers={twoDLuck} tone="muted" className="sm:justify-end" />
                    </div>
                </section>
            )}

            <PrizeLedger
                prizes={otherPrizes}
                nameFor={(prize: PrizeEntry) => sgPrizeNames[prize.id] ?? prize.name}
                currency={CURRENCY}
                title="Every published tier"
                description="Tap “Show all” on a tier to reveal its full number set."
            />
        </div>
    );
}
