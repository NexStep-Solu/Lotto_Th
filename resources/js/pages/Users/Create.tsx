import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

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

interface Props {
    roles: Role[];
    departments: Department[];
    branches: Branch[];
}

export default function UsersCreate({ roles, departments, branches }: Props) {
    console.log(departments);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users',
            href: '/users',
        },
        {
            title: 'Create',
            href: '/users/create',
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        branch_id: '',
        bio: '',
        // Employee fields
        employee_id: '',
        phone: '',
        address: '',
        date_of_birth: '',
        hire_date: '',
        position: '',
        department_id: '',
        salary: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User created successfully with employee information.', {
                    position: 'top-center',
                    duration: 3000,
                });
                reset();
            },
            onError: () => {
                toast.error('Error creating user. Please check the form.', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Create User" />

                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="my-4">
                        <h1 className="text-2xl font-bold">Create New User</h1>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="Full name"
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        placeholder="Password (min 8 characters)"
                                    />
                                    <InputError message={errors.password} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        placeholder="Confirm password"
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="role_id">Role *</Label>
                                    <Select
                                        value={data.role_id ? String(data.role_id) : undefined}
                                        onValueChange={(value) => setData('role_id', value)}
                                        disabled={processing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={String(role.id)}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <InputError message={errors.role_id} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="branch_id">Branch</Label>
                                    <Select
                                        value={data.branch_id ? String(data.branch_id) : undefined}
                                        onValueChange={(value) => setData('branch_id', value)}
                                        disabled={processing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a branch" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={String(branch.id)}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <InputError message={errors.branch_id} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                        disabled={processing}
                                        placeholder="User bio"
                                        rows={3}
                                    />
                                    <InputError message={errors.bio} className="mt-1" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Employee Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="employee_id">Employee ID</Label>
                                    <Input
                                        id="employee_id"
                                        type="text"
                                        value={data.employee_id}
                                        onChange={(e) => setData('employee_id', e.target.value)}
                                        disabled={processing}
                                        placeholder="Employee ID (optional)"
                                    />
                                    <InputError message={errors.employee_id} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        disabled={processing}
                                        placeholder="Phone number"
                                    />
                                    <InputError message={errors.phone} className="mt-1" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        disabled={processing}
                                        placeholder="Address"
                                        rows={2}
                                    />
                                    <InputError message={errors.address} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.date_of_birth} className="mt-1" />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="hire_date">Hire Date</Label>
                                        <Input
                                            id="hire_date"
                                            type="date"
                                            value={data.hire_date}
                                            onChange={(e) => setData('hire_date', e.target.value)}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.hire_date} className="mt-1" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="position">Position</Label>
                                        <Input
                                            id="position"
                                            type="text"
                                            value={data.position}
                                            onChange={(e) => setData('position', e.target.value)}
                                            disabled={processing}
                                            placeholder="Job position"
                                        />
                                        <InputError message={errors.position} className="mt-1" />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="department_id">Department</Label>
                                        <Select
                                            value={data.department_id ? String(data.department_id) : undefined}
                                            onValueChange={(value) => setData('department_id', value)}
                                            disabled={processing}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a department" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {departments.map((department) => (
                                                    <SelectItem key={department.id} value={String(department.id)}>
                                                        {department.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <InputError message={errors.department_id} className="mt-1" />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="salary">Salary</Label>
                                    <Input
                                        id="salary"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.salary}
                                        onChange={(e) => setData('salary', e.target.value)}
                                        disabled={processing}
                                        placeholder="Salary amount"
                                    />
                                    <InputError message={errors.salary} className="mt-1" />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.visit(route('users.index'))} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Create User
                            </Button>
                        </div>
                    </form>
                </div>
            </AppLayout>
        </>
    );
}
