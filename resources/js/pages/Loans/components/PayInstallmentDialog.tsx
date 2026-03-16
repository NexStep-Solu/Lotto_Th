import { useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState } from 'react'

export default function PayInstallmentDialog({ schedule }: any) {
    const [open, setOpen] = useState(false)

    const { data, setData, post, processing, errors } = useForm({
        amount: schedule.total_due - schedule.paid_amount,
        paid_date: new Date().toISOString().slice(0, 10),
    })

    const exceeds =
        Number(data.amount) >
        Number(schedule.total_due - schedule.paid_amount)

    function submit() {
        post(route('loans.repayments', schedule.id), {
            onSuccess: () => setOpen(false),
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Pay</Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Pay Installment #{schedule.installment_no}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Amount</Label>
                        <Input
                            type="number"
                            value={data.amount}
                            onChange={(e) =>
                                setData('amount', e.target.value)
                            }
                        />
                        {exceeds && (
                            <p className="text-sm text-red-500">
                                Amount exceeds remaining balance
                            </p>
                        )}
                        {errors.amount && (
                            <p className="text-sm text-red-500">
                                {errors.amount}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label>Payment Date</Label>
                        <Input
                            type="date"
                            value={data.paid_date}
                            onChange={(e) =>
                                setData('paid_date', e.target.value)
                            }
                        />
                    </div>

                    <Alert>
                        <AlertDescription>
                            Remaining:{' '}
                            <strong>
                                {(schedule.total_due -
                                    schedule.paid_amount).toLocaleString()}{' '}
                                MMK
                            </strong>
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button
                        disabled={processing || exceeds}
                        onClick={submit}
                    >
                        Confirm Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
