import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function DisbursementActions({ loan }: any) {
    const [date, setDate] = useState('')
    const [method, setMethod] = useState('cash')

    const disburse = () => {
        router.post(route('loans.disburse', loan.id), {
            disbursed_at: date,
            payment_method: method,
        }, {
            onSuccess: () => toast.success('Loan disbursed successfully'),
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Loan Disbursement</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Customer:</strong> {loan.customer.name}</div>
                    <div><strong>Amount:</strong> {loan.amount}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Disbursement Date</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Payment Method</Label>
                        <Select value={method} onValueChange={setMethod}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank">Bank Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={disburse}>
                        Disburse Loan
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
