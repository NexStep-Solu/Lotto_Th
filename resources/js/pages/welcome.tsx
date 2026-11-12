import CheckerSkeleton from '@/components/checker-skeleton';
import { type LotteryPayload } from '@/components/lottery/TicketChecker';
import LotteryDatePicker from '@/components/LotteryDatePicker';
import LotteryResult from '@/components/LotteryResult';
import LottoBrand from '@/components/lotto-brand';
import LottoResultSkeleton from '@/components/lotto-result-skeleton';
import NumberChecker from '@/components/NumberChecker';
import SgLotteryDatePicker from '@/components/SgLotteryDatePicker';
import SgLotteryResult from '@/components/SgLotteryResult';
import SgNumberChecker from '@/components/SgNumberChecker';
import AppearanceToggleTab from '@/components/theme-toggle';
import { fetchJson } from '@/lib/fetchJson';
import { convertThaiDate, runningTranslate, sgPrizeNames } from '@/lib/lottoTranslate';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, CircleAlert, RefreshCw, ShieldCheck, Ticket } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type LottoTab = 'thai' | 'singapore';

const tabs: { id: LottoTab; label: string; sub: string }[] = [
    { id: 'thai', label: 'Thai Lotto', sub: 'Government Lottery' },
    { id: 'singapore', label: 'Singapore Sweep', sub: 'Singapore Pools' },
];

type AuthUser = {
    id: number;
    name: string;
    email: string;
};

