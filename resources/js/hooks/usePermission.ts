import { usePage } from '@inertiajs/react';

export function usePermission() {
    const { auth } = usePage().props as any;

    const permissions: string[] =
        auth?.user?.permissions || [];

    const hasPermission = (permission: string) => {
        return permissions.includes(permission);
    };

    const hasAny = (list: string[]) => {
        return list.some(p => permissions.includes(p));
    };

    return {
        permissions,
        hasPermission,
        hasAny,
    };
}
