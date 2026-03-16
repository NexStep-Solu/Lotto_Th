import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoanScheduleTable({ schedules }: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Repayment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Principal</TableHead>
                            <TableHead>Interest</TableHead>
                            <TableHead>Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules?.map((s: any, i: number) => (
                            <TableRow key={s.id}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>{s.due_date}</TableCell>
                                <TableCell>{s.principal}</TableCell>
                                <TableCell>{s.interest}</TableCell>
                                <TableCell>{s.total}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
