import LottoBrand from '@/components/lotto-brand';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative min-h-dvh overflow-hidden bg-[#f3f0e7] text-[#17251c] antialiased dark:bg-[#0b0f0d] dark:text-[#f1efe5]">
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_12%_0%,rgba(12,92,67,0.13),transparent_60%),radial-gradient(ellipse_55%_45%_at_95%_8%,rgba(176,141,87,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_75%_55%_at_12%_0%,rgba(60,191,150,0.1),transparent_60%),radial-gradient(ellipse_55%_45%_at_95%_8%,rgba(216,180,122,0.07),transparent_55%)]" />
                <div className="public-grid-lines absolute inset-0 opacity-60" />
                <div className="public-grain absolute inset-0 opacity-[0.045] dark:opacity-[0.05]" />
            </div>

            <div className="relative z-10 flex min-h-dvh flex-col">
                <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href={route('home')} className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#0c5c43]/30">
                        <LottoBrand subtitle="Account access" />
                    </Link>

                    <Link
                        href={route('home')}
                        className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-[#17251c]/10 bg-[#fbf9f2]/70 px-3.5 text-[11px] font-semibold transition hover:border-[#0c5c43]/25 hover:bg-[#fffdf7] focus-visible:ring-2 focus-visible:ring-[#0c5c43]/30 focus-visible:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                    >
                        Back to results
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </header>

                <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
                    <div className="w-full max-w-sm">
                        <div className="rounded-2xl border border-[#17251c]/10 bg-[#fbf9f2]/85 p-6 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_28px_60px_-48px_rgba(18,32,25,0.55)] backdrop-blur-xl [--primary:#0c5c43] [--ring:#0c5c43] sm:p-8 dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_28px_60px_-48px_rgba(0,0,0,0.9)] dark:[--primary:#14795a] dark:[--ring:#3cbf96]">
                            <p className="eyebrow text-[#0c5c43] dark:text-[#8be0c4]">Account access</p>
                            <h1 className="font-display mt-2 text-3xl leading-none tracking-tight">{title}</h1>
                            <p className="text-muted-foreground mt-2.5 text-xs leading-relaxed">{description}</p>

                            <div className="mt-6">{children}</div>
                        </div>

                        <div className="text-muted-foreground mt-4 flex items-center justify-center gap-1.5 text-[10px]">
                            <ShieldCheck className="h-3.5 w-3.5 text-[#0c5c43] dark:text-[#8be0c4]" />
                            Access is limited to active staff accounts.
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
