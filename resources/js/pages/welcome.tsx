import CheckerSkeleton from '@/components/checker-skeleton';
import Ferrofluid from '@/components/Ferrofluid';
import LotteryDatePicker from '@/components/LotteryDatePicker';
import LotteryResult from '@/components/LotteryResult';
import LottoResultSkeleton from '@/components/lotto-result-skeleton';
import NumberChecker from '@/components/NumberChecker';
import SgLotteryDatePicker from '@/components/SgLotteryDatePicker';
import SgLotteryResult from '@/components/SgLotteryResult';
import SgNumberChecker from '@/components/SgNumberChecker';
import AppearanceToggleTab from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type LottoTab = 'thai' | 'singapore';

const tabs: { id: LottoTab; label: string }[] = [
    { id: 'thai', label: 'Thai Lotto' },
    { id: 'singapore', label: 'Singapore Sweep' },
];

export default function Welcome({ auth }: { auth: { user: any } }) {
    const [tab, setTab] = useState<LottoTab>('thai');
    const [lotto, setLotto] = useState<any>(null);
    const [sgLotto, setSgLotto] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tab === 'thai') {
            setLoading(true);
            fetch('/api/lotto/latest')
                .then((res) => res.json())
                .then((data) => {
                    setLotto(data);
                    setLoading(false);
                });
        } else {
            setLoading(true);
            fetch('/api/lotto/sg/latest')
                .then((res) => res.json())
                .then((data) => {
                    setSgLotto(data);
                    setLoading(false);
                });
        }
    }, [tab]);

    const handleSelectDate = (id: string) => {
        fetch(`/api/lotto/lotto/${id}`)
            .then((res) => res.json())
            .then((data) => setLotto(data));
    };

    const handleSgSelectDate = (id: string) => {
        fetch(`/api/lotto/sg/lotto/${id}`)
            .then((res) => res.json())
            .then((data) => setSgLotto(data));
    };

    return (
        <>
            <Head title="Thai Lotto & Singapore Sweep">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div
                className="relative min-h-screen w-full text-[13px]"
                style={{
                    fontFamily: '"Instrument Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
            >
                <div className="pointer-events-none fixed inset-0 z-0">
                    <div className="absolute inset-0">
                        <Ferrofluid
                            colors={['#10B981', '#059669', '#047857']}
                            speed={0.4}
                            scale={1.4}
                            turbulence={0.8}
                            fluidity={0.15}
                            rimWidth={0.15}
                            sharpness={3}
                            shimmer={1.2}
                            glow={1.5}
                            flowDirection="down"
                            opacity={0.7}
                            mouseInteraction
                            mouseStrength={0.8}
                            mouseRadius={0.4}
                            className="absolute inset-0"
                        />
                    </div>
                </div>

                <div className="relative z-10">
                    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/50 dark:border-white/[0.06] dark:bg-black/50">
                        <div className="mx-auto flex h-14 items-center justify-between px-4 lg:px-6">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shadow-inner">
                                    <span className="text-sm font-bold tracking-tight text-primary">L</span>
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-xs font-semibold tracking-wider text-neutral-700 uppercase dark:text-neutral-200">
                                        {tab === 'thai' ? 'Thai Lotto' : 'Singapore Sweep'}
                                    </span>
                                    <span className="text-[10px] text-neutral-500 dark:text-neutral-500">
                                        {tab === 'thai' ? 'Government Lottery' : 'Singapore Pools'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <AppearanceToggleTab />
                                {auth.user ? (
                                    <Link href={route('dashboard')}>
                                        <Button variant="glass" size="sm">
                                            Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href={route('login')}>
                                        <Button variant="glass" size="sm">
                                            Sign in
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="mx-auto flex items-center justify-center gap-1.5 px-4 pb-3 lg:px-6">
                            {tabs.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`group relative flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                                        tab === t.id
                                            ? 'bg-white/70 text-neutral-900 shadow-lg shadow-black/5 ring-1 ring-white/50 backdrop-blur-md dark:bg-white/10 dark:text-neutral-100 dark:ring-white/10'
                                            : 'text-neutral-600 hover:bg-white/30 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-white/[0.04] dark:hover:text-neutral-200'
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                                            tab === t.id
                                                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                                                : 'bg-neutral-300 dark:bg-neutral-600'
                                        }`}
                                    />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </header>

                    <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                            <aside className="top-24 order-2 lg:order-1 lg:sticky lg:col-span-1 lg:self-start">
                                <div className="space-y-4">
                                    {loading ? (
                                        <CheckerSkeleton />
                                    ) : tab === 'thai' ? (
                                        <>
                                            <div className="rounded-xl border border-white/30 bg-white/40 p-4 shadow-lg shadow-black/[0.02] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/30 dark:border-white/[0.06] dark:bg-white/[0.03]">
                                                <NumberChecker lotto={lotto} />
                                            </div>
                                            <LotteryDatePicker onSelect={handleSelectDate} />
                                        </>
                                    ) : (
                                        <>
                                            <div className="rounded-xl border border-white/30 bg-white/40 p-4 shadow-lg shadow-black/[0.02] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/30 dark:border-white/[0.06] dark:bg-white/[0.03]">
                                                <SgNumberChecker lotto={sgLotto} />
                                            </div>
                                            <SgLotteryDatePicker onSelect={handleSgSelectDate} />
                                        </>
                                    )}
                                </div>
                            </aside>

                            <section className="order-1 min-h-[60vh] lg:order-2 lg:col-span-4">
                                {loading ? (
                                    <div className="rounded-2xl border border-white/30 bg-white/40 p-4 shadow-lg shadow-black/[0.02] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/30 dark:border-white/[0.06] dark:bg-white/[0.03] sm:p-6">
                                        <LottoResultSkeleton />
                                    </div>
                                ) : tab === 'thai' ? (
                                    <LotteryResult data={lotto} />
                                ) : (
                                    <SgLotteryResult data={sgLotto} />
                                )}
                            </section>
                        </div>
                    </main>

                    <footer className="border-t border-white/20 bg-white/40 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/30 dark:border-white/[0.06] dark:bg-black/30">
                        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-neutral-500 md:flex-row dark:text-neutral-500">
                            <p>© {new Date().getFullYear()} Lotto Checker</p>
                            <div className="flex items-center gap-5">
                                <a href="#" className="transition hover:text-neutral-800 dark:hover:text-neutral-200">
                                    API Source
                                </a>
                                <a href="#" className="transition hover:text-neutral-800 dark:hover:text-neutral-200">
                                    Privacy
                                </a>
                                <a href="#" className="transition hover:text-neutral-800 dark:hover:text-neutral-200">
                                    Contact
                                </a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
