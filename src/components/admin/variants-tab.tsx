'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Variant } from '@/types/menu';

interface VariantsTabProps {
    variants: Variant[];
    variantDialogOpen: boolean;
    setVariantDialogOpen: (open: boolean) => void;
    editingVariant: Variant | null;
    variantFormData: {
        name: string;
        price_delta: string;
    };
    setVariantFormData: (data: { name: string; price_delta: string }) => void;
    onVariantSubmit: (e: React.FormEvent) => Promise<void>;
    onVariantDelete: (variantId: string) => Promise<void>;
    onVariantEdit: (variant: Variant) => void;
    onVariantCreate: () => void;
}

export function VariantsTab({
    variants,
    variantDialogOpen,
    setVariantDialogOpen,
    editingVariant,
    variantFormData,
    setVariantFormData,
    onVariantSubmit,
    onVariantDelete,
    onVariantEdit,
    onVariantCreate,
}: VariantsTabProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Variants</CardTitle>
                        <CardDescription>
                            Tambahkan ukuran atau jenis berbeda (Regular, Large, dll)
                        </CardDescription>
                    </div>
                    <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={onVariantCreate}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Variant
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingVariant ? 'Edit Variant' : 'Tambah Variant'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingVariant
                                        ? 'Edit detail variant'
                                        : 'Tambah variant baru untuk menu item ini'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={onVariantSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="variant-name">Nama Variant</Label>
                                        <Input
                                            id="variant-name"
                                            value={variantFormData.name}
                                            onChange={(e) => setVariantFormData({ ...variantFormData, name: e.target.value })}
                                            placeholder="Regular, Large, dll"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="variant-price">Perubahan Harga</Label>
                                        <Input
                                            id="variant-price"
                                            type="number"
                                            step="0.01"
                                            value={variantFormData.price_delta}
                                            onChange={(e) => setVariantFormData({ ...variantFormData, price_delta: e.target.value })}
                                            placeholder="0.00"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Masukkan nilai positif untuk harga lebih mahal, negatif untuk lebih murah
                                        </p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">
                                        {editingVariant ? 'Update' : 'Tambah'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {variants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Belum ada variant. Tambah variant pertama untuk menu item ini.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Harga Tambahan</TableHead>
                                <TableHead>Urutan</TableHead>
                                <TableHead className="w-[70px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variants.map((variant) => (
                                <TableRow key={variant.id}>
                                    <TableCell className="font-medium">
                                        {variant.name}
                                    </TableCell>
                                    <TableCell>
                                        {variant.priceDelta >= 0 ? '+' : ''}
                                        Rp {variant.priceDelta.toLocaleString('id-ID')}
                                    </TableCell>
                                    <TableCell>{variant.sortOrder}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onVariantEdit(variant)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onVariantDelete(variant.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}