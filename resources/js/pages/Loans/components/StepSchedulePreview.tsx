import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

export default function StepSchedule({ form }: any) {
    const [schedule, setSchedule] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!form.loan_amount || !form.start_date || !form.tenure) return

        setLoading(true)
        axios
            .post(route('loans.preview'), {
                loan_amount: form.loan_amount,
                interest_rate: form.interest_rate,
                tenure: form.tenure,
                start_date: form.start_date,
            })
            .then((res) => setSchedule(res.data))
            .finally(() => setLoading(false))
    }, [form.loan_amount, form.tenure, form.start_date, form.interest_rate])

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Step 3: Repayment Schedule Preview</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-center py-4">Generating schedule...</p>
                ) : (
                    <ScrollArea className="max-h-[400px] border rounded-md">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-muted sticky top-0 z-10">
                                <tr>
                                    <th className="px-3 py-2 text-left border-b">#</th>
                                    <th className="px-3 py-2 text-left border-b">Due Date</th>
                                    <th className="px-3 py-2 text-right border-b">Principal</th>
                                    <th className="px-3 py-2 text-right border-b">Interest</th>
                                    <th className="px-3 py-2 text-right border-b">EMI</th>
                                    <th className="px-3 py-2 text-right border-b">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-muted-foreground">
                                            No schedule to display
                                        </td>
                                    </tr>
                                ) : (
                                    schedule.map((row) => (
                                        <tr
                                            key={row.installment}
                                            className=" even:bg-muted/50 hover:bg-muted/70 transition-colors"
                                        >
                                            <td className="px-3 py-2">{row.installment}</td>
                                            <td className="px-3 py-2">{row.due_date}</td>
                                            <td className="px-3 py-2 text-right">
                                                {row.principal.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {row.interest.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium">
                                                {row.emi.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {row.balance.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </ScrollArea>
                )}

                {/* Optional summary */}
                {schedule.length > 0 && (
                    <div className="mt-3 flex justify-end gap-4">
                        <Badge variant="secondary">
                            Total Principal: {schedule.reduce((sum, r) => sum + r.principal, 0).toLocaleString()}
                        </Badge>
                        <Badge variant="secondary">
                            Total Interest: {schedule.reduce((sum, r) => sum + r.interest, 0).toLocaleString()}
                        </Badge>
                        <Badge variant="secondary">
                            Total Payable: {schedule.reduce((sum, r) => sum + r.emi, 0).toLocaleString()}
                        </Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
