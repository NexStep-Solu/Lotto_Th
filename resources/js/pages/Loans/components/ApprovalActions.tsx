import { router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ApprovalActions({ loan }: any) {
    const approve = () => {
        router.post(route('loans.approve', loan.id), {}, {
            onSuccess: () => toast.success('Loan approved'),
        })
    }

    const reject = () => {
        router.post(route('loans.reject', loan.id), {}, {
            onSuccess: () => toast.success('Loan rejected'),
        })
    }

    return (
        <Card>
            <CardContent className="flex justify-end gap-3 p-4">
                <Button variant="destructive" onClick={reject}>
                    Reject
                </Button>
                <Button onClick={approve}>
                    Approve
                </Button>
            </CardContent>
        </Card>
    )
}
