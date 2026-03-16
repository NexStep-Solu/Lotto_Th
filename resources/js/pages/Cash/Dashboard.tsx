import { Pagination } from '@/components/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import { ArrowDownToLine, ArrowUpFromLine, Wallet } from 'lucide-react';
import CreateIncomeFlow from './components/CreateIncomeFlow';
import { Dialog, DialogDescription, DialogTitle, DialogHeader, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CreateOutcomeFlow from './components/CreateOutcomeFlow';

export default function CashDashboard() {
    const { ledgers, canViewAllBranches = false, branches, filters, totals } = usePage().props as any;

    function updateFilter(key: string, value: string | null) {
        const next = { ...filters, [key]: value ?? undefined };
        if (key === 'branch_id' && value === ' ') next.branch_id = undefined;
        router.get(route('cash.dashboard'), next, { preserveState: true });
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Loan Cash Dashboard', href: '/cash-dashboard' },
    ];

    const inflow = Number(totals?.inflow ?? 0);
    const outflow = Number(totals?.outflow ?? 0);
    const balance = Number(totals?.balance ?? 0);
    const hasLedgers = ledgers?.data?.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loan Cash Dashboard" />
            <div className="space-y-6 p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Loan Cash Dashboard</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Cash ledger by branch — inflows, outflows, and balance.</p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <Card className="border-emerald-200/50 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Total Inflow</CardTitle>
                            <ArrowDownToLine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{inflow.toLocaleString()} MMK</p>
                        </CardContent>
                    </Card>
                    <Card className="border-rose-200/50 bg-rose-50/30 dark:border-rose-900/30 dark:bg-rose-950/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-rose-800 dark:text-rose-200">Total Outflow</CardTitle>
                            <ArrowUpFromLine className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{outflow.toLocaleString()} MMK</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                                {balance.toLocaleString()} MMK
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">CashBook Adjustment</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className='justify-between flex gap-2'>
                            <Dialog>
                                <DialogTrigger > <Button variant="outline">Inflow</Button></DialogTrigger>
                                <DialogContent >
                                    <CreateIncomeFlow branches={branches} />
                                </DialogContent>
                            </Dialog>
                            <Dialog>
                                <DialogTrigger > <Button variant="outline">OutFlow</Button></DialogTrigger>
                                <DialogContent >
                                    <CreateOutcomeFlow branches={branches} />
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>


                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Filters</CardTitle>
                        <p className="text-xs text-muted-foreground">Narrow by branch, type, and date range.</p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {canViewAllBranches ? (
                            <div className="space-y-2">
                                <Label>Branch</Label>
                                <Select value={filters.branch_id ?? ' '} onValueChange={(v) => updateFilter('branch_id', v === ' ' ? null : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Branches" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=" ">All Branches</SelectItem>
                                        {branches?.map((b: { id: number; name: string }) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Branch</Label>
                                <p className="text-sm font-medium">{branches?.find((b: { id: number }) => String(b.id) === filters.branch_id)?.name ?? '—'}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={filters.type ?? ' '} onValueChange={(v) => updateFilter('type', v === ' ' ? null : v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=" ">All</SelectItem>
                                    <SelectItem value="inflow">Inflow</SelectItem>
                                    <SelectItem value="outflow">Outflow</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>From date</Label>
                            <Input
                                type="date"
                                value={filters.from_date ?? ''}
                                onChange={(e) => updateFilter('from_date', e.target.value || null)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>To date</Label>
                            <Input
                                type="date"
                                value={filters.to_date ?? ''}
                                onChange={(e) => updateFilter('to_date', e.target.value || null)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Ledger table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Cash Ledger</CardTitle>
                        <p className="text-xs text-muted-foreground">Transaction history for the selected filters.</p>
                    </CardHeader>
                    <CardContent>
                        {hasLedgers ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Amount (MMK)</TableHead>
                                            <TableHead className="max-w-[200px]">Description</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ledgers.data.map((row: { id: number; transaction_date: string; type: string; amount: number; description: string | null; branch: { name: string } }) => (
                                            <TableRow key={row.id}>
                                                <TableCell className="whitespace-nowrap">{dayjs(row.transaction_date).format('DD/MM/YYYY')}</TableCell>
                                                <TableCell>{row.branch?.name ?? '—'}</TableCell>
                                                <TableCell>
                                                    <span className={row.type === 'inflow' ? 'font-medium text-emerald-600 dark:text-emerald-400' : 'font-medium text-rose-600 dark:text-rose-400'}>
                                                        {row.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">{Number(row.amount).toLocaleString()}</TableCell>
                                                <TableCell className="max-w-[200px] truncate text-muted-foreground">{row.description ?? '—'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {ledgers.links && ledgers.links.length > 1 && <Pagination links={ledgers.links} />}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                                <Wallet className="h-10 w-10 opacity-50" />
                                <p className="mt-2 text-sm font-medium">No transactions found</p>
                                <p className="mt-1 text-xs">Try adjusting filters or add ledger entries.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
