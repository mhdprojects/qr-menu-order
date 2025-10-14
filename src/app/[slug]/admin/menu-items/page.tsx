'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MoreHorizontal, Eye, EyeOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';
import imageCompression from 'browser-image-compression';
import type { MenuItem, Category } from '@/types/menu';

export default function MenuItemsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { toast } = useToast();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        base_price: '',
        category_id: '',
        availability: 'available' as 'available' | 'unavailable',
        photo_url: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    // Fetch menu items and categories
    const fetchData = async () => {
        try {
            const [menuItemsRes, categoriesRes] = await Promise.all([
                fetch(`/api/${slug}/menu-items`),
                fetch(`/api/${slug}/categories`),
            ]);

            if (menuItemsRes.ok) {
                const menuItemsData = await menuItemsRes.json();
                setMenuItems(menuItemsData.menuItems);
            }

            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json();
                setCategories(categoriesData.categories);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [slug]);

    // Handle file selection and compression
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size (1MB max)
        if (file.size > 1024 * 1024) {
            toast({
                title: 'Error',
                description: 'Ukuran file maksimal 1MB',
                variant: 'destructive',
            });
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Error',
                description: 'File harus berupa gambar',
                variant: 'destructive',
            });
            return;
        }

        try {
            // Compress image
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 720,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            setSelectedFile(compressedFile);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Gagal mengkompres gambar',
                variant: 'destructive',
            });
        }
    };

    // Upload file to Supabase Storage via API
    const uploadToSupabase = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        return data.url;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let photoUrl = formData.photo_url;

            // Upload file if selected
            if (selectedFile) {
                photoUrl = await uploadToSupabase(selectedFile);
            }

            const url = editingItem
                ? `/api/${slug}/menu-items`
                : `/api/${slug}/menu-items`;

            const method = editingItem ? 'PUT' : 'POST';
            const body = editingItem
                ? { id: editingItem.id, ...formData, photo_url: photoUrl }
                : { ...formData, photo_url: photoUrl };

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
                    description: `Menu item ${editingItem ? 'updated' : 'created'} successfully`,
                });
                setDialogOpen(false);
                resetForm();
                fetchData();
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to save menu item',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save menu item',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    // Handle delete
    const handleDelete = async (itemId: string) => {
        const result = await Swal.fire({
            title: 'Hapus Menu Item?',
            text: 'Menu item yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/${slug}/menu-items`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: itemId }),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Menu item deleted successfully',
                });
                fetchData();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete menu item',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete menu item',
                variant: 'destructive',
            });
        }
    };

    // Open dialog for editing
    const openEditDialog = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            base_price: item.basePrice.toString(),
            category_id: item.categoryId,
            availability: item.availability,
            photo_url: item.photoUrl || '',
        });
        setDialogOpen(true);
    };

    // Open dialog for creating
    const openCreateDialog = () => {
        setEditingItem(null);
        resetForm();
        setDialogOpen(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            base_price: '',
            category_id: '',
            availability: 'available',
            photo_url: '',
        });
        setSelectedFile(null);
        setPreviewUrl('');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Menu Items</h1>
                    <p className="text-muted-foreground">
                        Kelola item menu untuk katalog restoran Anda
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Menu Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? 'Edit Menu Item' : 'Tambah Menu Item'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingItem
                                    ? 'Edit detail menu item'
                                    : 'Tambah menu item baru ke katalog'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Menu</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Masukkan nama menu"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Kategori</Label>
                                    <Select
                                        value={formData.category_id}
                                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Deskripsi menu (opsional)"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="base_price">Harga Dasar</Label>
                                    <Input
                                        id="base_price"
                                        type="number"
                                        step="0.01"
                                        value={formData.base_price}
                                        onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="availability">Ketersediaan</Label>
                                    <Select
                                        value={formData.availability}
                                        onValueChange={(value: 'available' | 'unavailable') =>
                                            setFormData({ ...formData, availability: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Tersedia</SelectItem>
                                            <SelectItem value="unavailable">Tidak Tersedia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="photo">Foto Menu</Label>
                                <div className="space-y-4">
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                    />
                                    {previewUrl && (
                                        <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Maksimal 1MB, akan dikompresi ke 720px. Format: JPG, PNG, WebP
                                    </p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isUploading}>
                                    {isUploading ? 'Mengupload...' : (editingItem ? 'Update' : 'Tambah')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Menu Items Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Menu Items</CardTitle>
                    <CardDescription>
                        Semua item menu yang tersedia
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {menuItems.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Belum ada menu item. Tambah menu item pertama Anda.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Harga</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                    <TableHead className="w-[70px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {menuItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <a
                                                href={`/${slug}/admin/menu-items/${item.id}`}
                                                className="block hover:underline"
                                            >
                                                <div className="font-medium">{item.name}</div>
                                                {item.description && (
                                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                                        {item.description}
                                                    </div>
                                                )}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {item.category?.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            Rp {item.basePrice.toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={item.availability === 'available' ? 'default' : 'secondary'}
                                            >
                                                {item.availability === 'available' ? (
                                                    <>
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        Tersedia
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="h-3 w-3 mr-1" />
                                                        Tidak Tersedia
                                                    </>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(item.createdAt).toLocaleDateString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(item.id)}
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
        </div>
    );
}