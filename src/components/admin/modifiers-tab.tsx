'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Modifier } from '@/types/menu';

const ModifierOptionsManager = ({
    modifierId,
    tenantSlug,
    menuItemId
}: {
    modifierId?: string;
    tenantSlug: string;
    menuItemId: string;
}) => {
    const [options, setOptions] = useState<any[]>([]);
    const [newOptionName, setNewOptionName] = useState('');
    const [newOptionPrice, setNewOptionPrice] = useState('');

    useEffect(() => {
        if (modifierId) {
            fetchOptions();
        }
    }, [modifierId]);

    const fetchOptions = async () => {
        if (!modifierId) return;

        try {
            const response = await fetch(`/api/${tenantSlug}/menu-items/${menuItemId}/modifiers/${modifierId}`);
            if (response.ok) {
                const data = await response.json();
                setOptions(data.modifier?.options || []);
            }
        } catch (error) {
            console.error('Failed to fetch options:', error);
        }
    };

    const handleAddOption = async () => {
        if (!modifierId || !newOptionName.trim()) return;

        try {
            const response = await fetch(`/api/${tenantSlug}/menu-items/${menuItemId}/modifiers/${modifierId}/options`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newOptionName.trim(),
                    price_delta: newOptionPrice ? parseFloat(newOptionPrice) : 0.0,
                }),
            });

            if (response.ok) {
                setNewOptionName('');
                setNewOptionPrice('');
                fetchOptions();
            } else {
                console.error('Failed to add option:', await response.text());
            }
        } catch (error) {
            console.error('Failed to add option:', error);
        }
    };

    const handleDeleteOption = async (optionId: string) => {
        try {
            const response = await fetch(`/api/${tenantSlug}/menu-items/${menuItemId}/modifiers/${modifierId}/options/${optionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchOptions();
            }
        } catch (error) {
            console.error('Failed to delete option:', error);
        }
    };

    if (!modifierId) {
        return (
            <p className="text-sm text-muted-foreground">
                Simpan modifier terlebih dahulu untuk menambah opsi
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {/* Add new option */}
            <div className="flex gap-2">
                <Input
                    placeholder="Nama opsi (contoh: Ice)"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    className="flex-1"
                />
                <Input
                    type="number"
                    step="0.01"
                    placeholder="Harga (+/-)"
                    value={newOptionPrice}
                    onChange={(e) => setNewOptionPrice(e.target.value)}
                    className="w-24"
                />
                <Button type="button" size="sm" onClick={handleAddOption}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Existing options */}
            {options.length > 0 && (
                <div className="space-y-2">
                    {options.map((option) => (
                        <div key={option.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex-1">
                                <span className="font-medium">{option.name}</span>
                                {option.priceDelta !== 0 && (
                                    <span className="text-sm text-muted-foreground ml-2">
                                        ({option.priceDelta > 0 ? '+' : ''}Rp {option.priceDelta.toLocaleString('id-ID')})
                                    </span>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOption(option.id)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {options.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Belum ada opsi. Tambah opsi pertama untuk modifier ini.
                </p>
            )}
        </div>
    );
};

interface ModifiersTabProps {
    modifiers: Modifier[];
    modifierDialogOpen: boolean;
    setModifierDialogOpen: (open: boolean) => void;
    editingModifier: Modifier | null;
    modifierFormData: {
        name: string;
        is_required: boolean;
        max_select: string;
    };
    setModifierFormData: (data: { name: string; is_required: boolean; max_select: string }) => void;
    onModifierSubmit: (e: React.FormEvent) => Promise<void>;
    onModifierDelete: (modifierId: string) => Promise<void>;
    onModifierEdit: (modifier: Modifier) => void;
    onModifierCreate: () => void;
    tenantSlug: string;
    menuItemId: string;
}

export function ModifiersTab({
    modifiers,
    modifierDialogOpen,
    setModifierDialogOpen,
    editingModifier,
    modifierFormData,
    setModifierFormData,
    onModifierSubmit,
    onModifierDelete,
    onModifierEdit,
    onModifierCreate,
    tenantSlug,
    menuItemId,
}: ModifiersTabProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Modifiers</CardTitle>
                        <CardDescription>
                            Tambahkan opsi tambahan (Ice, Sugar, dll)
                        </CardDescription>
                    </div>
                    <Dialog open={modifierDialogOpen} onOpenChange={setModifierDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={onModifierCreate}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Modifier
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingModifier ? 'Edit Modifier' : 'Tambah Modifier'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingModifier
                                        ? 'Edit detail modifier'
                                        : 'Tambah modifier baru untuk menu item ini'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={onModifierSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="modifier-name">Nama Modifier</Label>
                                        <Input
                                            id="modifier-name"
                                            value={modifierFormData.name}
                                            onChange={(e) => setModifierFormData({ ...modifierFormData, name: e.target.value })}
                                            placeholder="Ice, Sugar, dll"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="modifier-required"
                                            checked={modifierFormData.is_required}
                                            onCheckedChange={(checked) => setModifierFormData({ ...modifierFormData, is_required: checked })}
                                        />
                                        <Label htmlFor="modifier-required">Wajib dipilih</Label>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="modifier-max-select">Maksimal Pilihan</Label>
                                        <Input
                                            id="modifier-max-select"
                                            type="number"
                                            min="1"
                                            value={modifierFormData.max_select}
                                            onChange={(e) => setModifierFormData({ ...modifierFormData, max_select: e.target.value })}
                                            placeholder="Kosongkan jika tidak ada batas"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Kosongkan jika pelanggan bisa memilih tanpa batas
                                        </p>
                                    </div>

                                    {/* Modifier Options Section */}
                                    <div className="border-t pt-4 mt-4">
                                        <Label className="text-sm font-medium">Opsi Modifier</Label>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Tambahkan pilihan untuk modifier ini (misalnya: Ice, Sugar, dll)
                                        </p>

                                        <div className="space-y-3">
                                            <ModifierOptionsManager
                                                modifierId={editingModifier?.id || undefined}
                                                tenantSlug={tenantSlug}
                                                menuItemId={menuItemId}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">
                                        {editingModifier ? 'Update' : 'Tambah'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {modifiers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Belum ada modifier. Tambah modifier pertama untuk menu item ini.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Wajib</TableHead>
                                <TableHead>Maksimal Pilihan</TableHead>
                                <TableHead>Urutan</TableHead>
                                <TableHead className="w-[70px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {modifiers.map((modifier) => (
                                <TableRow key={modifier.id}>
                                    <TableCell className="font-medium">
                                        {modifier.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={modifier.isRequired ? 'default' : 'secondary'}>
                                            {modifier.isRequired ? 'Wajib' : 'Opsional'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {modifier.maxSelect ? modifier.maxSelect : 'Tidak terbatas'}
                                    </TableCell>
                                    <TableCell>{modifier.sortOrder}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onModifierEdit(modifier)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onModifierDelete(modifier.id)}
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