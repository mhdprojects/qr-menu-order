'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type { MenuItem } from '@/types/menu';

interface MenuItemInfoProps {
    menuItem: MenuItem;
    variantsCount: number;
}

export function MenuItemInfo({ menuItem, variantsCount }: MenuItemInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Informasi Menu</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <Label className="text-sm font-medium">Harga Dasar</Label>
                        <p className="text-lg font-semibold">
                            Rp {menuItem.basePrice.toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Kategori</Label>
                        <p>{menuItem.category?.name}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant={menuItem.availability === 'available' ? 'default' : 'secondary'}>
                            {menuItem.availability === 'available' ? 'Tersedia' : 'Tidak Tersedia'}
                        </Badge>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Total Variants</Label>
                        <p>{variantsCount}</p>
                    </div>
                </div>
                {menuItem.description && (
                    <div className="mt-4">
                        <Label className="text-sm font-medium">Deskripsi</Label>
                        <p className="text-sm text-muted-foreground">{menuItem.description}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}