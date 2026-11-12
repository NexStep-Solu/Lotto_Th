import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Check, Eye, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Plan requests',
        href: '/admin/plan-requests',
    },
];

type PlanRequest = {
    id: number;
    requested_plan: 'basic' | 'pro';
    message: string | null;
    payment_proof_path: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string | null;
    reviewed_at: string | null;
    user: { id: number; name: string; email: string } | null;
    reviewer: { id: number; name: string } | null;
};

type Paginator = {
    data: PlanRequest[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    requests: Paginator;
};

function formatDate(value: string | null): string {
    if (!value) return '—';

    return new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function statusTone(status: PlanRequest['status']): string {
    if (status === 'approved') {
        return 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-300';
    }

    if (status === 'rejected') {
        return 'border-rose-500/25 bg-rose-500/[0.08] text-rose-700 dark:text-rose-300';
    }

    return 'border-amber-500/25 bg-amber-500/[0.08] text-amber-700 dark:text-amber-300';
}

export default function PlanChangeRequests({ requests }: Props) {
    const [proofUrl, setProofUrl] = useState<string | null>(null);

    const approve = (id: number) => {
        router.post(route('admin.plan-requests.approve', id), {}, { preserveScroll: true });
    };

    const reject = (id: number) => {
        router.post(route('admin.plan-requests.reject', id), {}, { preserveScroll: true });
    };

    const pendingCount = requests.data.filter((request) => request.status === 'pending').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Plan requests" />

            <div className="mx-auto w-full space-y-6 px-4 py-6 sm:px-6">
                <header className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#0c5c43]/20 bg-[#0c5c43]/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0c5c43] dark:text-emerald-300">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Administration
                        </div>
                        <h1 className="font-display text-4xl leading-none tracking-tight sm:text-5xl">
                            Plan change requests
                        </h1>
                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            Review BlameVerse Lottery Checker subscription requests, inspect payment proof, and approve
                            or reject plan changes.
                        </p>
                    </div>

                    <div className="rounded-2xl border bg-card px-4 py-3 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Pending review
                        </p>
                        <p className="font-ticket mt-1 text-3xl font-semibold tabular-nums">{pendingCount}</p>
                    </div>
                </header>

                <Card className="overflow-hidden rounded-3xl border shadow-sm">
                    <CardHeader className="border-b bg-muted/30 px-6 py-4">
                        <CardTitle className="font-display text-2xl leading-none">Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[920px] text-sm">
                                <thead className="border-b bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Requested plan</th>
                                        <th className="px-6 py-4">Message</th>
                                        <th className="px-6 py-4">Payment proof</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Sent</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {requests.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                                No plan change requests yet.
                                            </td>
                                        </tr>
                                    )}

                                    {requests.data.map((request) => {
                                        const proofPath = request.payment_proof_path;
                                        const proofUrlValue = proofPath ? `/storage/${proofPath}` : null;

                                        return (
                                            <tr key={request.id} className="align-top transition hover:bg-muted/20">
                                                <td className="px-6 py-4">
                                                    <p className="font-medium">{request.user?.name ?? 'Unknown user'}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {request.user?.email ?? 'No email'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-display text-xl leading-none">
                                                        {request.requested_plan === 'basic' ? 'Basic' : 'Pro'}
                                                    </span>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {request.requested_plan === 'basic' ? '3,000 MMK' : '10,000 MMK'} / month
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    <p className="max-w-[220px] leading-relaxed">
                                                        {request.message || 'No message provided.'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {proofUrlValue ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setProofUrl(proofUrlValue)}
                                                            className="group relative h-14 w-14 overflow-hidden rounded-2xl border bg-muted/30 transition hover:border-[#0c5c43]/40"
                                                        >
                                                            <img
                                                                src={proofUrlValue}
                                                                alt="Payment proof"
                                                                className="h-full w-full object-cover transition group-hover:scale-105"
                                                            />
                                                            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                                                                <Eye className="h-4 w-4" />
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No proof</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusTone(request.status)}`}
                                                    >
                                                        {request.status}
                                                    </span>
                                                    {request.reviewed_at && (
                                                        <p className="mt-2 text-[10px] text-muted-foreground">
                                                            {formatDate(request.reviewed_at)}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {formatDate(request.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {request.status === 'pending' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" onClick={() => approve(request.id)}>
                                                                <Check className="h-3.5 w-3.5" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => reject(request.id)}
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            Reviewed by {request.reviewer?.name ?? 'admin'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {requests.links.length > 3 && (
                    <div className="flex flex-wrap gap-2">
                        {requests.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                className={
                                    link.active
                                        ? 'rounded-xl bg-[#0c5c43] px-3 py-2 text-xs font-semibold text-[#f8f5ea]'
                                        : 'rounded-xl border px-3 py-2 text-xs disabled:opacity-40'
                                }
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={!!proofUrl} onOpenChange={(open) => !open && setProofUrl(null)}>
                <DialogContent className="max-w-4xl rounded-3xl p-3 sm:p-4">
                    <DialogHeader className="px-2 pt-2">
                        <DialogTitle className="font-display text-2xl leading-none">
                            Payment transaction proof
                        </DialogTitle>
                        <DialogDescription>
                            Review the uploaded payment image before approving the plan change.
                        </DialogDescription>
                    </DialogHeader>
                    {proofUrl && (
                        <div className="overflow-hidden rounded-2xl border bg-muted/20">
                            <img
                                src={proofUrl}
                                alt="Payment transaction proof"
                                className="max-h-[75vh] w-full object-contain"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
