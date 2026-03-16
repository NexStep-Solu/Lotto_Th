import { usePermission } from '@/hooks/usePermission';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CableIcon, Coins, CoinsIcon, CreditCard, Key, LayoutGrid, LocateIcon, Settings, Shield, StoreIcon, User, User2, UserCircle, Users } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage();
    const user = page.props.auth.user;
    const { hasPermission, hasAny } = usePermission();
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    const adminNavItems: NavItem[] = [
        { title: 'Users', href: '/users', icon: Users, permission: 'view_users' },
        { title: 'Roles', href: '/roles', icon: Shield, permission: 'view_roles' },
        { title: 'Permissions', href: '/permissions', icon: Key, permission: 'view_permissions' },
    ].filter((item) => hasPermission((item as NavItem & { permission: string }).permission)) as NavItem[];

    // const customerNavItems: NavItem[] = [
    //     { title: 'Customers', href: '/customers', icon: UserCircle, permission: 'view_customers' },
    // ].filter((item) => hasPermission((item as NavItem & { permission: string }).permission)) as NavItem[];

    const masterNavItems: NavItem[] = [
        { title: 'Currency', href: '/currencies', icon: Coins, permission: 'view_currencies' },
        { title: 'Departments', href: '/departments', icon: CableIcon, permission: 'view_departments' },
        { title: 'Locations', href: '/locations', icon: LocateIcon, permission: 'view_locations' },
        { title: 'Branches', href: '/branches', icon: StoreIcon, permission: 'view_branches' },
    ].filter((item) => hasPermission((item as NavItem & { permission: string }).permission)) as NavItem[];

    const footerNavItems: NavItem[] = [];

    const navGroups: NavGroup[] = [];

    const hasMasterPermission = hasAny(['view_currencies', 'view_departments', 'view_locations', 'view_branches']);
    const hasCustomerPermission = hasAny(['view_creditlevels', 'view_customers', 'view_loans']);
    const hasAdminPermission = hasAny(['view_users', 'view_roles', 'view_permissions']);

    if (hasMasterPermission) {
        if (masterNavItems.length > 0) {
            navGroups.push({
                title: 'Master Setup',
                items: masterNavItems,
                icon: Settings,
            });
        }
    }
    // if (hasCustomerPermission) {
    //     if (customerNavItems.length > 0) {
    //         navGroups.push({
    //             title: 'Customers Setup',
    //             items: customerNavItems,
    //             icon: User2,
    //         });
    //     }
    // }
    if (hasAdminPermission) {
        if (adminNavItems.length > 0) {
            navGroups.push({
                title: 'Administration',
                items: adminNavItems,
                icon: Users,
            });
        }
    }

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
