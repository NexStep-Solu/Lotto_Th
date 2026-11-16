import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ShieldCheck, Wallet, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard() {
    const links = [
        {
            title: 'Plan requests',
            description: 'Review and approve BlameVerse subscription plan changes.',
            href: '/admin/plan-requests',
            icon: ShieldCheck,
        },
        {
            title: 'Users',
            description: 'Manage user accounts, roles, and access.',
            href: '/users',
            icon: Users,
        },
        {
            title: 'Cash dashboard',
            description: 'View branch cash ledgers, inflows, and outflows.',
            href: '/cash-dashboard',
            icon: Wallet,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="mx-auto w-full space-y-6 px-4 py-6 sm:px-6">
                <header className="space-y-2 border-b border-border/70 pb-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#0c5c43]/20 bg-[#0c5c43]/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0c5c43] dark:text-emerald-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Administration
                    </div>
                    <h1 className="font-display text-4xl leading-none tracking-tight sm:text-5xl">Admin dashboard</h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Manage plans, users, and operational tools for Lotto Ledger.
                    </p>
                </header>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {links.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href} className="group block">
                                <Card className="h-full rounded-2xl transition hover:border-primary/30 hover:shadow-sm">
                                    <CardHeader className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <Badge variant="secondary" className="gap-1">
                                                Open <ArrowRight className="h-3 w-3" />
                                            </Badge>
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{item.title}</CardTitle>
                                            <CardDescription className="mt-1">{item.description}</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent />
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
