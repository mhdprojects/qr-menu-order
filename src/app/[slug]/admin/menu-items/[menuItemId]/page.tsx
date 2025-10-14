'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';
import type { MenuItem, Variant, Modifier } from '@/types/menu';

export default function MenuItemDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const menuItemId = params.menuItemId as string;
    const { toast } = useToast();

    const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [modifiers, setModifiers] = useState<Modifier[]>([]);
    const [loading, setLoading] = useState(true);

    // Variant dialog states
    const [variantDialogOpen, setVariantDialogOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
    const [variantFormData, setVariantFormData] = useState({
        name: '',
        price_delta: '',
    });

    // Modifier dialog states
    const [modifierDialogOpen, setModifierDialogOpen] = useState(false);
    const [editingModifier, setEditingModifier] = useState<Modifier | null>(null);
    const [modifierFormData, setModifierFormData] = useState({
        name: '',
        is_required: false,
        max_select: '',
    });

    // Fetch menu item details
    const fetchMenuItemDetails = async () => {
        try {
            const response = await fetch(`/api/${slug}/menu-items`);
            if (response.ok) {
                const data = await response.json();
                const item = data.menuItems.find((item: MenuItem) => item.id === menuItemId);
                if (item) {
                    setMenuItem(item);
                    setVariants(item.variants || []);
                    setModifiers(item.modifiers || []);
                }
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch menu item details',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuItemDetails();
    }, [slug, menuItemId]);

    // Handle variant operations
    const handleVariantSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingVariant
                ? `/api/${slug}/menu-items/${menuItemId}/variants/${editingVariant.id}`
                : `/api/${slug}/menu-items/${menuItemId}/variants`;

            const method = editingVariant ? 'PUT' : 'POST';
            const body = editingVariant
                ? { ...variantFormData }
                : variantFormData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: `Variant ${editingVariant ? 'updated' : 'created'} successfully`,
                });
                setVariantDialogOpen(false);
                resetVariantForm();
                fetchMenuItemDetails();
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to save variant',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save variant',
                variant: 'destructive',
            });
        }
    };

    const handleVariantDelete = async (variantId: string) => {
        const result = await Swal.fire({
            title: 'Hapus Variant?',
            text: 'Variant yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/${slug}/menu-items/${menuItemId}/variants/${variantId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Variant deleted successfully',
                });
                fetchMenuItemDetails();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete variant',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete variant',
                variant: 'destructive',
            });
        }
    };

    // Handle modifier operations
    const handleModifierSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingModifier
                ? `/api/${slug}/menu-items/${menuItemId}/modifiers/${editingModifier.id}`
                : `/api/${slug}/menu-items/${menuItemId}/modifiers`;

            const method = editingModifier ? 'PUT' : 'POST';
            const body = editingModifier
                ? { ...modifierFormData, max_select: modifierFormData.max_select ? parseInt(modifierFormData.max_select) : undefined }
                : { ...modifierFormData, max_select: modifierFormData.max_select ? parseInt(modifierFormData.max_select) : undefined };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: `Modifier ${editingModifier ? 'updated' : 'created'} successfully`,
                });
                setModifierDialogOpen(false);
                resetModifierForm();
                fetchMenuItemDetails();
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to save modifier',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save modifier',
                variant: 'destructive',
            });
        }
    };

    const handleModifierDelete = async (modifierId: string) => {
        const result = await Swal.fire({
            title: 'Hapus Modifier?',
            text: 'Modifier yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/${slug}/menu-items/${menuItemId}/modifiers/${modifierId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Modifier deleted successfully',
                });
                fetchMenuItemDetails();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete modifier',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete modifier',
                variant: 'destructive',
            });
        }
    };

    // Form helpers
    const openVariantEditDialog = (variant: Variant) => {
        setEditingVariant(variant);
        setVariantFormData({
            name: variant.name,
            price_delta: variant.priceDelta.toString(),
        });
        setVariantDialogOpen(true);
    };

    const openVariantCreateDialog = () => {
        setEditingVariant(null);
        resetVariantForm();
        setVariantDialogOpen(true);
    };

    const resetVariantForm = () => {
        setVariantFormData({
            name: '',
            price_delta: '',
        });
    };

    const openModifierEditDialog = (modifier: Modifier) => {
        setEditingModifier(modifier);
        setModifierFormData({
            name: modifier.name,
            is_required: modifier.isRequired,
            max_select: modifier.maxSelect?.toString() || '',
        });
        setModifierDialogOpen(true);
    };

    const openModifierCreateDialog = () => {
        setEditingModifier(null);
        resetModifierForm();
        setModifierDialogOpen(true);
    };

    const resetModifierForm = () => {
        setModifierFormData({
            name: '',
            is_required: false,
            max_select: '',
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!menuItem) {
        return <div>Menu item not found</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/${slug}/admin/menu-items`)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{menuItem.name}</h1>
                    <p className="text-muted-foreground">
                        Kelola variants dan modifiers untuk menu item ini
                    </p>
                </div>
            </div>

            {/* Menu Item Info */}
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
                            <p>{variants.length}</p>
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

            {/* Variants and Modifiers Tabs */}
            <Tabs defaultValue="variants" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="variants">Variants ({variants.length})</TabsTrigger>
                    <TabsTrigger value="modifiers">Modifiers ({modifiers.length})</TabsTrigger>
                </TabsList>

                {/* Variants Tab */}
                <TabsContent value="variants" className="space-y-4">
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
                                        <Button onClick={openVariantCreateDialog}>
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
                                        <form onSubmit={handleVariantSubmit}>
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
                                                            <DropdownMenuItem onClick={() => openVariantEditDialog(variant)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleVariantDelete(variant.id)}
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
                </TabsContent>

                {/* Modifiers Tab */}
                <TabsContent value="modifiers" className="space-y-4">
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
                                        <Button onClick={openModifierCreateDialog}>
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
                                        <form onSubmit={handleModifierSubmit}>
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
                                                            <DropdownMenuItem onClick={() => openModifierEditDialog(modifier)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleModifierDelete(modifier.id)}
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
                </TabsContent>
            </Tabs>
        </div>
    );
}