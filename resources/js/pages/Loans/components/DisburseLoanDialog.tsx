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
import { toast } from 'sonner'

interface Props {
    loan: any
}

export default function DisburseLoanDialog({ loan }: Props) {
    const [open, setOpen] = useState(false)

    const { data, setData, post, processing, errors } = useForm({
        disbursed_amount: loan.principal_amount,
        disbursed_date: new Date().toISOString().slice(0, 10),
    })

    const exceedsAmount =
        Number(data.disbursed_amount) > Number(loan.principal_amount)

    function submit() {
        post(route('loans.disburse', loan.id), {
            onSuccess: () => setOpen(false),
            onError: (e) => { toast.error(e.amount); console.error(e) },
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Disburse Loan</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Disburse Loan</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Amount */}
                    <div>
                        <Label>Disbursement Amount</Label>
                        <Input
                            type="number"
                            value={data.disbursed_amount}
                            onChange={(e) =>
                                setData('disbursed_amount', e.target.value)
                            }
                        />
                        {exceedsAmount && (
                            <p className="text-sm text-red-500 mt-1">
                                Amount exceeds loan principal
                            </p>
                        )}
                        {errors.disbursed_amount && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.disbursed_amount}
                            </p>
                        )}
                    </div>

                    {/* Date */}
                    <div>
                        <Label>Disbursement Date</Label>
                        <Input
                            type="date"
                            value={data.disbursed_date}
                            onChange={(e) =>
                                setData('disbursed_date', e.target.value)
                            }
                        />
                        {errors.disbursed_date && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.disbursed_date}
                            </p>
                        )}
                    </div>

                    {/* Info */}
                    <Alert>
                        <AlertDescription>
                            Loan No:{' '}
                            <strong>{loan.loan_no}</strong>
                            <br />
                            Principal:{' '}
                            <strong>
                                {Number(
                                    loan.principal_amount
                                ).toLocaleString()}{' '}
                                MMK
                            </strong>
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={processing || exceedsAmount}
                    >
                        Confirm Disbursement
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
