import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CollectRepaymentDialog from './CollectRepaymentDialog'
import { useState } from 'react'

export default function RepaymentTable({ schedules, loan }: any) {
    const [selected, setSelected] = useState<any>(null)

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schedules.map((s: any, i: number) => (
                        <TableRow key={s.id}>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell>{s.due_date}</TableCell>
                            <TableCell>{s.total}</TableCell>
                            <TableCell>{s.paid_amount}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        s.status === 'paid'
                                            ? 'success'
                                            : s.is_overdue
                                            ? 'destructive'
                                            : 'secondary'
                                    }
                                >
                                    {s.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {s.status !== 'paid' && (
                                    <Button
                                        size="sm"
                                        onClick={() => setSelected(s)}
                                    >
                                        Collect
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {selected && (
                <CollectRepaymentDialog
                    schedule={selected}
                    loan={loan}
                    onClose={() => setSelected(null)}
                />
            )}
        </>
    )
}
