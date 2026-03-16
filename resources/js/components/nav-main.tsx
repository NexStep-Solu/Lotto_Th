import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CollapsibleContent } from '@radix-ui/react-collapsible';
import { CircleArrowRightIcon } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleTrigger } from './ui/collapsible';

export function NavMain({ items = [], groups = [] }: { items?: NavItem[]; groups?: NavGroup[] }) {
    const page = usePage();
    const { url } = usePage().props;
    return (
        <>
            {items.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={item.href === page.url} tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}

            {groups.map((group) => {
                const [open, setOpen] = useState(true);

                return (
                    <SidebarGroup key={group.title} className="mt-2 py-0">
                        <Collapsible open={open} onOpenChange={setOpen}>
                            <CollapsibleTrigger asChild>
                                <div
                                    className={`border-e-sidebar-accent-foreground hover:border-b-sidebar-accent-foreground flex cursor-pointer items-center justify-between rounded-md border px-4 py-2 transition select-none`}
                                >
                                    {group.icon && <group.icon className="h-4 w-4" />}
                                    <SidebarGroupLabel className="m-0 p-0">{group.title}</SidebarGroupLabel>
                                    <CircleArrowRightIcon className={`h-5 w-5 transition-transform ${open ? 'rotate-90' : 'rotate-0'}`} />
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenu>
                                    {group.items.map((item) => (
                                        <SidebarMenuItem key={item.title} className="pt-1 pl-2">
                                            <SidebarMenuButton asChild isActive={item.href == page.url} tooltip={{ children: item.title }}>
                                                <Link href={item.href} prefetch className="mt-1">
                                                    {item.icon && <item.icon className="h-2 w-2" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </CollapsibleContent>
                        </Collapsible>
                    </SidebarGroup>
                );
            })}
        </>
    );
}
