import { Badge } from "@/components/ui/badge";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableRow, TableHeader, TableHead, TableBody, TableCell } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Dashboard({
    employees,
    chart,
}: any) {
    const totalPayroll = employees.reduce((s, e) => s + e.total, 0)
    const totalBonus = employees.reduce((s, e) => s + e.bonus, 0)

    const topPerformer = employees[0]
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'User Dashboard',
            href: '/employee-dashboard',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="space-y-8 p-8 bg-background">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Employee Performance
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Monthly salary, bonus and loan contribution overview
                        </p>
                    </div>
                </div>

                {/* Top strip: KPIs + compact Top Performer */}
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* KPIs */}
                    <Card className="border bg-card col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Payroll
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                All employees this month
                            </p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {totalPayroll.toLocaleString()}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                    MMK
                                </span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border bg-card col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Bonus
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Performance incentives
                            </p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-emerald-600">
                                {totalBonus.toLocaleString()}
                                <span className="ml-1 text-xs font-normal text-emerald-500">
                                    MMK
                                </span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border bg-card col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Officers
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Current staff count
                            </p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {employees.length}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Compact Top Performer */}
                    <Card className="border bg-card col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between gap-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Top performer
                                </CardTitle>
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-100">
                                    🏅 This month
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="space-y-0.5 min-w-0">
                                    <p className="text-xs text-muted-foreground">Officer</p>
                                    <p className="truncate text-sm font-semibold">
                                        {topPerformer?.name ?? '-'}
                                    </p>
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-200 bg-amber-50">
                                    <span className="text-[10px] font-semibold text-amber-700">
                                        GOLD
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    Loan volume (MMK)
                                </p>
                                <div className="flex items-baseline justify-between gap-2">
                                    <p className="text-lg font-semibold">
                                        {topPerformer
                                            ? Number(topPerformer.loan_volume).toLocaleString()
                                            : '-'}
                                    </p>
                                    <div className="flex gap-1">
                                        <span className="h-4 w-1.5 rounded-full bg-emerald-200" />
                                        <span className="h-5 w-1.5 rounded-full bg-emerald-400" />
                                        <span className="h-3 w-1.5 rounded-full bg-emerald-300" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Full-width chart */}
                <Card className="border bg-card">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-medium">
                                    Monthly Loan Volume per Officer
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Compare individual performance at a glance
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[320px] pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chart}>
                                <XAxis dataKey="name" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip />
                                <Bar
                                    dataKey="loan_volume"
                                    fill="hsl(var(--primary))"
                                    radius={[3, 3, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Earnings table */}
                <Card className="border bg-card">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">
                            Monthly employee earnings
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            Detailed breakdown by officer and department
                        </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40">
                                        <TableHead className="w-10 text-xs">#</TableHead>
                                        <TableHead className="text-xs">Name</TableHead>
                                        <TableHead className="text-xs">Department</TableHead>
                                        <TableHead className="text-right text-xs">Salary</TableHead>
                                        <TableHead className="text-right text-xs">Bonus</TableHead>
                                        <TableHead className="text-right text-xs">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.map((e, i) => (
                                        <TableRow
                                            key={e.id}
                                            className="hover:bg-muted/30 transition-colors"
                                        >
                                            <TableCell className="font-mono text-xs">
                                                {i + 1}
                                            </TableCell>
                                            <TableCell className="flex items-center gap-2 text-sm">
                                                <span className="font-medium">{e.name}</span>
                                                {e.rank && (
                                                    <Badge
                                                        className={`text-[10px] px-2 py-0.5 ${e.rank === 'gold'
                                                            ? 'bg-yellow-400 text-black'
                                                            : e.rank === 'silver'
                                                                ? 'bg-gray-200 text-gray-800'
                                                                : 'bg-orange-400 text-black'
                                                            }`}
                                                    >
                                                        {e.rank.toUpperCase()}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {e.department}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm">
                                                {Number(e.salary).toLocaleString()} MMK
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm text-emerald-600">
                                                +{Number(e.bonus).toLocaleString()} MMK
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm font-semibold">
                                                {Number(e.total).toLocaleString()} MMK
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}

