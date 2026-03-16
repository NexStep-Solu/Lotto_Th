import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function LoanSummary({ loan }: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Loan Summary
                    <Badge>{loan.status.toUpperCase()}</Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Customer:</strong> {loan?.customer?.name}</div>
                <div><strong>Loan Amount:</strong> {loan.amount}</div>
                <div><strong>Tenure:</strong> {loan.tenure} months</div>
                <div><strong>Interest:</strong> {loan.interest_rate}%</div>
                <div><strong>Start Date:</strong> {loan.start_date}</div>
                <div><strong>Frequency:</strong> Monthly</div>
            </CardContent>
        </Card>
    )
}
