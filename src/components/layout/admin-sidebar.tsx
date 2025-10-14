'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Utensils,
    Menu as MenuIcon,
    ShoppingCart,
    Table,
    Users,
    Settings,
    LogOut,
    ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminSidebarProps {
    tenantSlug: string;
    tenantName: string;
}

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Menu', href: '/admin/menu-items', icon: Utensils },
    { name: 'Kategori', href: '/admin/categories', icon: MenuIcon },
    { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Meja', href: '/admin/tables', icon: Table },
    { name: 'Pelanggan', href: '/admin/customers', icon: Users },
    { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ tenantSlug, tenantName }: AdminSidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="hidden border-r bg-muted/40 md:block w-64">
            <div className="flex h-full max-h-screen flex-col gap-2">
                {/* Logo/Brand */}
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href={`/${tenantSlug}/admin`} className="flex items-center gap-2 font-semibold">
                        <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">OM</span>
                        </div>
                        <span className="truncate">{tenantName}</span>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
                        {navigation.map((item) => {
                            const isActive = pathname === `/${tenantSlug}${item.href}`;
                            return (
                                <Link
                                    key={item.name}
                                    href={`/${tenantSlug}${item.href}`}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/30',
                                        isActive && 'bg-primary/10 text-primary'
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Menu */}
                <div className="mt-auto p-4 border-t">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-start p-2 h-auto"
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                                        <span className="text-teal-600 font-semibold text-sm">A</span>
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium truncate">Admin User</p>
                                        <p className="text-xs text-muted-foreground truncate">admin@{tenantSlug}.com</p>
                                    </div>
                                    <ChevronUp className="h-4 w-4 rotate-180" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuItem>
                                <div className="flex flex-col">
                                    <span className="font-medium">Profile</span>
                                    <span className="text-xs text-muted-foreground">Kelola akun Anda</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}