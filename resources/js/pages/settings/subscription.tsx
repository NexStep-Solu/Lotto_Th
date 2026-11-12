import HeadingSmall from '@/components/heading-small';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    Check,
    CircleGauge,
    Clock,
    FileImage,
    ShieldCheck,
    Sparkles,
    Ticket,
    Upload,
} from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Plan & usage',
        href: '/settings/subscription',
    },
];

type PlanOption = {
    value: 'basic' | 'pro';
    label: string;
    tagline: string;
    price: number;
    currency: string;
    draws_per_month: number;
    tickets_per_draw: number | null;
    total_tickets: number;
    features: string[];
};

type Subscription = {
    plan: 'basic' | 'pro';
    label: string;
    tagline: string;
    price: number;
    currency: string;
    features: string[];
    unlimited: boolean;
    limits: {
        draws_per_month: number;
        tickets_per_draw: number | null;
        total_tickets: number;
    };
    usage: {
        tickets_used: number;
        tickets_remaining: number;
        draws_used: number;
        draws_remaining: number;
        used_draws: string[];
        renews_at: string | null;
        period_start: string | null;
    };
};

interface SubscriptionSettingsProps {
    subscription: Subscription;
    plans: PlanOption[];
    pendingRequest: {
        id: number;
        requested_plan: 'basic' | 'pro';
        message: string | null;
        created_at: string | null;
    } | null;
}

