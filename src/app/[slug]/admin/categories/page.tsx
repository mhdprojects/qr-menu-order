'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';
import type { Category } from '@/types/menu';

export default function CategoriesPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { toast } = useToast();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        is_active: true,
    });

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await fetch(`/api/${slug}/categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch categories',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [slug]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingCategory
                ? `/api/${slug}/categories`
                : `/api/${slug}/categories`;

            const method = editingCategory ? 'PUT' : 'POST';
            const body = editingCategory
                ? { id: editingCategory.id, ...formData }
                : formData;

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
                    description: `Category ${editingCategory ? 'updated' : 'created'} successfully`,
                });
                setDialogOpen(false);
                resetForm();
                fetchCategories();
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to save category',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save category',
                variant: 'destructive',
            });
        }
    };

    // Handle delete
    const handleDelete = async (categoryId: string) => {
        const result = await Swal.fire({
            title: 'Hapus Kategori?',
            text: 'Kategori yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/${slug}/categories`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: categoryId }),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Category deleted successfully',
                });
                fetchCategories();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete category',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete category',
                variant: 'destructive',
            });
        }
    };

    // Open dialog for editing
    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            is_active: category.isActive,
        });
        setDialogOpen(true);
    };

    // Open dialog for creating
    const openCreateDialog = () => {
        setEditingCategory(null);
        resetForm();
        setDialogOpen(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            is_active: true,
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Kategori Menu</h1>
                    <p className="text-muted-foreground">
                        Kelola kategori menu untuk mengorganisir menu items
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Kategori
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCategory
                                    ? 'Edit detail kategori menu'
                                    : 'Tambah kategori baru untuk mengorganisir menu items'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Kategori</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Masukkan nama kategori"
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    />
                                    <Label htmlFor="is_active">Aktif</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">
                                    {editingCategory ? 'Update' : 'Tambah'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Categories Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Kategori</CardTitle>
                    <CardDescription>
                        Semua kategori menu yang tersedia
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {categories.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Belum ada kategori. Tambah kategori pertama Anda.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Urutan</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                    <TableHead className="w-[70px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">
                                            {category.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={category.isActive ? 'default' : 'secondary'}>
                                                {category.isActive ? 'Aktif' : 'Tidak Aktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{category.sortOrder}</TableCell>
                                        <TableCell>
                                            {new Date(category.createdAt).toLocaleDateString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(category.id)}
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