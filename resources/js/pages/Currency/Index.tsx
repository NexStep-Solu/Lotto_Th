import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
    rate: number;
}

interface Props {
    currencies: {
        data: Currency[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
}

export default function CurrencyIndex({ currencies }: Props) {
    const { hasPermission } = usePermission();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Currency | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Currencies', href: '/currencies' }];

    const {
        data: createData,
        setData: setCreateData,
        post,
        processing: creating,
        reset: resetCreate,
    } = useForm({
        name: '',
        code: '',
        symbol: '',
        rate: 1,
    });

    const {
        data: updateData,
        setData: setUpdateData,
        put,
        processing: updating,
        reset: resetUpdate,
    } = useForm({
        name: '',
        code: '',
        symbol: '',
        rate: 1,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('currencies.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Currency created successfully');
            },
            onError: () => toast.error('Error creating currency'),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        put(route('currencies.update', editing.id), {
            onSuccess: () => {
                setEditing(null);
                resetUpdate();
                toast.success('Currency updated successfully');
            },
            onError: () => toast.error('Error updating currency'),
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this currency?')) return;

        router.delete(route('currencies.destroy', id), {
            onSuccess: () => toast.success('Currency deleted'),
            onError: () => toast.error('Delete failed'),
        });
    };

    const openEdit = (c: Currency) => {
        setEditing(c);
        setUpdateData({
            name: c.name,
            code: c.code,
            symbol: c.symbol,
            rate: c.rate,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Currencies" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex justify-between">
                    <h1 className="text-2xl font-bold">Currencies</h1>

                    {hasPermission('create_currencies') && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Currency
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Currency</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input value={createData.name} onChange={(e) => setCreateData('name', e.target.value)} />
                                </div>

                                <div>
                                    <Label>Code</Label>
                                    <Input value={createData.code} onChange={(e) => setCreateData('code', e.target.value)} />
                                </div>

                                <div>
                                    <Label>Symbol</Label>
                                    <Input value={createData.symbol} onChange={(e) => setCreateData('symbol', e.target.value)} />
                                </div>

                                <div>
                                    <Label>Rate</Label>
                                    <Input
                                        type="number"
                                        value={createData.rate}
                                        onChange={(e) => setCreateData('rate', parseFloat(e.target.value))}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                                        Cancel
                                    </Button>

                                    <Button disabled={creating}>Create</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Currency List</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Symbol</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {currencies.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell>{c.name}</TableCell>
                                        <TableCell>{c.code}</TableCell>
                                        <TableCell>{c.symbol}</TableCell>
                                        <TableCell>
                                            <Badge>{c.rate}</Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            {hasPermission('update_currencies') && (
                                                <Button size="icon" variant="outline" onClick={() => openEdit(c)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {hasPermission('delete_currencies') && (
                                                <Button size="icon" variant="outline" onClick={() => handleDelete(c.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            {editing && (
                <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Currency</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <Input value={updateData.name} onChange={(e) => setUpdateData('name', e.target.value)} />

                            <Input value={updateData.code} onChange={(e) => setUpdateData('code', e.target.value)} />

                            <Input value={updateData.symbol} onChange={(e) => setUpdateData('symbol', e.target.value)} />

                            <Input type="number" value={updateData.rate} onChange={(e) => setUpdateData('rate', parseFloat(e.target.value))} />

                            <Button disabled={updating}>Update</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}