function formatDate(value: string | null): string {
    if (!value) return '—';

    return new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatRequestDate(value: string | null): string {
    if (!value) return 'just now';

    return new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function UsageMeter({
    label,
    used,
    limit,
    hint,
    icon: Icon,
}: {
    label: string;
    used: number;
    limit: number;
    hint: string;
    icon: typeof Ticket;
}) {
    const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    const exhausted = used >= limit;

    return (
        <div className="rounded-2xl border bg-background/80 p-5">
            <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                </span>
                <span className="font-ticket text-xs tabular-nums">
                    {used.toLocaleString()} / {limit.toLocaleString()}
                </span>
            </div>

            <div className="bg-muted mt-4 h-2 overflow-hidden rounded-full">
                <div
                    className={
                        exhausted
                            ? 'h-full rounded-full bg-amber-500 transition-all'
                            : 'h-full rounded-full bg-[#0c5c43] transition-all dark:bg-emerald-400'
                    }
                    style={{ width: `${percent}%` }}
                />
            </div>

            <p className="text-muted-foreground mt-3 text-[11px] leading-relaxed">{hint}</p>
        </div>
    );
}

export default function SubscriptionSettings({ subscription, plans, pendingRequest }: SubscriptionSettingsProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        plan: subscription.plan,
        message: '',
        payment_proof: null as File | null,
    });

    const selected = plans.find((plan) => plan.value === data.plan) ?? plans[0];
    const changed = data.plan !== subscription.plan;
    const hasPending = pendingRequest !== null;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('subscription.request'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Your plan change request has been sent to the administrator.');
                reset('message', 'payment_proof');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Plan & usage" />

            <div className="mx-auto w-full space-y-8 px-4 py-6 sm:px-6">
                <header className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#b08d57]/30 bg-[#b08d57]/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a6b3f] dark:text-[#d4b07a]">
                            <Sparkles className="h-3.5 w-3.5" />
                            BlameVerse Lottery Checker
                        </div>
                        <h1 className="font-display text-4xl leading-none tracking-tight sm:text-5xl">
                            Plan &amp; usage
                        </h1>
                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            Track your monthly checking allowance, review your current plan, and request an upgrade
                            with payment proof for the draw desk.
                        </p>
                    </div>

                    <div className="rounded-2xl border bg-card px-4 py-3 text-right shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Current plan
                        </p>
                        <p className="font-display mt-1 text-2xl leading-none">{subscription.label}</p>
                        <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Renews {formatDate(subscription.usage.renews_at)}
                        </p>
                    </div>
                </header>

                <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
                    <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="border-b bg-gradient-to-br from-[#0c5c43]/[0.08] via-transparent to-transparent p-6 lg:border-b-0 lg:border-r">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                        Active subscription
                                    </p>
                                    <h2 className="font-display mt-2 text-3xl leading-none tracking-tight">
                                        BlameVerse {subscription.label}
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground">{subscription.tagline}</p>
                                </div>
                                <span className="rounded-full border border-[#0c5c43]/25 bg-[#0c5c43]/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0c5c43] dark:text-emerald-300">
                                    {subscription.unlimited ? 'Unlimited' : 'Active'}
                                </span>
                            </div>

                            <div className="mt-6 flex items-end gap-3">
                                <span className="font-ticket text-4xl font-semibold tabular-nums">
                                    {subscription.price.toLocaleString()}
                                </span>
                                <span className="pb-1 text-sm text-muted-foreground">
                                    {subscription.currency} / month
                                </span>
                            </div>

                            <ul className="mt-6 space-y-2">
                                {subscription.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm">
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0c5c43] dark:text-emerald-300" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-6">
                            {subscription.unlimited ? (
                                <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#0c5c43]/30 bg-[#0c5c43]/[0.05] p-6 text-center">
                                    <ShieldCheck className="h-8 w-8 text-[#0c5c43] dark:text-emerald-300" />
                                    <p className="mt-3 font-display text-2xl leading-none">Unlimited checking</p>
                                    <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                                        Administrator accounts are not limited by monthly ticket or draw quotas.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <UsageMeter
                                        label="Tickets this month"
                                        used={subscription.usage.tickets_used}
                                        limit={subscription.limits.total_tickets}
                                        icon={Ticket}
                                        hint={
                                            subscription.usage.tickets_remaining > 0
                                                ? `${subscription.usage.tickets_remaining.toLocaleString()} tickets remaining`
                                                : 'Monthly ticket limit reached'
                                        }
                                    />
                                    <UsageMeter
                                        label="Draws this month"
                                        used={subscription.usage.draws_used}
                                        limit={subscription.limits.draws_per_month}
                                        icon={CircleGauge}
                                        hint={
                                            subscription.usage.draws_remaining > 0
                                                ? `${subscription.usage.draws_remaining} draw${subscription.usage.draws_remaining === 1 ? '' : 's'} remaining`
                                                : 'Draw limit reached — resets next month'
                                        }
                                    />
                                    <div className="flex items-start gap-2 rounded-2xl border bg-muted/40 px-4 py-3 text-[11px] text-muted-foreground">
                                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0c5c43] dark:text-emerald-300" />
                                        Image scanning runs in your browser. Only the ticket count used for your plan is
                                        recorded.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {!subscription.unlimited && pendingRequest && (
                    <section className="rounded-3xl border border-amber-500/30 bg-amber-500/[0.06] p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-display text-2xl leading-none">Pending plan request</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    You requested{' '}
                                    <span className="font-semibold text-foreground">
                                        BlameVerse {pendingRequest.requested_plan === 'basic' ? 'Basic' : 'Pro'}
                                    </span>{' '}
                                    on {formatRequestDate(pendingRequest.created_at)}. The administrator will review it
                                    and update your plan.
                                </p>
                                {pendingRequest.message && (
                                    <p className="mt-3 rounded-2xl border bg-background/70 px-4 py-3 text-sm italic text-muted-foreground">
                                        &ldquo;{pendingRequest.message}&rdquo;
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {!subscription.unlimited && (
                    <section className="rounded-3xl border bg-card p-6 shadow-sm">
                        <div className="mb-6">
                            <HeadingSmall
                                title="Request a plan change"
                                description="Choose a plan, add an optional note, and attach payment proof. Requests are reviewed by the administrator."
                            />
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                {plans.map((plan) => {
                                    const active = plan.value === data.plan;
                                    const current = plan.value === subscription.plan;

                                    return (
                                        <label
                                            key={plan.value}
                                            className={
                                                active
                                                    ? 'relative cursor-pointer rounded-3xl border-2 border-[#0c5c43] bg-[#0c5c43]/[0.05] p-5 transition dark:border-emerald-400'
                                                    : 'bg-card hover:border-foreground/25 relative cursor-pointer rounded-3xl border-2 p-5 transition'
                                            }
                                        >
                                            <input
                                                type="radio"
                                                name="plan"
                                                value={plan.value}
                                                checked={active}
                                                onChange={() => setData('plan', plan.value)}
                                                className="sr-only"
                                                disabled={hasPending}
                                            />

                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                                        {plan.tagline}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <p className="font-display text-3xl leading-none">{plan.label}</p>
                                                        {current && (
                                                            <span className="rounded-full border border-[#0c5c43]/20 bg-[#0c5c43]/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0c5c43] dark:text-emerald-300">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="mt-5 font-ticket text-2xl font-semibold tabular-nums">
                                                {plan.price.toLocaleString()} {plan.currency}
                                                <span className="text-muted-foreground ml-1 font-sans text-xs font-normal">
                                                    / month
                                                </span>
                                            </p>

                                            <ul className="mt-5 space-y-2.5">
                                                {plan.features.map((feature) => (
                                                    <li key={feature} className="flex items-start gap-2 text-sm">
                                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0c5c43] dark:text-emerald-300" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <span
                                                aria-hidden="true"
                                                className={
                                                    active
                                                        ? 'absolute right-5 top-5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0c5c43] bg-[#0c5c43] dark:border-emerald-400 dark:bg-emerald-400'
                                                        : 'absolute right-5 top-5 h-5 w-5 rounded-full border-2 border-muted-foreground/30'
                                                }
                                            >
                                                {active && <span className="h-2 w-2 rounded-full bg-white" />}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>

                            {errors.plan && <p className="text-destructive text-sm">{errors.plan}</p>}

                            <div className="grid gap-5 lg:grid-cols-2">
                                <div>
                                    <label className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">
                                        Message to administrator (optional)
                                    </label>
                                    <Textarea
                                        value={data.message}
                                        onChange={(event) => setData('message', event.target.value)}
                                        placeholder="Tell the draw desk why you need this plan..."
                                        className="mt-2 min-h-[130px] rounded-2xl text-sm"
                                        disabled={hasPending}
                                    />
                                    {errors.message && (
                                        <p className="text-destructive mt-2 text-sm">{errors.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">
                                        Payment transaction image (optional)
                                    </label>
                                    <label
                                        className={
                                            hasPending
                                                ? 'mt-2 flex min-h-[130px] cursor-not-allowed flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-4 py-6 text-center'
                                                : 'mt-2 flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-4 py-6 text-center transition hover:border-[#0c5c43]/40 hover:bg-[#0c5c43]/[0.03]'
                                        }
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            disabled={hasPending}
                                            onChange={(event) =>
                                                setData('payment_proof', event.target.files?.[0] ?? null)
                                            }
                                            className="sr-only"
                                        />
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0c5c43]/10 text-[#0c5c43] dark:bg-emerald-400/10 dark:text-emerald-300">
                                            {data.payment_proof ? (
                                                <FileImage className="h-5 w-5" />
                                            ) : (
                                                <Upload className="h-5 w-5" />
                                            )}
                                        </div>
                                        <p className="mt-3 text-sm font-medium">
                                            {data.payment_proof ? data.payment_proof.name : 'Upload payment proof'}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            JPG, PNG, or WebP up to 4MB
                                        </p>
                                    </label>

                                    {data.payment_proof && (
                                        <div className="mt-3 overflow-hidden rounded-2xl border bg-muted/20">
                                            <img
                                                src={URL.createObjectURL(data.payment_proof)}
                                                alt="Payment transaction preview"
                                                className="max-h-56 w-full object-contain"
                                            />
                                            <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
                                                <span className="truncate">{data.payment_proof.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('payment_proof', null)}
                                                    className="font-semibold text-[#0c5c43] hover:underline dark:text-emerald-300"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {errors.payment_proof && (
                                        <p className="text-destructive mt-2 text-sm">{errors.payment_proof}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {hasPending
                                        ? 'You already have a pending request. Wait for review before sending another.'
                                        : 'Your current usage is preserved when the plan changes.'}
                                </p>
                                <button
                                    type="submit"
                                    disabled={!changed || processing || hasPending}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0c5c43] px-6 text-sm font-semibold text-[#f8f5ea] transition hover:bg-[#0a4d38] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#14795a] dark:hover:bg-[#168867]"
                                >
                                    {processing ? 'Sending...' : `Request ${selected.label}`}
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
