import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RepaymentSummary({ loan }: any) {
    const totalPaid = loan.schedules.reduce(
        (sum: number, s: any) => sum + Number(s.paid_amount),
        0
    )

    const totalDue = loan.schedules.reduce(
        (sum: number, s: any) => sum + Number(s.total_due),
        0
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle>Repayment Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">Total Due</p>
                    <p className="font-semibold">
                        {totalDue.toLocaleString()} MMK
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground">Total Paid</p>
                    <p className="font-semibold text-green-600">
                        {totalPaid.toLocaleString()} MMK
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground">Outstanding</p>
                    <p className="font-semibold text-red-600">
                        {(totalDue - totalPaid).toLocaleString()} MMK
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-semibold capitalize">
                        {loan.status}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
