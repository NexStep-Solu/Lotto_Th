'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export type PrizeEntry = {
    id: string;
    name: string;
    number?: string[];
    reward: number;
};

type PrizeLedgerProps = {
    prizes: PrizeEntry[];
    nameFor: (prize: PrizeEntry) => string;
    currency: string;
    title?: string;
    description?: string;
    className?: string;
};

const INITIAL_VISIBLE = 12;

export default function PrizeLedger({
    prizes,
    nameFor,
    currency,
    title = 'Other prize tiers',
    description = 'Every number published for this draw.',
    className,
}: PrizeLedgerProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    if (prizes.length === 0) {
        return null;
    }

    return (
        <section
            className={cn(
                'overflow-hidden rounded-2xl border border-[#17251c]/10 bg-[#fbf9f2]/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.025]',
                className,
            )}
        >
            <header className="flex flex-col gap-2 border-b border-[#17251c]/10 px-5 py-4 sm:flex-row sm:items-end sm:justify-between dark:border-white/[0.07]">
                <div>
                    <p className="eyebrow text-muted-foreground">{title}</p>
                    <h3 className="font-display mt-1.5 text-2xl leading-none tracking-tight">
                        {prizes.length} {prizes.length === 1 ? 'tier' : 'tiers'} in this draw
                    </h3>
                </div>
                <p className="text-muted-foreground text-[11px]">{description}</p>
            </header>

            <div className="divide-y divide-[#17251c]/[0.07] dark:divide-white/[0.06]">
                {prizes.map((prize, index) => {
                    const numbers = prize.number ?? [];
                    const isExpanded = Boolean(expanded[prize.id]);
                    const visible = isExpanded ? numbers : numbers.slice(0, INITIAL_VISIBLE);
                    const hidden = numbers.length - visible.length;

                    return (
                        <article key={prize.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-8">
                            <div className="flex items-start gap-3">
                                <span className="font-ticket text-muted-foreground mt-0.5 text-[10px] tabular-nums">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="min-w-0">
                                    <h4 className="text-sm leading-snug font-semibold">{nameFor(prize)}</h4>
                                    <p className="font-ticket text-muted-foreground mt-1 text-[11px] tabular-nums">
                                        {prize.reward.toLocaleString()} {currency} per ticket
                                    </p>
                                </div>
                            </div>

                            <div>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {visible.map((number, numberIndex) => (
                                        <span
                                            key={`${prize.id}-${number}-${numberIndex}`}
                                            className="font-ticket inline-flex h-9 min-w-10 items-center justify-center rounded-[5px] border border-[#17251c]/10 bg-[#fffdf7] px-2 text-xs font-medium text-[#17251c] tabular-nums sm:text-[13px] dark:border-white/10 dark:bg-white/[0.05] dark:text-[#f0eee4]"
                                        >
                                            {number}
                                        </span>
                                    ))}
                                </div>

                                {hidden > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="mt-3 h-7 px-0 text-[11px] font-semibold text-[#0c5c43] hover:bg-transparent hover:text-[#0a4d38] dark:text-[#8be0c4] dark:hover:text-[#a5eeda]"
                                        aria-expanded={isExpanded}
                                        onClick={() =>
                                            setExpanded((current) => ({
                                                ...current,
                                                [prize.id]: !current[prize.id],
                                            }))
                                        }
                                    >
                                        {isExpanded ? 'Show fewer' : `Show all ${numbers.length}`}
                                        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', isExpanded && 'rotate-180')} />
                                    </Button>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
