import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CollectRepaymentDialog({ schedule, loan, onClose }: any) {
    const [amount, setAmount] = useState('')
    const penalty = schedule.penalty || 0

    const submit = () => {
        router.post(route('repayments.store'), {
            loan_id: loan.id,
            schedule_id: schedule.id,
            amount,
        }, {
            onSuccess: () => {
                toast.success('Repayment recorded')
                onClose()
            },
        })
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Collect Repayment</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p>Total Due: <strong>{schedule.total}</strong></p>
                    <p>Penalty: <strong>{penalty}</strong></p>

                    <div>
                        <Label>Payment Amount</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <Button className="w-full" onClick={submit}>
                        Save Payment
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
