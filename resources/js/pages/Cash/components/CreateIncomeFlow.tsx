import { useForm } from '@inertiajs/react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Props {
    branches: { id: number; name: string }[]
}

export default function CreateIncomeFlow({ branches }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        branch_id: '',
        amount: '',
        transaction_date: new Date().toISOString().slice(0, 10),
        description: '',
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('cash-ledgers.income.store'), {
            onSuccess: () => {
                toast.success('Income recorded successfully')
                reset()
            },
            onError: () => {
                toast.error('Failed to record income')
            },
        })
    }

    return (
        <Card className="max-w-xl m-4">
            <CardHeader>
                <CardTitle>Create Branch InFlow</CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={submit} className="space-y-4">

                    {/* Branch */}
                    <div className="space-y-1">
                        <Label>Branch</Label>
                        <Select
                            value={data.branch_id}
                            onValueChange={(v) => setData('branch_id', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((b) => (
                                    <SelectItem key={b.id} value={String(b.id)}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.branch_id && <p className="text-sm text-red-500">{errors.branch_id}</p>}
                    </div>

                    {/* Amount */}
                    <div className="space-y-1">
                        <Label>Amount (MMK)</Label>
                        <Input
                            type="number"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                        />
                        {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                    </div>
                    {/* Date */}
                    <div className="space-y-1">
                        <Label>Transaction Date</Label>
                        <Input
                            type="date"
                            value={data.transaction_date}
                            onChange={(e) => setData('transaction_date', e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <Label>Description</Label>
                        <Textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Income'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
