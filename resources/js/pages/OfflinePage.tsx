import LottoBrand from '@/components/lotto-brand';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useEffect } from 'react';

export default function OfflinePage() {
    useEffect(() => {
        document.title = 'Offline';
    }, []);

    return (
        <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#f3f0e7] text-[#17251c] antialiased dark:bg-[#0b0f0d] dark:text-[#f1efe5]">
                <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_12%_0%,rgba(12,92,67,0.13),transparent_60%),radial-gradient(ellipse_55%_45%_at_95%_8%,rgba(176,141,87,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_75%_55%_at_12%_0%,rgba(60,191,150,0.1),transparent_60%),radial-gradient(ellipse_55%_45%_at_95%_8%,rgba(216,180,122,0.07),transparent_55%)]" />
                    <div className="public-grid-lines absolute inset-0 opacity-60" />
                    <div className="public-grain absolute inset-0 opacity-[0.045] dark:opacity-[0.05]" />
                </div>

                <div className="relative z-10 flex min-h-dvh flex-col">
                    <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
                        <LottoBrand />
                    </header>

                    <main className="flex flex-1 items-center justify-center px-4 py-12">
                        <div className="w-full max-w-md rounded-2xl border border-[#17251c]/10 bg-[#fbf9f2]/85 p-7 text-center shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_28px_60px_-48px_rgba(18,32,25,0.55)] backdrop-blur-xl sm:p-10 dark:border-white/[0.08] dark:bg-white/[0.04]">
                            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#b08d57]/25 bg-[#b08d57]/[0.1] text-[#8a6c3e] dark:border-[#d8b47a]/20 dark:bg-[#d8b47a]/10 dark:text-[#e6c795]">
                                <WifiOff className="h-6 w-6" />
                            </span>

                            <p className="eyebrow mt-5 text-[#0c5c43] dark:text-[#8be0c4]">Connection lost</p>
                            <h1 className="font-display mt-2 text-4xl leading-none tracking-tight">You&rsquo;re offline</h1>
                            <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-relaxed">
                                The lotto desk needs a connection to load a new draw. Anything already on this page stays readable while you wait.
                            </p>

                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0c5c43] px-4 text-xs font-semibold text-[#f8f5ea] shadow-[0_12px_26px_-16px_rgba(12,92,67,0.9)] transition hover:bg-[#0a4d38] focus-visible:ring-2 focus-visible:ring-[#0c5c43]/30 focus-visible:outline-none active:translate-y-px dark:bg-[#14795a] dark:hover:bg-[#168867]"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Try again
                            </button>

                            <p className="font-ticket text-muted-foreground mt-5 border-t border-dashed border-[#17251c]/15 pt-4 text-[10px] tracking-[0.12em] uppercase dark:border-white/10">
                                Your ticket numbers are never uploaded
                            </p>
                        </div>
                    </main>
                </div>
            </div>
    );
}
