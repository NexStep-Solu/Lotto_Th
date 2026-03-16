import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Loan {
    id: number;
    loan_no: string;
    principal_amount: number;
    term: number;
    interest_rate: number;
    status: string;
    created_at: string;
    customer: {
        name: string;
    };
    branch: {
        name: string;
    };
}

export default function LoanIndex({ loans }: { loans: { data: Loan[] } }) {
    const { hasPermission } = usePermission();
    const statusVariant = (status: string) => {
        switch (status) {
            case 'pending':
                return 'secondary';
            case 'approved':
                return 'default';
            case 'disbursed':
                return 'success';
            case 'closed':
                return 'outline';
            case 'rejected':
                return 'destructive';
            default:
                return 'secondary';
        }
    };
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Loans',
            href: '/loans',
        },
    ];
    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Loans" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">Loans</h1>
                        {hasPermission('create_loans') && (
                            <Button asChild>
                                <Link href={route('loans.create')}>Create Loan</Link>
                            </Button>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Loan List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Loan No</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Principal</TableHead>
                                        <TableHead>Term</TableHead>
                                        <TableHead>Interest</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {loans.data.map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell className="font-medium">{loan.loan_no}</TableCell>
                                            <TableCell>{loan.customer?.name}</TableCell>
                                            <TableCell>{loan.branch?.name}</TableCell>
                                            <TableCell>{loan.principal_amount.toLocaleString()}</TableCell>
                                            <TableCell>{loan.term} months</TableCell>
                                            <TableCell>{loan.interest_rate}%</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant(loan.status)}>{loan.status}</Badge>
                                            </TableCell>
                                            <TableCell>{new Date(loan.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="space-x-2 text-right">
                                                {hasPermission('view_loans') && (
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={route('loans.show', loan.id)}>View</Link>
                                                    </Button>
                                                )}
                                                {hasPermission('update_loans') && loan.status === 'pending' && (
                                                    <>
                                                        {hasPermission('approve_loans') && (
                                                            <Button size="sm" asChild>
                                                                <Link href={route('loans.approve', loan.id)}>Approve</Link>
                                                            </Button>
                                                        )}
                                                    </>

                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </>
    );
}
