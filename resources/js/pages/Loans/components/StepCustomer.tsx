import { CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Props {
    form: any
    setForm: Function
    customers: any[]
}

export default function StepCustomer({ form, setForm, customers }: Props) {
    const selectedCustomer = customers.find(
        (c) => c.id === Number(form.customer_id)
    )

    return (
        <>
            <CardTitle>Step 1: Customer</CardTitle>

            <div className="space-y-4">
                {/* Customer Select */}
                <div>
                    <Label>Customer</Label>
                    <Select
                        value={form.customer_id}
                        onValueChange={(value) => {
                            const customer = customers.find(
                                (c) => c.id === Number(value)
                            )

                            setForm({
                                ...form,
                                customer_id: value,
                                credit_level_id: customer?.credit_level.id,
                                interest_rate: customer?.credit_level.interest_rate,
                                max_amount: customer?.credit_level.max_amount,
                            })
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map((customer) => (
                                <SelectItem
                                    key={customer.id}
                                    value={String(customer.id)}
                                >
                                    {customer.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Credit Info */}
                {selectedCustomer && (
                    <div className="rounded-md bg-muted p-4 text-sm space-y-1">
                        <p>
                            <strong>Credit Level:</strong>{' '}
                            {selectedCustomer.credit_level.name}
                        </p>
                        <p>
                            <strong>Max Loan:</strong>{' '}
                            {selectedCustomer.credit_level.max_amount.toLocaleString()} MMK
                        </p>
                        <p>
                            <strong>Interest Rate:</strong>{' '}
                            {selectedCustomer.credit_level.interest_rate}%
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}
