import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import OfflinePage from '../OfflinePage';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    active: string;
    roles?: Role[];
    role?: string; // fallback for old enum field
}

interface Props {
    customers: any;
    userRole: 'learner' | 'teacher' | 'admin';
}
export default function UsersIndex({ customers, userRole }: Props) {
    const { hasPermission } = usePermission();
    console.log(hasPermission);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Customers',
            href: '/customers',
        },
    ];
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        window.addEventListener('online', () => setOnline(true));
        window.addEventListener('offline', () => setOnline(false));
    }, []);

    if (!online) {
        return <OfflinePage />;
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Customers Managements" />

                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="my-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Customer Management</h1>
                        {hasPermission('create_customers') && (
                            <>
                                <Link href={route('customers.create')}>
                                    <Button className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" /> Add customers
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Customers</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Customer No</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>NRC</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {customers?.data.map((customer: any) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>{customer.id}</TableCell>
                                            <TableCell className="font-medium">{customer.customer_no}</TableCell>
                                            <TableCell>{customer.name}</TableCell>
                                            <TableCell>{customer.nrc ?? '-'}</TableCell>
                                            <TableCell>{customer.phone ?? '-'}</TableCell>
                                            <TableCell>{customer.branch?.name ?? '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {hasPermission('view_customers') && (
                                                        <Link href={route('customers.show', customer.id)}>
                                                            <Button size="icon" variant="outline">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}

                                                    {hasPermission('update_customers') && (
                                                        <Link href={route('customers.edit', customer.id)}>
                                                            <Button size="icon" variant="outline">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {customers?.links && customers?.links.length > 1 && <Pagination links={customers?.links} />}
                </div>
            </AppLayout>
        </>
    );
}
