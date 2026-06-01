import CheckerSkeleton from '@/components/checker-skeleton';
import ColorBends from '@/components/ColorBends';
import LotteryDatePicker from '@/components/LotteryDatePicker';
import LotteryResult from '@/components/LotteryResult';
import LottoResultSkeleton from '@/components/lotto-result-skeleton';
import NumberChecker from '@/components/NumberChecker';
import AppearanceToggleTab, { ThemeToggle } from '@/components/theme-toggle';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Welcome({ auth }: { auth: { user: any } }) {
    const [lotto, setLotto] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        fetch("/api/lotto/latest")
            .then(res => res.json())
            .then(data => {
                setLotto(data)
                setLoading(false)
            })
    }, [])
    const handleSelectDate = (id: string) => {
        fetch(`/api/lotto/lotto/${id}`)
            .then(res => res.json())
            .then(data => setLotto(data))
    }
    return (
        <>
            <Head title="Thai Lotto">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="relative min-h-screen w-full text-[13px]"
                style={{
                    fontFamily:
                        '"Instrument Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
            >
                <div className="pointer-events-none fixed inset-0 z-10">
                    <div className="absolute inset-0">
                        <ColorBends
                            rotation={190}
                            speed={0.5}
                            colors={['#0aff68', '#62f4dc', '#66ffa1']}
                            transparent
                            autoRotate={0}
                            scale={1}
                            frequency={1}
                            warpStrength={1}
                            mouseInfluence={1}
                            parallax={0.5}
                            noise={0.1}
                            className="absolute inset-0"
                        />
                    </div>
                </div>

                <div className="relative z-10 bg-transparent">
                    {/* STICKY HEADER */}
                    <header className="sticky top-0 z-50 border-b border-white/30 dark:border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="mx-auto mb-0 w-full max-w-[335px] px-4 pt-2 text-sm lg:max-w-7xl lg:px-8">
                            <nav className="flex items-center justify-between gap-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-md shadow-inner border border-white/40 dark:border-white/10">
                                        <span className="text-xs font-semibold tracking-tight">
                                            A
                                        </span>
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-xs font-semibold tracking-[0.18em] text-neutral-700 uppercase dark:text-neutral-200">
                                            Thai Lotto
                                        </span>
                                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                            Progressive Web App
                                        </span>
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
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 px-6">

                        {/* LEFT CHECKER */}
                        <div className="lg:col-span-1 lg:sticky top-20 h-fit">

                            {loading ? (
                                <CheckerSkeleton />
                            ) : (
                                <>
                                    <NumberChecker lotto={lotto} />
                                    <div className="my-4">
                                        <LotteryDatePicker onSelect={handleSelectDate} />
                                    </div>
                                </>
                            )}

                        </div>

                        {/* RIGHT RESULTS */}
                        <div className="lg:col-span-4 my-6">

                            {loading ? (
                                <LottoResultSkeleton />
                            ) : (
                                <LotteryResult data={lotto} />
                            )}

                        </div>

                    </div>
                    <footer className="sticky bottom-0 z-50 border-b border-white/30 dark:border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

                        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">

                            <p>
                                © {new Date().getFullYear()} Thai Lotto Checker
                            </p>

                            <div className="flex items-center gap-6 mt-3 md:mt-0">
                                <a href="#" className="hover:text-green-500 transition">
                                    API Source
                                </a>

                                <a href="#" className="hover:text-green-500 transition">
                                    Privacy
                                </a>

                                <a href="#" className="hover:text-green-500 transition">
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
