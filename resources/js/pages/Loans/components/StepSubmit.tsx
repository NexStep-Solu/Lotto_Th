import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';

export default function StepSubmit({ form }: { form: any }) {
    return (
        <>
            <CardTitle>Step 4: Submit</CardTitle>

            <div className="space-y-4">
                <p className="text-muted-foreground">Review loan details carefully before submission.</p>

                <Button className="w-full" onClick={() => router.post(route('loans.store'), form)}>
                    Submit Loan Application
                </Button>
            </div>
        </>
    );
}
