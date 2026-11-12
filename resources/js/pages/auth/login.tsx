import InputError from '@/components/input-error';
import LottoBrand from '@/components/lotto-brand';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, LoaderCircle, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Sign in">
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="relative min-h-dvh overflow-hidden bg-[#f3f0e7] text-[#17251c] antialiased dark:bg-[#0b0f0d] dark:text-[#f1efe5]">
                <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_10%_0%,rgba(12,92,67,0.14),transparent_60%),radial-gradient(ellipse_55%_45%_at_95%_10%,rgba(176,141,87,0.16),transparent_55%)] dark:bg-[radial-gradient(ellipse_75%_55%_at_10%_0%,rgba(60,191,150,0.1),transparent_60%),radial-gradient(ellipse_55%_45%_at_95%_10%,rgba(216,180,122,0.07),transparent_55%)]" />
                    <div className="public-grid-lines absolute inset-0 opacity-60" />
                    <div className="public-grain absolute inset-0 opacity-[0.045] dark:opacity-[0.05]" />
                </div>

                <div className="relative z-10 flex min-h-dvh flex-col">
                    <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href={route('home')} className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#0c5c43]/30">
                            <LottoBrand subtitle="Staff access" />
                        </Link>

                        <Link
                            href={route('home')}
                            className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-[#17251c]/10 bg-[#fbf9f2]/70 px-3.5 text-[11px] font-semibold transition hover:border-[#0c5c43]/25 hover:bg-[#fffdf7] focus-visible:ring-2 focus-visible:ring-[#0c5c43]/30 focus-visible:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                            Back to results
                        </Link>
                    </header>

                    <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
                        <section className="hidden lg:block">
                            <p className="eyebrow text-[#0c5c43] dark:text-[#8be0c4]">Private draw desk</p>
                            <h1 className="font-display mt-5 text-[clamp(3.5rem,5.5vw,5.25rem)] leading-[0.88] tracking-[-0.025em] text-balance">
                                Your numbers,
                                <br />
                                <span className="text-[#0c5c43] italic dark:text-[#7bdcbe]">quietly checked.</span>
                            </h1>
                            <p className="text-muted-foreground mt-6 max-w-md text-sm leading-relaxed">
                                Sign in to manage the draw desk, scan tickets in bulk, and keep a clean record of every number you check. Sessions are
                                private to your account.
                            </p>

                            <div className="relative mt-9 max-w-md overflow-hidden rounded-2xl border border-[#17251c]/10 bg-[#fffdf7]/70 p-5 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_24px_60px_-46px_rgba(18,32,25,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045]">
                                <div className="flex items-center justify-between">
                                    <p className="eyebrow text-muted-foreground text-[9px]">Ticket stub</p>
                                    <span className="font-ticket text-muted-foreground text-[10px] tabular-nums">No. 0041</span>
                                </div>

                                <div className="mt-4 flex gap-1.5">
                                    {['—', '—', '—', '—', '—', '—'].map((digit, index) => (
                                        <span
                                            key={index}
                                            aria-hidden="true"
                                            className="font-ticket flex h-12 flex-1 items-center justify-center rounded-md border border-[#17251c]/10 bg-[#fffdf7] text-lg text-[#17251c]/20 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/20"
                                        >
                                            {digit}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#17251c]/15 pt-3 dark:border-white/10">
                                    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[10px]">
                                        <ShieldCheck className="h-3.5 w-3.5 text-[#0c5c43] dark:text-[#8be0c4]" />
                                        Checked locally, never stored
                                    </span>
                                    <span className="font-ticket text-[9px] tracking-[0.14em] text-[#b08d57] uppercase dark:text-[#d8b47a]">
                                        Private
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section className="mx-auto w-full max-w-md lg:justify-self-end">
                            <div className="rounded-2xl border border-[#17251c]/10 bg-[#fbf9f2]/85 p-6 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_28px_60px_-48px_rgba(18,32,25,0.55)] backdrop-blur-xl sm:p-8 dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_28px_60px_-48px_rgba(0,0,0,0.9)]">
                                <p className="eyebrow text-[#0c5c43] dark:text-[#8be0c4]">Staff access</p>
                                <h2 className="font-display mt-2 text-4xl leading-none tracking-tight">Sign in</h2>
                                <p className="text-muted-foreground mt-2.5 text-xs leading-relaxed">
                                    Use the account your administrator created for you.
                                </p>

                                {status && (
                                    <div
                                        role="status"
                                        className="mt-5 rounded-xl border border-[#0c5c43]/20 bg-[#0c5c43]/[0.06] px-3.5 py-2.5 text-xs font-medium text-[#0c5c43] dark:border-[#3cbf96]/25 dark:bg-[#3cbf96]/10 dark:text-[#8be0c4]"
                                    >
                                        {status}
                                    </div>
                                )}

                                <form className="mt-7 space-y-5" onSubmit={submit}>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-xs font-semibold">
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(event) => setData('email', event.target.value)}
                                            placeholder="you@example.com"
                                            aria-invalid={Boolean(errors.email)}
                                            className="h-11 rounded-xl border-[#17251c]/15 bg-[#fffdf7] px-3.5 text-sm shadow-none focus-visible:border-[#0c5c43] focus-visible:ring-[#0c5c43]/15 dark:border-white/10 dark:bg-white/[0.05] dark:focus-visible:border-[#3cbf96]"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <Label htmlFor="password" className="text-xs font-semibold">
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <Link
                                                    href={route('password.request')}
                                                    className="text-[11px] font-medium text-[#0c5c43] underline-offset-4 transition hover:underline dark:text-[#8be0c4]"
                                                >
                                                    Forgot password?
                                                </Link>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                value={data.password}
                                                onChange={(event) => setData('password', event.target.value)}
                                                placeholder="Your password"
                                                aria-invalid={Boolean(errors.password)}
                                                className="h-11 rounded-xl border-[#17251c]/15 bg-[#fffdf7] px-3.5 pr-11 text-sm shadow-none focus-visible:border-[#0c5c43] focus-visible:ring-[#0c5c43]/15 dark:border-white/10 dark:bg-white/[0.05] dark:focus-visible:border-[#3cbf96]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((visible) => !visible)}
                                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-[#17251c]/[0.06] dark:hover:bg-white/10"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            checked={data.remember}
                                            onCheckedChange={(checked) => setData('remember', checked === true)}
                                            tabIndex={3}
                                            className="data-[state=checked]:border-[#0c5c43] data-[state=checked]:bg-[#0c5c43] data-[state=checked]:text-[#f8f5ea]"
                                        />
                                        <Label htmlFor="remember" className="text-muted-foreground text-xs font-medium">
                                            Keep me signed in on this device
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-11 w-full rounded-xl bg-[#0c5c43] text-[#f8f5ea] shadow-[0_12px_26px_-16px_rgba(12,92,67,0.9)] transition hover:bg-[#0a4d38] focus-visible:ring-[#0c5c43]/30 active:translate-y-px dark:bg-[#14795a] dark:hover:bg-[#168867]"
                                        tabIndex={4}
                                        disabled={processing}
                                    >
                                        {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                                        {processing ? 'Signing in…' : 'Sign in'}
                                    </Button>
                                </form>

                                <div className="text-muted-foreground mt-6 flex items-start gap-2 border-t border-dashed border-[#17251c]/15 pt-4 text-[10px] leading-relaxed dark:border-white/10">
                                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0c5c43] dark:text-[#8be0c4]" />
                                    Access is limited to active staff accounts. Contact an administrator if you cannot sign in.
                                </div>
                            </div>

                            <p className="text-muted-foreground mt-4 text-center text-[10px]">Lotto Ledger · Independent draw desk</p>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
