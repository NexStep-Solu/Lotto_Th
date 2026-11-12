'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sgPrizeNames, translateLottoName } from '@/lib/lottoTranslate';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { ArrowRight, CircleHelp, ShieldCheck, Sparkles, Ticket, Trophy, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

type LotteryKind = 'thai' | 'sg';
type OutcomeStatus = 'win' | 'partial' | 'lose';

type Outcome = {
    status: OutcomeStatus;
    prize: string | null;
    reward: number;
    number: string;
};

export type LotteryPayload = {
    response?: {
        date?: string;
        drawNo?: string;
        prizes?: Array<{ id: string; name: string; number?: string[]; reward: number }>;
        runningNumbers?: Array<{ id: string; name: string; number?: string[]; reward: number }>;
        twoDLuck?: string[];
    };
};

type TicketCheckerProps = {
    kind: LotteryKind;
    lotto: LotteryPayload | null;
    className?: string;
};

const CURRENCY: Record<LotteryKind, string> = {
    thai: 'THB',
    sg: 'SGD',
};

function checkTicket(kind: LotteryKind, number: string, lotto: LotteryPayload): Outcome {
    const prizes = lotto.response?.prizes ?? [];

    for (const prize of prizes) {
        if (prize.number?.includes(number)) {
            return {
                status: 'win',
                prize: kind === 'sg' ? (sgPrizeNames[prize.id] ?? prize.name) : translateLottoName(prize.name),
                reward: prize.reward,
                number,
            };
        }
    }

    if (kind === 'thai') {
        const running = lotto.response?.runningNumbers ?? [];
        const firstThree = number.slice(0, 3);
        const lastThree = number.slice(-3);
        const lastTwo = number.slice(-2);

        for (const entry of running) {
            const matches =
                (entry.id === 'runningNumberFrontThree' && entry.number?.includes(firstThree)) ||
                (entry.id === 'runningNumberBackThree' && entry.number?.includes(lastThree)) ||
                (entry.id === 'runningNumberBackTwo' && entry.number?.includes(lastTwo));

            if (matches) {
                return {
                    status: 'partial',
                    prize: translateLottoName(entry.name),
                    reward: entry.reward,
                    number,
                };
            }
        }
    }

    const twoDLuck = lotto.response?.twoDLuck ?? [];
    if (kind === 'sg' && twoDLuck.length > 0 && number.length >= 2) {
        const lastTwo = number.slice(-2);
        if (twoDLuck.includes(lastTwo)) {
            return { status: 'partial', prize: '2D Delight', reward: 6, number };
        }
    }

    return { status: 'lose', prize: null, reward: 0, number };
}

function fireConfetti() {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    confetti({
        particleCount: 90,
        spread: 72,
        startVelocity: 34,
        origin: { y: 0.68 },
        colors: ['#0c5c43', '#3cbf96', '#b08d57', '#f3f0e7'],
    });
}

