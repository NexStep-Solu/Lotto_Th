import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';



export default function Dashboard({

}: any) {

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Dashboard" />


        </AppLayout>
    );
}
