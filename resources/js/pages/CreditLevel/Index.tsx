import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CreditLimit {
    id: number;
    name: string;
    description: string | null;
    min_amount: number;
    max_amount: number;
    max_term: number | null;
    interest_rate: number | null;
    is_default: boolean;
}

interface Props {
    creditlevel: {
        data: CreditLimit[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function CreditLevelsIndex({ creditlevel }: Props) {
    const { hasPermission } = usePermission();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCreditLimit, setEditingCreditLimit] = useState<CreditLimit | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Credit Limits',
            href: '/creditlevels',
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

        min_amount: '',
        max_amount: '',
        max_term: '',
        interest_rate: '',
        is_default: false,
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

        min_amount: '',
        max_amount: '',
        max_term: '',
        interest_rate: '',
        is_default: false,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('creditlevels.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('CreditLimit created successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error creating CreditLimit', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCreditLimit) return;

        put(route('creditlevels.update', editingCreditLimit.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCreditLimit(null);
                resetUpdate();
                toast.success('CreditLimit updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating CreditLimit', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    const handleDelete = (creditlimitId: number) => {
        if (confirm('Are you sure you want to delete this limit?')) {
            router.delete(route('creditlevels.destroy', creditlimitId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Credit Limit deleted successfully', {
                        position: 'top-center',
                        duration: 3000,
                    });
                },
                onError: (errors) => {
                    const errorMessage = errors.error || 'Error deleting Credit Limit';
                    toast.error(errorMessage, {
                        position: 'top-center',
                        duration: 3000,
                    });
                },
            });
        }
    };

    const openEditDialog = (creditlimit: CreditLimit) => {
        setEditingCreditLimit(creditlimit);

        setUpdateData({
            name: creditlimit.name || '',
            description: creditlimit.description || '',

            min_amount: creditlimit.min_amount,
            max_amount: creditlimit.max_amount,
            max_term: creditlimit.max_term || '',
            interest_rate: creditlimit.interest_rate || '',
            is_default: creditlimit.is_default,
        });
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Credit Limits Management" />

                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="my-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Credit Limits Level Management</h1>
                        {hasPermission('create_creditlevels') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Limit
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create New Credit Limit</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Level Name *</Label>
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Min Amount *</Label>
                                            <Input
                                                type="number"
                                                value={createData.min_amount}
                                                onChange={(e) => setCreateData('min_amount', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Max Amount *</Label>
                                            <Input
                                                type="number"
                                                value={createData.max_amount}
                                                onChange={(e) => setCreateData('max_amount', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Max Term</Label>
                                            <Input
                                                type="number"
                                                value={createData.max_term}
                                                onChange={(e) => setCreateData('max_term', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Interest Rate (%)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={createData.interest_rate}
                                                onChange={(e) => setCreateData('interest_rate', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={createData.is_default}
                                            onChange={(e) => setCreateData('is_default', e.target.checked)}
                                        />
                                        <Label>Default Credit Level</Label>
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
                            <CardTitle>Credit Limits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Min</TableHead>
                                        <TableHead>Max</TableHead>
                                        <TableHead>Interest</TableHead>
                                        <TableHead>Default</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {creditlevel?.data?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-muted-foreground text-center">
                                                No Limits found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        creditlevel?.data?.map((creditlimit) => (
                                            <TableRow key={creditlimit.id}>
                                                <TableCell>{creditlimit.id}</TableCell>
                                                <TableCell className="font-medium">{creditlimit.name}</TableCell>
                                                <TableCell>
                                                    <span className="text-muted-foreground text-sm">
                                                        {creditlimit.description || 'No description'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{creditlimit.min_amount}</TableCell>
                                                <TableCell>{creditlimit.max_amount}</TableCell>
                                                <TableCell>{creditlimit.interest_rate}%</TableCell>
                                                <TableCell>{creditlimit.is_default ? 'Yes' : 'No'}</TableCell>

                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {hasPermission('update_creditlevels') && (
                                                            <Button variant="outline" size="icon" onClick={() => openEditDialog(creditlimit)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {hasPermission('delete_creditlevels') && (
                                                            <Button variant="outline" size="icon" onClick={() => handleDelete(creditlimit.id)}>
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

                    {editingCreditLimit && (
                        <Dialog open={!!editingCreditLimit} onOpenChange={(open) => !open && setEditingCreditLimit(null)}>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Edit Limit</DialogTitle>
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Min Amount *</Label>
                                            <Input
                                                type="number"
                                                value={updateData.min_amount}
                                                onChange={(e) => setUpdateData('min_amount', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Max Amount *</Label>
                                            <Input
                                                type="number"
                                                value={updateData.max_amount}
                                                onChange={(e) => setUpdateData('max_amount', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Max Term</Label>
                                            <Input
                                                type="number"
                                                value={updateData.max_term}
                                                onChange={(e) => setUpdateData('max_term', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Interest Rate (%)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={updateData.interest_rate}
                                                onChange={(e) => setUpdateData('interest_rate', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={updateData.is_default}
                                            onChange={(e) => setUpdateData('is_default', e.target.checked)}
                                        />
                                        <Label>Default Credit Level</Label>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingCreditLimit(null);
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

                    {creditlevel?.links && creditlevel?.links.length > 1 && <Pagination links={creditlevel?.links} />}
                </div>
            </AppLayout>
        </>
    );
}