export default function TicketChecker({ kind, lotto, className }: TicketCheckerProps) {
    const inputId = useId();
    const digitLength = kind === 'thai' ? 6 : 7;
    const [number, setNumber] = useState('');
    const [outcome, setOutcome] = useState<Outcome | null>(null);
    const [error, setError] = useState<string | null>(null);

    const prizes = lotto?.response?.prizes ?? [];
    const running = lotto?.response?.runningNumbers ?? [];
    const hasDraw = prizes.length > 0 || running.length > 0;

    useEffect(() => {
        setOutcome(null);
        setError(null);
    }, [lotto, kind]);

    const handleCheck = () => {
        if (!lotto || !hasDraw) {
            setError('Results for this draw have not been published yet.');
            return;
        }

        if (number.length !== digitLength) {
            setError(`Enter all ${digitLength} digits of your ticket number.`);
            return;
        }

        setError(null);
        const result = checkTicket(kind, number, lotto);
        setOutcome(result);

        if (result.status !== 'lose') {
            fireConfetti();
        }
    };

    return (
        <section
            className={cn(
                'overflow-hidden rounded-2xl border border-[#17251c]/10 bg-[#fbf9f2]/85 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_22px_48px_-38px_rgba(18,32,25,0.55)] backdrop-blur-xl',
                'dark:border-white/[0.08] dark:bg-white/[0.035] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_22px_48px_-38px_rgba(0,0,0,0.85)]',
                className,
            )}
            aria-labelledby={`${inputId}-title`}
        >
            <div className="flex items-start justify-between gap-3 border-b border-[#17251c]/10 px-5 py-4 dark:border-white/[0.07]">
                <div>
                    <p className="eyebrow text-[#0c5c43] dark:text-[#8be0c4]">Ticket check</p>
                    <h2 id={`${inputId}-title`} className="font-display mt-1.5 text-2xl leading-none tracking-tight">
                        Is it a winner?
                    </h2>
                </div>
                <span className="font-ticket inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#17251c]/10 bg-[#fffdf7] px-2.5 py-1 text-[10px] font-medium text-[#4b5c51] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#d7ded8]">
                    <Ticket className="h-3 w-3" />
                    {digitLength} digits
                </span>
            </div>

            <div className="space-y-4 px-5 py-5">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor={inputId} className="text-xs font-semibold">
                            Your ticket number
                        </label>
                        <span className="font-ticket text-muted-foreground text-[10px] tabular-nums">
                            {number.length}/{digitLength}
                        </span>
                    </div>

                    <div className="relative">
                        <Input
                            id={inputId}
                            value={number}
                            onChange={(event) => {
                                setNumber(event.target.value.replace(/\D/g, '').slice(0, digitLength));
                                setError(null);
                                setOutcome(null);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') handleCheck();
                            }}
                            inputMode="numeric"
                            autoComplete="off"
                            spellCheck={false}
                            placeholder={kind === 'thai' ? '000000' : '0000000'}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? `${inputId}-error` : undefined}
                            className={cn(
                                'font-ticket h-12 rounded-xl border-[#17251c]/15 bg-[#fffdf7] pr-10 pl-3.5 text-lg tracking-[0.28em] tabular-nums shadow-none',
                                'placeholder:tracking-[0.28em] placeholder:text-[#17251c]/20 focus-visible:border-[#0c5c43] focus-visible:ring-[#0c5c43]/15',
                                'dark:border-white/10 dark:bg-white/[0.05] dark:placeholder:text-white/15 dark:focus-visible:border-[#3cbf96]',
                            )}
                        />
                        {number.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setNumber('');
                                    setOutcome(null);
                                    setError(null);
                                }}
                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-[#17251c]/[0.06] dark:hover:bg-white/10"
                                aria-label="Clear ticket number"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {error ? (
                        <p
                            id={`${inputId}-error`}
                            role="alert"
                            className="flex items-start gap-1.5 text-[11px] font-medium text-[#9a3412] dark:text-[#fdba74]"
                        >
                            <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {error}
                        </p>
                    ) : (
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                            Digits only. We check every prize tier, plus the smaller running-number prizes.
                        </p>
                    )}
                </div>

                <Button
                    type="button"
                    onClick={handleCheck}
                    disabled={!hasDraw || number.length === 0}
                    className="group h-11 w-full rounded-xl bg-[#0c5c43] text-[#f8f5ea] shadow-[0_10px_24px_-14px_rgba(12,92,67,0.9)] transition hover:bg-[#0a4d38] focus-visible:ring-[#0c5c43]/30 active:translate-y-px disabled:bg-[#17251c]/15 disabled:text-[#17251c]/45 disabled:shadow-none dark:bg-[#14795a] dark:hover:bg-[#168867]"
                >
                    <Sparkles className="h-4 w-4" />
                    Check this ticket
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>

                <div aria-live="polite" aria-atomic="true">
                    {outcome && (
                        <div
                            className={cn(
                                'fade-up overflow-hidden rounded-xl border p-4',
                                outcome.status === 'win' && 'border-[#0c5c43]/20 bg-[#0c5c43]/[0.07] dark:border-[#3cbf96]/25 dark:bg-[#3cbf96]/10',
                                outcome.status === 'partial' &&
                                    'border-[#b08d57]/30 bg-[#b08d57]/[0.09] dark:border-[#d8b47a]/25 dark:bg-[#d8b47a]/10',
                                outcome.status === 'lose' && 'border-[#17251c]/10 bg-[#17251c]/[0.035] dark:border-white/10 dark:bg-white/[0.04]',
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <span
                                    className={cn(
                                        'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                                        outcome.status === 'win' && 'border-[#0c5c43]/20 bg-[#0c5c43] text-[#f8f5ea]',
                                        outcome.status === 'partial' && 'border-[#b08d57]/30 bg-[#b08d57] text-[#fffaf0]',
                                        outcome.status === 'lose' &&
                                            'border-[#17251c]/10 bg-[#fffdf7] text-[#4b5c51] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#d7ded8]',
                                    )}
                                >
                                    {outcome.status === 'win' ? (
                                        <Trophy className="h-4 w-4" />
                                    ) : outcome.status === 'partial' ? (
                                        <Sparkles className="h-4 w-4" />
                                    ) : (
                                        <Ticket className="h-4 w-4" />
                                    )}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm leading-tight font-semibold">
                                        {outcome.status === 'win'
                                            ? 'Winning ticket'
                                            : outcome.status === 'partial'
                                              ? 'You matched a running prize'
                                              : 'No prize on this draw'}
                                    </p>
                                    <p className="text-muted-foreground mt-1 truncate text-xs">
                                        {outcome.prize
                                            ? `${outcome.prize} · ${outcome.reward.toLocaleString()} ${CURRENCY[kind]}`
                                            : `Checked ${outcome.number} against this draw`}
                                    </p>
                                    {outcome.status === 'lose' && (
                                        <p className="text-muted-foreground mt-1 text-[11px]">Keep the ticket — a different draw may still match.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-muted-foreground flex items-center justify-center gap-1.5 border-t border-dashed border-[#17251c]/10 pt-3.5 text-[10px] dark:border-white/10">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0c5c43] dark:text-[#8be0c4]" />
                    Checked in your browser. Your numbers are never stored.
                </div>
            </div>
        </section>
    );
}
