import { CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function StepLoanDetails({ form, setForm }: any) {
    const exceedsLimit = Number(form.loan_amount) > Number(form.max_amount)

    return (
        <>
            <CardTitle>Step 2: Loan Details</CardTitle>

            <div className="space-y-4">
                {/* Loan Amount */}
                <div>
                    <Label>Loan Amount (MMK)</Label>
                    <Input
                        type="number"
                        value={form.loan_amount}
                        onChange={(e) =>
                            setForm({ ...form, loan_amount: e.target.value })
                        }
                    />
                    {exceedsLimit && (
                        <p className="text-sm text-red-500 mt-1">
                            Loan amount exceeds credit limit
                        </p>
                    )}
                </div>

                {/* Tenure */}
                <div>
                    <Label>Tenure (Months)</Label>
                    <Input
                        type="number"
                        value={form.tenure}
                        onChange={(e) =>
                            setForm({ ...form, tenure: e.target.value })
                        }
                    />
                </div>

                {/* Start Date */}
                <div>
                    <Label>Start Date</Label>
                    <Input
                        type="date"
                        value={form.start_date || ''}
                        onChange={(e) =>
                            setForm({ ...form, start_date: e.target.value })
                        }
                    />
                </div>

                {/* Interest (readonly) */}
                <div>
                    <Label>Interest Rate (%)</Label>
                    <Input value={form.interest_rate} disabled />
                </div>

                {/* Info */}
                <Alert>
                    <AlertDescription>
                        Max allowed loan:{" "}
                        <strong>
                            {Number(form.max_amount).toLocaleString()} MMK
                        </strong>
                    </AlertDescription>
                </Alert>
            </div>
        </>
    )
}
