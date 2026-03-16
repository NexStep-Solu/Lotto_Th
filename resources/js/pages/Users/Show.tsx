import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirst } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
}

interface Employee {
    id: number;
    employee_id: string | null;
    phone: string | null;
    address: string | null;
    date_of_birth: string | null;
    hire_date: string | null;
    position: string | null;
    department_id: number | null;
    department?: Department | null;
    salary: string | null;
    status: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    bio: string | null;
    branch_id: number | null;
    branch?: Branch | null;
    active: string;
    roles: Role[];
    employee: Employee | null;
}

interface Props {
    user: User;
}

function Info({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function UsersShow({ user }: Props) {
    const { hasPermission } = usePermission();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/users' },
        { title: user.name, href: `/users/${user.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        <p className="text-muted-foreground text-sm">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                        {hasPermission('update_user') && (
                            <Link href={route('users.edit', user.id)}>
                                <Button variant="outline" className="gap-2">
                                    <Pencil className="h-4 w-4" /> Edit
                                </Button>
                            </Link>
                        )}
                        <Button variant="secondary" onClick={() => router.visit(route('users.index'))}>
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <Info label="Name" value={user.name} />
                        <Info label="Email" value={user.email} />
                        <Info
                            label="Roles"
                            value={user.roles?.length ? user.roles.map((r) => capitalizeFirst(r.name)).join(', ') : null}
                        />
                        <Info label="Branch" value={user.branch?.name} />
                        <Info label="Status" value={user.active} />
                        <div>
                            <p className="text-muted-foreground text-sm">Bio</p>
                            <p className="font-medium">{user.bio || '-'}</p>
                        </div>
                    </CardContent>
                </Card>

                {user.employee && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <Info label="Employee ID" value={user.employee.employee_id} />
                            <Info label="Phone" value={user.employee.phone} />
                            <Info label="Position" value={user.employee.position} />
                            <Info label="Department" value={user.employee.department?.name} />
                            <Info
                                label="Date of Birth"
                                value={user.employee.date_of_birth ? new Date(user.employee.date_of_birth).toLocaleDateString() : null}
                            />
                            <Info
                                label="Hire Date"
                                value={user.employee.hire_date ? new Date(user.employee.hire_date).toLocaleDateString() : null}
                            />
                            <Info label="Salary" value={user.employee.salary} />
                            <div>
                                <p className="text-muted-foreground text-sm">Status</p>
                                <Badge variant="outline">{user.employee.status}</Badge>
                            </div>
                            {user.employee.address && (
                                <div className="md:col-span-2">
                                    <p className="text-muted-foreground text-sm">Address</p>
                                    <p className="font-medium">{user.employee.address}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
