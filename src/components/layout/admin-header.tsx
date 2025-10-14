'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface AdminHeaderProps {
    tenantSlug: string;
    tenantName: string;
    userName: string;
}

export function AdminHeader({ tenantSlug, tenantName, userName }: AdminHeaderProps) {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                    <Link href={`/${tenantSlug}/admin`} className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded bg-teal-600 flex items-center justify-center md:hidden">
                            <span className="text-white font-bold text-xs">OM</span>
                        </div>
                        <span className="hidden font-bold sm:inline-block text-sm">
                            {tenantName}
                        </span>
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    {/* Search Bar */}
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <div className="relative">
                            <input
                                type="search"
                                placeholder="Cari menu, pesanan, atau pelanggan..."
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:w-[300px] lg:w-[400px]"
                            />
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                            <Link href={`/${tenantSlug}`} className="flex items-center gap-2">
                                <span className="hidden sm:inline">Lihat Menu</span>
                                <span className="sm:hidden">Menu</span>
                            </Link>
                        </Button>

                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                                <span className="text-teal-600 font-semibold text-sm">
                                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium">{user?.name || userName}</p>
                                <p className="text-xs text-muted-foreground">Administrator</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}