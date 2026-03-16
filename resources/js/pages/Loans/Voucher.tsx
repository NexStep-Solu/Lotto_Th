import { Button } from "@/components/ui/button"
import { Head } from "@inertiajs/react"

export default function Voucher({ loan }: any) {

    return (
        <div className="max-w-3xl mx-auto p-8  print:p-0 print:pt-10 print:text-black">
            <Head title="Loan Disbursement Voucher" />
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Unity Microfinance Ltd.</h1>
                <p className="text-sm text-muted-foreground">Loan Disbursement Voucher</p>
            </div>

            {/* Loan Info */}
            <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded mb-6">

                <div>
                    <p className="text-muted-foreground ">Loan No</p>
                    <p className="font-medium">{(loan.loan_no).toLocaleString()}</p>
                </div>

                <div>
                    <p className="text-muted-foreground text-right">Customer</p>
                    <p className="font-medium text-right">{loan.customer.name}</p>
                </div>

                <div>
                    <p className="text-muted-foreground">Principal</p>
                    <p>{Number(loan.principal_amount).toLocaleString()} MMK</p>
                </div>

                <div>
                    <p className="text-muted-foreground text-right">Interest</p>
                    <p className="text-right">{loan.interest_rate}%</p>
                </div>

                <div>
                    <p className="text-muted-foreground">Term</p>
                    <p>{loan.term} months</p>
                </div>

                <div>
                    <p className="text-muted-foreground text-right">Start Date</p>
                    <p className="text-right">{loan.start_date}</p>
                </div>
            </div>

            {/* Schedule Summary */}
            <table className="w-full text-sm border mb-6">
                <thead>
                    <tr className="border-b">
                        <th className="p-2 text-left">No</th>
                        <th className="p-2">Due Date</th>
                        <th className="p-2 text-right">Amount</th>
                    </tr>
                </thead>

                <tbody>
                    {loan.schedules.map((s: any) => (
                        <tr key={s.id} className="border-b">
                            <td className="p-2">{s.installment_no}</td>
                            <td className="p-2 text-center">{s.due_date}</td>
                            <td className="p-2 text-right">{Number(s.total_due).toLocaleString()} MMK</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Signature */}
            <div className="grid grid-cols-2 mt-10 text-sm">
                <div>
                    ___________________________<br />
                    Customer Signature
                </div>

                <div className="text-right">
                    ___________________________<br />
                    Officer Signature
                </div>
            </div>

            {/* Print Button */}
            <div className="mt-6 text-center print:hidden">
                <Button onClick={() => window.print()}>
                    Print Voucher
                </Button>
            </div>

        </div>
    )
}
