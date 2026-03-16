import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import DisburseLoanDialog from './components/DisburseLoanDialog';
import PayInstallmentDialog from './components/PayInstallmentDialog';
import { BreadcrumbItem } from '@/types';
import { usePermission } from '@/hooks/usePermission';

export default function LoanShow({ loan }) {
    const statusColor =
        {
            pending: 'secondary',
            approved: 'success',
            disbursed: 'primary',
            closed: 'outline',
        }[loan.status] ?? 'secondary';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Loans',
            href: '/loans',
        },
        {
            title: 'Loans Details ' + loan.loan_no,
            href: '/loans ' + loan.id,
        },
    ];
    const { hasPermission } = usePermission();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loans Detail" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Loan details</h1>
                        <p className="text-sm text-muted-foreground">
                            Overview, status and repayment schedule
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusColor} className="text-xs">
                            {loan.status}
                        </Badge>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(route('loans.voucher', loan.id), '_blank')}
                        >
                            Print voucher
                        </Button>

                        {loan.status === 'pending' && (
                            <>
                                {hasPermission('approve_loans') && (
                                    <Button
                                        size="sm"
                                        onClick={() => router.get(route('loans.approve', loan.id))}
                                    >
                                        Approve loan
                                    </Button>
                                )}
                            </>

                        )}

                        {loan.status === 'approved' && (
                            <DisburseLoanDialog loan={loan} />
                        )}

                        {loan.status === 'disbursed' && (
                            <span className="text-xs text-muted-foreground">
                                Disbursed on {loan.disbursed_at}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content layout */}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                    {/* Loan summary */}
                    <Card className="border bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Loan summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <div>
                                <p className="text-xs text-muted-foreground">Loan no.</p>
                                <p className="font-medium">{loan.loan_no}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Customer</p>
                                <p className="font-medium">{loan.customer.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Branch</p>
                                <p className="font-medium">{loan.branch?.name ?? '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Principal</p>
                                <p className="font-medium">
                                    {Number(loan.principal_amount).toLocaleString()} MMK
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Interest rate</p>
                                <p className="font-medium">{loan.interest_rate}%</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Term</p>
                                <p className="font-medium">{loan.term} months</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Start date</p>
                                <p className="font-medium">{loan.start_date}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Created by</p>
                                <p className="font-medium">{loan.creator?.name}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status / quick info */}
                    <Card className="border bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Status & info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Current status</span>
                                <Badge variant={statusColor} className="text-xs">
                                    {loan.status}
                                </Badge>
                            </div>
                            {loan.status === 'disbursed' && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Disbursed on</span>
                                    <span className="font-medium text-xs">{loan.disbursed_at}</span>
                                </div>
                            )}
                            {/* You can add total paid / outstanding here later */}
                        </CardContent>
                    </Card>
                </div>

                {/* Repayment schedule */}
                <Card className="border bg-card">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Repayment schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40">
                                        <TableHead className="w-10 text-xs">#</TableHead>
                                        <TableHead className="text-xs">Due date</TableHead>
                                        <TableHead className="text-right text-xs">Total (MMK)</TableHead>
                                        <TableHead className="text-right text-xs">Paid (MMK)</TableHead>
                                        <TableHead className="text-xs">Status</TableHead>
                                        <TableHead className="w-24 text-right text-xs">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loan.schedules.map((s: any) => {
                                        const statusVariant =
                                            s.status === 'paid'
                                                ? 'success'
                                                : s.status === 'overdue'
                                                    ? 'destructive'
                                                    : 'secondary'

                                        return (
                                            <TableRow key={s.id} className="hover:bg-muted/30">
                                                <TableCell className="text-xs">{s.installment_no}</TableCell>
                                                <TableCell className="text-xs">{s.due_date}</TableCell>
                                                <TableCell className="text-right text-xs font-mono">
                                                    {Number(s.total_due).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right text-xs font-mono">
                                                    {Number(s.paid_amount).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant={statusVariant} className="w-fit text-[11px]">
                                                            {s.status}
                                                        </Badge>
                                                        {s.overdue_days > 0 && (
                                                            <span className="text-[11px] text-red-600">
                                                                {s.overdue_days} days overdue
                                                            </span>
                                                        )}
                                                        {s.penalty_amount > 0 && (
                                                            <span className="text-[11px] text-red-600">
                                                                Penalty: {s.penalty_amount.toLocaleString()} MMK
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-xs">
                                                    {loan.status === 'disbursed' && s.status !== 'paid' && (
                                                        <PayInstallmentDialog schedule={s} />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>

    );
}
