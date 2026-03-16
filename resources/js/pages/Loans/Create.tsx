import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import LoanWizard from './components/LoanWizard';

export default function Create({ customers }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Loans',
            href: '/loans',
        },
        {
            title: 'Loans Create',
            href: '/loans/create',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Loan" />

            <div className="space-y-4 p-4">
                <h1 className="text-2xl font-bold">New Loan Application</h1>
                <LoanWizard customer={customers} />
            </div>
        </AppLayout>
    );
}
