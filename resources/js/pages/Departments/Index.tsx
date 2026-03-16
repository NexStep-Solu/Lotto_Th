import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Department {
    id: number;
    name: string;
    description: string | null;
    employees_count: number;
}

interface Props {
    departments: {
        data: Department[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function DepartmentsIndex({ departments }: Props) {
    const { hasPermission } = usePermission();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Departments',
            href: '/departments',
        },
    ];

    const {
        data: createData,
        setData: setCreateData,
        post,
        processing: creating,
        reset: resetCreate,
    } = useForm({
        name: '',
        description: '',
    });

    const {
        data: updateData,
        setData: setUpdateData,
        put,
        processing: updating,
        reset: resetUpdate,
    } = useForm({
        name: '',
        description: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('departments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Department created successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error creating department', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDepartment) return;

        put(route('departments.update', editingDepartment.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingDepartment(null);
                resetUpdate();
                toast.success('Department updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating department', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    const handleDelete = (departmentId: number) => {
        if (confirm('Are you sure you want to delete this department?')) {
            router.delete(route('departments.destroy', departmentId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Department deleted successfully', {
                        position: 'top-center',
                        duration: 3000,
                    });
                },
                onError: (errors) => {
                    const errorMessage = errors.error || 'Error deleting department';
                    toast.error(errorMessage, {
                        position: 'top-center',
                        duration: 3000,
                    });
                },
            });
        }
    };

    const openEditDialog = (department: Department) => {
        setEditingDepartment(department);
        setUpdateData({
            name: department.name,
            description: department.description || '',
        });
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Departments Management" />

                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="my-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Departments Management</h1>
                        {hasPermission('create_departments') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Department
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create New Department</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Department Name *</Label>
                                        <Input
                                            id="name"
                                            value={createData.name}
                                            onChange={(e) => setCreateData('name', e.target.value)}
                                            placeholder="Enter department name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={createData.description}
                                            onChange={(e) => setCreateData('description', e.target.value)}
                                            placeholder="Enter department description"
                                            rows={4}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsCreateOpen(false);
                                                resetCreate();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={creating}>
                                            {creating ? 'Creating...' : 'Create Department'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Departments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Employees</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-muted-foreground text-center">
                                                No departments found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        departments.data.map((department) => (
                                            <TableRow key={department.id}>
                                                <TableCell>{department.id}</TableCell>
                                                <TableCell className="font-medium">{department.name}</TableCell>
                                                <TableCell>
                                                    <span className="text-muted-foreground text-sm">
                                                        {department.description || 'No description'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{department.employees_count}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {hasPermission('update_departments') && (
                                                            <Button variant="outline" size="icon" onClick={() => openEditDialog(department)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {hasPermission('delete_departments') && (
                                                            <Button variant="outline" size="icon" onClick={() => handleDelete(department.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {editingDepartment && (
                        <Dialog open={!!editingDepartment} onOpenChange={(open) => !open && setEditingDepartment(null)}>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Edit Department</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-name">Department Name *</Label>
                                        <Input
                                            id="edit-name"
                                            value={updateData.name}
                                            onChange={(e) => setUpdateData('name', e.target.value)}
                                            placeholder="Enter department name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-description">Description</Label>
                                        <Textarea
                                            id="edit-description"
                                            value={updateData.description}
                                            onChange={(e) => setUpdateData('description', e.target.value)}
                                            placeholder="Enter department description"
                                            rows={4}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingDepartment(null);
                                                resetUpdate();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={updating}>
                                            {updating ? 'Updating...' : 'Update Department'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}

                    {departments.links && departments.links.length > 1 && <Pagination links={departments.links} />}
                </div>
            </AppLayout>
        </>
    );
}

