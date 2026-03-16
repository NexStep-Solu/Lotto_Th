import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface branch {
    id: number;
    name: string;
    location_id?: number;
    location?: {
        id: number;
        name: string;
    };
}

interface Props {
    branches: {
        data: branch[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    locations: Array<any>;
}

export default function branchesIndex({ branches, locations }: Props) {
    const { hasPermission } = usePermission();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingbranches, setEditingbranches] = useState<branch | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'branches',
            href: '/branches',
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
        location_id: '',
    });

    const {
        data: updateData,
        setData: setUpdateData,
        put,
        processing: updating,
        reset: resetUpdate,
    } = useForm({
        name: '',
        location_id: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('branches.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Branch created successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error creating Branch', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingbranches) return;

        put(route('branches.update', editingbranches.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingbranches(null);
                resetUpdate();
                toast.success('Branch updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating Branch', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    const handleDelete = (branchId: number) => {
        if (confirm('Are you sure you want to delete this branch?')) {
            router.delete(route('branches.destroy', branchId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Branch deleted successfully', {
                        position: 'top-center',
                        duration: 3000,
                    });
                },
                onError: (errors) => {
                    const errorMessage = errors.error || 'Error deleting Branch';
                    toast.error(errorMessage, {
                        position: 'top-center',
                        duration: 3000,
                    });
                },
            });
        }
    };

    const openEditDialog = (branch: branch) => {
        setEditingbranches(branch);
        setUpdateData({
            name: branch.name,
            location_id: branch.location_id?.toString() || '',
        });
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Branches Management" />

                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="my-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Branches Management</h1>
                        {hasPermission('create_branches') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add branch
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create New branch</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">branch Name *</Label>
                                        <Input
                                            id="name"
                                            value={createData.name}
                                            onChange={(e) => setCreateData('name', e.target.value)}
                                            placeholder="Enter branch name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Location *</Label>

                                        <Select value={createData.location_id} onValueChange={(value) => setCreateData('location_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select location" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {locations.map((loc: any) => (
                                                    <SelectItem key={loc.id} value={loc.id.toString()}>
                                                        {loc.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                            {creating ? 'Creating...' : 'Create branch'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Branches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {branches.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-muted-foreground text-center">
                                                No branches found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        branches.data.map((branch) => (
                                            <TableRow key={branch.id}>
                                                <TableCell>{branch.id}</TableCell>
                                                <TableCell className="font-medium">{branch.name}</TableCell>
                                                <TableCell className="font-medium">{branch?.location?.name}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {hasPermission('update_branches') && (
                                                            <Button variant="outline" size="icon" onClick={() => openEditDialog(branch)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {hasPermission('delete_branches') && (
                                                            <Button variant="outline" size="icon" onClick={() => handleDelete(branch.id)}>
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

                    {editingbranches && (
                        <Dialog open={!!editingbranches} onOpenChange={(open) => !open && setEditingbranches(null)}>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Edit branch</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-name">branch Name *</Label>
                                        <Input
                                            id="edit-name"
                                            value={updateData.name}
                                            onChange={(e) => setUpdateData('name', e.target.value)}
                                            placeholder="Enter branch name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Location *</Label>

                                        <Select value={updateData.location_id} onValueChange={(value) => setUpdateData('location_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select location" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {locations.map((loc: any) => (
                                                    <SelectItem key={loc.id} value={loc.id.toString()}>
                                                        {loc.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingbranches(null);
                                                resetUpdate();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={updating}>
                                            {updating ? 'Updating...' : 'Update branch'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}

                    {branches.links && branches.links.length > 1 && <Pagination links={branches.links} />}
                </div>
            </AppLayout>
        </>
    );
}
