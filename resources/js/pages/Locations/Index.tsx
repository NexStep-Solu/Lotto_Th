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

interface Location {
    id: number;
    name: string;
    description: string | null;
}

interface Props {
    locations: {
        data: Location[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function locationsIndex({ locations }: Props) {
    const { hasPermission } = usePermission();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingLocations, setEditingLocations] = useState<Location | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'locations',
            href: '/locations',
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
        post(route('locations.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
                toast.success('Location created successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error creating location', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLocations) return;

        put(route('locations.update', editingLocations.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingLocations(null);
                resetUpdate();
                toast.success('Location updated successfully', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
            onError: () => {
                toast.error('Error updating Location', {
                    position: 'top-center',
                    duration: 3000,
                });
            },
        });
    };

    const handleDelete = (locationId: number) => {
        if (confirm('Are you sure you want to delete this Location?')) {
            router.delete(route('locations.destroy', locationId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Location deleted successfully', {
                        position: 'top-center',
                        duration: 3000,
                    });
                },
                onError: (errors) => {
                    const errorMessage = errors.error || 'Error deleting Location';
                    toast.error(errorMessage, {
                        position: 'top-center',
                        duration: 3000,
                    });
                },
            });
        }
    };

    const openEditDialog = (Location: Location) => {
        setEditingLocations(Location);
        setUpdateData({
            name: Location.name,
            description: Location.description || '',
        });
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Locations Management" />

                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="my-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Locations Management</h1>
                        {hasPermission('create_locations') && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Location
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create New Location</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Location Name *</Label>
                                        <Input
                                            id="name"
                                            value={createData.name}
                                            onChange={(e) => setCreateData('name', e.target.value)}
                                            placeholder="Enter Location name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={createData.description}
                                            onChange={(e) => setCreateData('description', e.target.value)}
                                            placeholder="Enter Location description"
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
                                            {creating ? 'Creating...' : 'Create Location'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>locations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locations.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-muted-foreground text-center">
                                                No locations found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        locations.data.map((Location) => (
                                            <TableRow key={Location.id}>
                                                <TableCell>{Location.id}</TableCell>
                                                <TableCell className="font-medium">{Location.name}</TableCell>
                                                <TableCell>
                                                    <span className="text-muted-foreground text-sm">{Location.description || 'No description'}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {hasPermission('update_locations') && (
                                                            <Button variant="outline" size="icon" onClick={() => openEditDialog(Location)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {hasPermission('delete_locations') && (
                                                            <Button variant="outline" size="icon" onClick={() => handleDelete(Location.id)}>
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

                    {editingLocations && (
                        <Dialog open={!!editingLocations} onOpenChange={(open) => !open && setEditingLocations(null)}>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Edit Location</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-name">Location Name *</Label>
                                        <Input
                                            id="edit-name"
                                            value={updateData.name}
                                            onChange={(e) => setUpdateData('name', e.target.value)}
                                            placeholder="Enter Location name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-description">Description</Label>
                                        <Textarea
                                            id="edit-description"
                                            value={updateData.description}
                                            onChange={(e) => setUpdateData('description', e.target.value)}
                                            placeholder="Enter Location description"
                                            rows={4}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingLocations(null);
                                                resetUpdate();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={updating}>
                                            {updating ? 'Updating...' : 'Update Location'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}

                    {locations.links && locations.links.length > 1 && <Pagination links={locations.links} />}
                </div>
            </AppLayout>
        </>
    );
}