export default function Welcome({ auth }: { auth: { user: AuthUser | null } }) {
    const [tab, setTab] = useState<LottoTab>('thai');
    const [lotto, setLotto] = useState<LotteryPayload | null>(null);
    const [sgLotto, setSgLotto] = useState<LotteryPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [drawLoading, setDrawLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        const endpoint = tab === 'thai' ? '/api/lotto/latest' : '/api/lotto/sg/latest';

        setLoading(true);
        setError(null);

        fetch(endpoint, { signal: controller.signal, headers: { Accept: 'application/json' } })
            .then((res) => {
                if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
                const contentType = res.headers.get('content-type') ?? '';
                if (!contentType.includes('application/json')) {
                    throw new Error('Unexpected non-JSON response');
                }
                return res.json();
            })
            .then((data) => {
                if (tab === 'thai') setLotto(data);
                else setSgLotto(data);
            })
            .catch((err: Error) => {
                if (err.name === 'AbortError') return;
                if (tab === 'thai') setLotto(null);
                else setSgLotto(null);
                setError('The latest draw could not be loaded. The source may be temporarily unavailable.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [tab, reloadKey]);

    const handleSelectDate = (id: string) => {
        setError(null);
        setDrawLoading(true);
        fetchJson<LotteryPayload>(`/api/lotto/lotto/${id}`)
            .then((data) => setLotto(data))
            .catch(() => setError('That draw could not be loaded. Please try another date.'))
            .finally(() => setDrawLoading(false));
    };

    const handleSgSelectDate = (id: string) => {
        setError(null);
        setDrawLoading(true);
        fetchJson<LotteryPayload>(`/api/lotto/sg/lotto/${id}`)
            .then((data) => setSgLotto(data))
            .catch(() => setError('That draw could not be loaded. Please try another date.'))
            .finally(() => setDrawLoading(false));
    };

    const activeData = tab === 'thai' ? lotto : sgLotto;

    const drawDateLabel = useMemo(() => {
        const date = activeData?.response?.date;

        if (!date) {
            if (loading) return 'Loading latest draw…';
            if (drawLoading) return 'Updating draw…';
            return 'No draw loaded';
        }

        return tab === 'thai' ? convertThaiDate(date) : date;
    }, [activeData, tab, loading, drawLoading]);

    const tickerItems = useMemo(() => {
        const items: { label: string; value: string }[] = [];

        if (tab === 'thai') {
            const firstPrize = activeData?.response?.prizes?.find((prize) => prize.id === 'prizeFirst');
            if (firstPrize?.number?.[0]) {
                items.push({ label: 'First prize', value: firstPrize.number[0] });
            }

            for (const entry of activeData?.response?.runningNumbers ?? []) {
                items.push({
                    label: runningTranslate[entry.name] ?? entry.name,
                    value: (entry.number ?? []).join(' · '),
                });
            }
        } else {
            for (const prize of activeData?.response?.prizes ?? []) {
                items.push({
                    label: sgPrizeNames[prize.id] ?? prize.name,
                    value: (prize.number ?? []).slice(0, 3).join(' · '),
                });
            }

            const twoDLuck: string[] = activeData?.response?.twoDLuck ?? [];
            if (twoDLuck.length > 0) {
                items.push({ label: '2D Delight', value: twoDLuck.join(' · ') });
            }
        }

        if (items.length === 0) {
            items.push(
                { label: 'Thai government lottery', value: 'Latest draw' },
                { label: 'Singapore Sweep', value: 'Latest draw' },
                { label: 'Ticket check', value: 'Checked in your browser' },
            );
        }

        return items.filter((item) => item.value !== '');
    }, [activeData, tab]);

    return (
        <>
            <Head title="Thai Lotto & Singapore Sweep results">
                <meta
                    name="description"
                    content="Check Thai government lottery and Singapore Sweep numbers against the latest official draw. Fast, private, in-browser ticket checking."
                />
                <meta property="og:title" content="Lotto Ledger — Thai & Singapore draw results" />
                <meta property="og:description" content="Every published prize tier on one quiet sheet. Check your ticket in the browser." />
            </Head>

            <div className="relative min-h-dvh overflow-x-hidden bg-[#f3f0e7] text-[#17251c] antialiased dark:bg-[#0b0f0d] dark:text-[#f1efe5]">
                {/* Ambient background */}
                <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_15%_0%,rgba(12,92,67,0.13),transparent_60%),radial-gradient(ellipse_60%_45%_at_92%_8%,rgba(176,141,87,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_55%_at_15%_0%,rgba(60,191,150,0.1),transparent_60%),radial-gradient(ellipse_60%_45%_at_92%_8%,rgba(216,180,122,0.07),transparent_55%)]" />
                    <div className="public-grid-lines absolute inset-0 opacity-70" />
                    <div className="public-grain absolute inset-0 opacity-[0.045] dark:opacity-[0.05]" />
                </div>

                <a
                    href="#draw-results"
                    className="sr-only z-50 rounded-full bg-[#0c5c43] px-4 py-2 text-sm font-medium text-[#f8f5ea] focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
                >
                    Skip to draw results
                </a>

                <div className="relative z-10">
                    <header className="sticky top-0 z-40 border-b border-[#17251c]/10 bg-[#f3f0e7]/85 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#0b0f0d]/85">
                        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                            <Link href="/" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#0c5c43]/30">
                                <LottoBrand />
                            </Link>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <AppearanceToggleTab className="hidden rounded-full border border-[#17251c]/10 bg-[#fffdf7]/70 p-1 sm:inline-flex dark:border-white/10 dark:bg-white/[0.05]" />

                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="group inline-flex h-9 items-center gap-2 rounded-full border border-[#17251c]/15 bg-[#fffdf7]/75 px-4 text-xs font-semibold shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] transition hover:border-[#0c5c43]/30 hover:bg-[#fffdf7] focus-visible:ring-2 focus-visible:ring-[#0c5c43]/30 focus-visible:outline-none dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-[#3cbf96]/30 dark:hover:bg-white/[0.08]"
                                    >
                                        Dashboard
                                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="group inline-flex h-9 items-center gap-2 rounded-full bg-[#0c5c43] px-4 text-xs font-semibold text-[#f8f5ea] shadow-[0_10px_24px_-16px_rgba(12,92,67,0.9)] transition hover:bg-[#0a4d38] focus-visible:ring-2 focus-visible:ring-[#0c5c43]/30 focus-visible:outline-none dark:bg-[#14795a] dark:hover:bg-[#168867]"
                                    >
                                        Sign in
                                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </header>

                    <main>
                        <section className="mx-auto max-w-7xl px-4 pt-10 pb-9 sm:px-6 sm:pt-14 sm:pb-11 lg:px-8">
                            <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
                                <div className="fade-up">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0c5c43]/20 bg-[#0c5c43]/[0.055] px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-[#0c5c43] uppercase dark:border-[#3cbf96]/20 dark:bg-[#3cbf96]/10 dark:text-[#8be0c4]">
                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0c5c43] dark:bg-[#3cbf96]" />
                                            Live draw ledger
                                        </span>
                                        <span className="font-ticket text-muted-foreground text-[10px] tabular-nums">
                                            Updated with each official draw
                                        </span>
                                    </div>

                                    <h1 className="font-display mt-6 text-[clamp(3.4rem,8vw,6.75rem)] leading-[0.86] tracking-[-0.025em] text-balance">
                                        The draw,
                                        <br />
                                        <span className="text-[#0c5c43] italic dark:text-[#7bdcbe]">settled.</span>
                                    </h1>

                                    <p className="text-muted-foreground mt-6 max-w-xl text-sm leading-relaxed text-pretty sm:text-[15px]">
                                        Thai government lottery and Singapore Sweep results on one quiet sheet. Read every prize tier, then check a
                                        ticket in your browser — no account, no upload, no numbers stored.
                                    </p>

                                    <div className="text-muted-foreground mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px]">
                                        <span className="inline-flex items-center gap-1.5">
                                            <ShieldCheck className="h-3.5 w-3.5 text-[#0c5c43] dark:text-[#8be0c4]" />
                                            Checked on your device
                                        </span>
                                        <span className="hidden h-3 w-px bg-[#17251c]/15 sm:block dark:bg-white/15" />
                                        <span className="inline-flex items-center gap-1.5">
                                            <RefreshCw className="h-3.5 w-3.5 text-[#b08d57] dark:text-[#d8b47a]" />
                                            Mirrored after every draw
                                        </span>
                                    </div>
                                </div>

                                <div className="fade-up stagger-2 lg:justify-self-end lg:pb-1">
                                    <p className="eyebrow text-muted-foreground">Choose a lottery</p>

                                    <div className="mt-3 grid gap-2">
                                        {tabs.map((item) => {
                                            const active = tab === item.id;

                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setTab(item.id)}
                                                    aria-pressed={active}
                                                    className={cn(
                                                        'group flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#0c5c43]/30 focus-visible:outline-none',
                                                        active
                                                            ? 'border-[#0c5c43]/30 bg-[#0c5c43] text-[#f8f5ea] shadow-[0_14px_32px_-22px_rgba(12,92,67,0.9)] dark:border-[#14795a] dark:bg-[#14795a]'
                                                            : 'text-foreground border-[#17251c]/10 bg-[#fbf9f2]/55 hover:border-[#0c5c43]/20 hover:bg-[#fffdf7]/80 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#3cbf96]/20 dark:hover:bg-white/[0.06]',
                                                    )}
                                                >
                                                    <span>
                                                        <span
                                                            className={cn(
                                                                'block text-[9px] font-semibold tracking-[0.16em] uppercase',
                                                                active ? 'text-white/60' : 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {item.sub}
                                                        </span>
                                                        <span className="mt-0.5 block text-sm font-semibold">{item.label}</span>
                                                    </span>
                                                    <ArrowUpRight
                                                        className={cn(
                                                            'h-4 w-4 shrink-0 transition-transform duration-200',
                                                            active
                                                                ? 'text-white/70'
                                                                : 'text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
                                                        )}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-5 border-t border-dashed border-[#17251c]/15 pt-4 dark:border-white/10">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="eyebrow text-muted-foreground text-[9px]">Reading</p>
                                            {drawLoading && (
                                                <span className="text-muted-foreground inline-flex items-center gap-1 text-[9px]">
                                                    <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                                    Updating
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1.5 text-xs font-semibold">
                                            {tab === 'thai' ? 'Thai Government Lottery' : 'Singapore Sweep'}
                                        </p>
                                        <p className="font-ticket text-muted-foreground mt-0.5 text-[11px] tabular-nums">{drawDateLabel}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Results ticker */}
                        <div
                            aria-hidden="true"
                            className="relative overflow-hidden border-y border-[#17251c]/10 bg-[#ebe6d9]/55 py-0.5 dark:border-white/[0.07] dark:bg-white/[0.025]"
                        >
                            <div className="marquee-track flex w-max items-center">
                                {[...tickerItems, ...tickerItems].map((item, index) => (
                                    <div key={`${item.label}-${index}`} className="flex items-center gap-2.5 px-4 py-2.5 sm:px-5">
                                        <span className="text-[8px] text-[#b08d57] dark:text-[#d8b47a]">◆</span>
                                        <span className="text-muted-foreground text-[9px] font-semibold tracking-[0.14em] uppercase">
                                            {item.label}
                                        </span>
                                        <span className="font-ticket text-[11px] font-medium tabular-nums">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#f3f0e7] to-transparent dark:from-[#0b0f0d]" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#f3f0e7] to-transparent dark:from-[#0b0f0d]" />
                        </div>

                        <section id="draw-results" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22.5rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
                                <div className="order-1 min-w-0 lg:order-1">
                                    {loading ? (
                                        <div className="rounded-2xl border border-[#17251c]/10 bg-[#fbf9f2]/55 p-4 backdrop-blur-xl sm:p-6 dark:border-white/[0.08] dark:bg-white/[0.025]">
                                            <LottoResultSkeleton />
                                        </div>
                                    ) : error ? (
                                        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#9a3412]/20 bg-[#9a3412]/[0.045] px-6 py-16 text-center">
                                            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#9a3412]/15 bg-[#fffdf7] text-[#9a3412] dark:border-white/10 dark:bg-white/[0.05] dark:text-[#fdba74]">
                                                <CircleAlert className="h-5 w-5" />
                                            </span>
                                            <h2 className="font-display mt-4 text-3xl tracking-tight">The draw is out of reach</h2>
                                            <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">{error}</p>
                                            <button
                                                type="button"
                                                onClick={() => setReloadKey((key) => key + 1)}
                                                className="mt-5 inline-flex h-9 items-center gap-2 rounded-full border border-[#17251c]/15 bg-[#fffdf7] px-4 text-xs font-semibold transition hover:border-[#0c5c43]/30 hover:bg-white focus-visible:ring-2 focus-visible:ring-[#0c5c43]/30 focus-visible:outline-none dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.09]"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                Try again
                                            </button>
                                        </div>
                                    ) : tab === 'thai' ? (
                                        <LotteryResult data={lotto} />
                                    ) : (
                                        <SgLotteryResult data={sgLotto} />
                                    )}
                                </div>

                                <aside className="order-2 space-y-4 self-start lg:sticky lg:top-24 lg:order-2">
                                    {loading ? (
                                        <CheckerSkeleton />
                                    ) : tab === 'thai' ? (
                                        <>
                                            <NumberChecker lotto={lotto} />
                                            <LotteryDatePicker onSelect={handleSelectDate} />
                                        </>
                                    ) : (
                                        <>
                                            <SgNumberChecker lotto={sgLotto} />
                                            <SgLotteryDatePicker onSelect={handleSgSelectDate} />
                                        </>
                                    )}

                                    <div className="rounded-2xl border border-dashed border-[#17251c]/15 bg-transparent p-4 dark:border-white/10">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-3.5 w-3.5 text-[#0c5c43] dark:text-[#8be0c4]" />
                                            <p className="eyebrow text-muted-foreground text-[9px]">Private by design</p>
                                        </div>
                                        <p className="text-muted-foreground mt-2 text-[11px] leading-relaxed">
                                            Ticket checks run entirely in this browser. Numbers are never sent to the server or saved in a database.
                                        </p>
                                        <div className="text-muted-foreground mt-3 flex items-center gap-1.5 text-[10px]">
                                            <Ticket className="h-3 w-3 text-[#b08d57] dark:text-[#d8b47a]" />
                                            Verify against the official source before claiming a prize.
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </section>
                    </main>

                    <footer className="border-t border-[#17251c]/10 bg-[#ebe6d9]/35 dark:border-white/[0.07] dark:bg-white/[0.02]">
                        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-[1.2fr_0.9fr_0.9fr] sm:px-6 lg:px-8">
                            <div>
                                <LottoBrand />
                                <p className="text-muted-foreground mt-3 max-w-xs text-[11px] leading-relaxed">
                                    An independent, quiet place to read the draw. Not affiliated with the Thai Government Lottery Office or Singapore
                                    Pools.
                                </p>
                            </div>

                            <div>
                                <p className="eyebrow text-muted-foreground text-[9px]">Sources</p>
                                <ul className="mt-3 space-y-2 text-xs">
                                    <li>
                                        <a
                                            href="https://news.sanook.com/lotto/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-foreground/80 inline-flex items-center gap-1.5 transition hover:text-[#0c5c43] dark:hover:text-[#8be0c4]"
                                        >
                                            Sanook — Thai results
                                            <ArrowUpRight className="h-3 w-3" />
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://www.singaporepools.com.sg/en/product/Pages/sweep_results.aspx"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-foreground/80 inline-flex items-center gap-1.5 transition hover:text-[#0c5c43] dark:hover:text-[#8be0c4]"
                                        >
                                            Singapore Pools — Sweep
                                            <ArrowUpRight className="h-3 w-3" />
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <p className="eyebrow text-muted-foreground text-[9px]">The fine print</p>
                                <p className="text-muted-foreground mt-3 text-[11px] leading-relaxed">
                                    Results are mirrored for convenience and may lag the official announcement. Always confirm the winning numbers at
                                    the official source before claiming.
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-[#17251c]/10 dark:border-white/[0.07]">
                            <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-[10px] sm:flex-row sm:px-6 lg:px-8">
                                <p>© {new Date().getFullYear()} Lotto Ledger</p>
                                <p className="font-ticket text-[9px] tracking-[0.12em] uppercase">It is a numbers game. Play within your means.</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
