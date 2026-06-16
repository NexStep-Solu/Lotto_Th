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
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type LottoTab = 'thai' | 'singapore';

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
                <div className="pointer-events-none fixed inset-0 z-10">
                    <div className="absolute inset-0">
                        <Ferrofluid
                            colors={['#10B981', '#10B981', '#10B981']}
                            speed={0.5}
                            scale={1.6}
                            turbulence={1}
                            fluidity={0.1}
                            rimWidth={0.2}
                            sharpness={2.5}
                            shimmer={1.5}
                            glow={2}
                            flowDirection="down"
                            opacity={1}
                            mouseInteraction
                            mouseStrength={1}
                            mouseRadius={0.35}
                            className="absolute inset-0"
                        />
                    </div>
                </div>

                <div className="relative z-10 bg-transparent">
                    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/40 dark:border-white/10 dark:bg-black/40">
                        <div className="mx-auto mb-0 w-full max-w-[335px] px-4 pt-2 text-sm lg:max-w-7xl lg:px-8">
                            <nav className="flex items-center justify-between gap-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 bg-white/40 shadow-inner backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                                        <span className="text-xs font-semibold tracking-tight">A</span>
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-xs font-semibold tracking-[0.18em] text-neutral-700 uppercase dark:text-neutral-200">
                                            {tab === 'thai' ? 'Thai Lotto' : 'Singapore Sweep'}
                                        </span>
                                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Progressive Web App</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex items-center rounded-sm border border-[#19140035] bg-white/70 px-4 py-1.5 text-xs font-medium text-[#1b1b18] backdrop-blur-sm transition hover:border-[#1915014a] hover:bg-white dark:border-[#3E3E3A] dark:bg-[#141412e6] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                        >
                                            Go to dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center rounded-sm border border-transparent bg-white/70 px-4 py-1.5 text-xs font-medium text-[#1b1b18] backdrop-blur-sm transition hover:border-[#19140035] hover:bg-white dark:bg-[#141412e6] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                        >
                                            login
                                        </Link>
                                    )}
                                </div>
                            </nav>

                            <div className="flex gap-1 pb-2">
                                <button
                                    onClick={() => setTab('thai')}
                                    className={`rounded-t px-4 py-1.5 text-xs font-medium transition ${
                                        tab === 'thai'
                                            ? 'text-foreground border-primary border-b-2 bg-white/60 dark:bg-white/10'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Thai Lotto
                                </button>
                                <button
                                    onClick={() => setTab('singapore')}
                                    className={`rounded-t px-4 py-1.5 text-xs font-medium transition ${
                                        tab === 'singapore'
                                            ? 'text-foreground border-primary border-b-2 bg-white/60 dark:bg-white/10'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Singapore Sweep
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 gap-6 px-6 lg:grid-cols-5">
                        <div className="top-20 h-fit lg:sticky lg:col-span-1">
                            {loading ? (
                                <CheckerSkeleton />
                            ) : tab === 'thai' ? (
                                <>
                                    <NumberChecker lotto={lotto} />
                                    <div className="my-4">
                                        <LotteryDatePicker onSelect={handleSelectDate} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <SgNumberChecker lotto={sgLotto} />
                                    <div className="my-4">
                                        <SgLotteryDatePicker onSelect={handleSgSelectDate} />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="my-6 lg:col-span-4">
                            {loading ? <LottoResultSkeleton /> : tab === 'thai' ? <LotteryResult data={lotto} /> : <SgLotteryResult data={sgLotto} />}
                        </div>
                    </div>

                    <footer className="sticky bottom-0 z-50 border-b border-white/30 bg-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/40 dark:border-white/10 dark:bg-black/40">
                        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 py-6 text-sm text-neutral-600 md:flex-row dark:text-neutral-300">
                            <p>© {new Date().getFullYear()} Lotto Checker</p>

                            <div className="mt-3 flex items-center gap-6 md:mt-0">
                                <a href="#" className="transition hover:text-green-500">
                                    API Source
                                </a>

                                <a href="#" className="transition hover:text-green-500">
                                    Privacy
                                </a>

                                <a href="#" className="transition hover:text-green-500">
                                    Contact
                                </a>
                                <AppearanceToggleTab />
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
