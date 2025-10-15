'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
    menuItem: MenuItem;
    onClick: () => void;
}

export function MenuItemCard({ menuItem, onClick }: MenuItemCardProps) {
    if (menuItem.availability !== 'available') {
        return (
            <Card className="opacity-50 cursor-not-allowed">
                <CardContent className="p-4">
                    <div className="text-center text-muted-foreground">
                        <div className="font-medium">{menuItem.name}</div>
                        <Badge variant="secondary" className="mt-2">
                            Tidak Tersedia
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="cursor-pointer transition-all hover:shadow-md">
            {/* Menu Image */}
            {menuItem.photoUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                        src={menuItem.photoUrl}
                        alt={menuItem.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
            )}

            <CardHeader className="py-1">
                <CardTitle className="text-lg">{menuItem.name}</CardTitle>
                {menuItem.description && (
                    <CardDescription className="line-clamp-2">
                        {menuItem.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-primary">
                        {formatCurrency(menuItem.basePrice)}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick();
                            }}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Tambah
                        </Button>
                    </div>
                </div>

                {(menuItem.variants && menuItem.variants.length > 0) || (menuItem.modifiers && menuItem.modifiers.length > 0) ? (
                    <div className="mt-2 flex gap-1">
                        {menuItem.variants && menuItem.variants.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                                {menuItem.variants.length} variant
                            </Badge>
                        )}
                        {menuItem.modifiers && menuItem.modifiers.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                                {menuItem.modifiers.length} modifier
                            </Badge>
                        )}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}