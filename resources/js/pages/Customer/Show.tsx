import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ExternalLink, User } from 'lucide-react';

type Props = {
    customer: any;
};

export default function CustomersShow({ customer }: Props) {
    const { hasPermission } = usePermission();
    const address = customer.addresses?.[0];
    const avatarUrl = customer.avatar ? `/storage/${customer.avatar}` : null;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/customers' },
        { title: 'View Customer', href: `/customers/${customer.id}` },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Details" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={customer.name} className="h-full w-full object-cover" />
                            ) : (
                                <User className="text-muted-foreground h-8 w-8" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{customer.name}</h1>
                            <p className="text-muted-foreground text-sm">Customer No: {customer.customer_no}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {hasPermission('update_customers') && (
                            <Button variant="outline" onClick={() => router.visit(route('customers.edit', customer.id))}>
                                Edit
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => router.visit(route('customers.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                {/* Customer Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="NRC" value={customer.nrc} />
                        <Info label="Gender" value={customer.gender} />
                        <Info label="Phone" value={customer.phone} />
                        <Info label="Email" value={customer.email ?? '-'} />
                        <Info label="Date of Birth" value={customer.dob} />
                        <Info label="Occupation" value={customer.occupation} />
                        <Info label="Monthly Income" value={`${customer.monthly_income} MMK`} />
                        <Info label="Remark" value={customer.remark ?? '-'} />
                    </CardContent>
                </Card>

                {/* Credit Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Credit Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="Credit Level" value={customer.credit_level?.name} />
                        <Info label="Limit Expired At" value={customer.limit_expired_at} />
                        <Info label="Branch" value={`${customer.branch?.name} (${customer.branch?.location?.name})`} />
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <Badge variant="outline">Active</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Address */}
                <Card>
                    <CardHeader>
                        <CardTitle>Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        <p>{address?.address_line ?? '-'}</p>
                        <p className="text-muted-foreground">
                            {address?.township}, {address?.district}, {address?.region}
                        </p>
                    </CardContent>
                </Card>

                {/* Loan processes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Loan Processes</CardTitle>
                        <p className="text-muted-foreground text-sm">Loans for this customer.</p>
                    </CardHeader>
                    <CardContent>
                        {customer.loans?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Loan No</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead className="text-right">Principal (MMK)</TableHead>
                                        <TableHead>Term</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customer.loans.map((loan: {
                                        id: number;
                                        loan_no: string;
                                        principal_amount: number;
                                        term: number;
                                        status: string;
                                        branch?: { name: string };
                                    }) => (
                                        <TableRow key={loan.id}>
                                            <TableCell className="font-medium">{loan.loan_no}</TableCell>
                                            <TableCell>{loan.branch?.name ?? '—'}</TableCell>
                                            <TableCell className="text-right">{Number(loan.principal_amount).toLocaleString()}</TableCell>
                                            <TableCell>{loan.term} months</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant(loan.status)}>{loan.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {hasPermission('view_loans') && (
                                                    <Link href={route('loans.show', loan.id)} className="text-primary hover:underline text-sm">
                                                        View
                                                    </Link>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground text-sm">No loans yet.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Documents */}
                {customer.documents?.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {customer.documents.map((doc: { id: number; type: string; file_path: string }) => (
                                    <li key={doc.id} className="flex items-center justify-between rounded border p-2">
                                        <span className="font-medium">{doc.type}</span>
                                        <a
                                            href={`/storage/${doc.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-primary hover:underline"
                                        >
                                            View <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'pending':
            return 'secondary';
        case 'approved':
            return 'default';
        case 'disbursed':
            return 'default';
        case 'closed':
            return 'outline';
        case 'rejected':
            return 'destructive';
        default:
            return 'secondary';
    }
}

/* Small reusable component */
function Info({ label, value }: { label: string; value?: string }) {
    return (
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}
