'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MenuItemCard } from './menu-item-card';
import type { Category, MenuItem } from '@/types/menu';

interface MenuCategoryProps {
    category: Category;
    menuItems: MenuItem[];
    onMenuItemClick: (menuItem: MenuItem) => void;
    onAddToCart: (menuItem: MenuItem) => void;
}

export function MenuCategory({
    category,
    menuItems,
    onMenuItemClick,
    onAddToCart
}: MenuCategoryProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!category.isActive) return null;

    return (
        <div className="space-y-4">
            {/* Category Header */}
            <Card>
                <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">{category.name}</CardTitle>
                            <CardDescription>
                                {menuItems.length} menu item{menuItems.length !== 1 ? 's' : ''} tersedia
                            </CardDescription>
                        </div>
                        <Badge variant="secondary">
                            {isExpanded ? 'Tutup' : 'Buka'}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* Menu Items */}
            {isExpanded && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {menuItems.map((menuItem) => (
                        <MenuItemCard
                            key={menuItem.id}
                            menuItem={menuItem}
                            onClick={() => onMenuItemClick(menuItem)}
                            onAddToCart={() => onAddToCart(menuItem)}
                        />
                    ))}
                </div>
            )}

            {isExpanded && menuItems.length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Tidak ada menu tersedia di kategori ini
                    </CardContent>
                </Card>
            )}
        </div>
    );
}