import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import StepCustomer from './StepCustomer';
import StepLoanDetails from './StepLoanDetails';
import StepSchedulePreview from './StepSchedulePreview';
import StepSubmit from './StepSubmit';

export default function LoanWizard() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        customer_id: '',
        credit_level_id: '',
        loan_amount: '',
        tenure: 12,
        interest_rate: '',
        max_amount: 0,
        start_date: '',
    });
    const { customers } = usePage().props as any;
    const canProceedStep2 = () => {
        if (!form.loan_amount || Number(form.loan_amount) <= 0) return false;
        if (Number(form.loan_amount) > Number(form.max_amount)) return false;
        if (!form.tenure || Number(form.tenure) <= 0) return false;
        return true;
    };

    return (
        <Card>
            <CardContent className="space-y-6 p-6">
                {step === 1 && <StepCustomer form={form} setForm={setForm} customers={customers} />}
                {step === 2 && <StepLoanDetails form={form} setForm={setForm} />}
                {step === 3 && <StepSchedulePreview form={form} />}
                {step === 4 && <StepSubmit form={form} />}

                <div className="flex justify-between pt-4">
                    <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)}>
                        Back
                    </Button>

                    <Button onClick={() => setStep(step + 1)} disabled={step === 2 && !canProceedStep2()}>
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
