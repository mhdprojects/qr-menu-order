'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table as TableUI, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MoreHorizontal, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';
import { QRCode } from '@/components/ui/qr-code';
import type { Table } from '@/types/menu';

export default function TablesPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { toast } = useToast();

    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        capacity: '',
    });

    // Fetch tables
    const fetchTables = async () => {
        try {
            const response = await fetch(`/api/${slug}/tables`);
            if (response.ok) {
                const data = await response.json();
                setTables(data.tables);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch tables',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, [slug]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingTable
                ? `/api/${slug}/tables`
                : `/api/${slug}/tables`;

            const method = editingTable ? 'PUT' : 'POST';
            const body = editingTable
                ? { id: editingTable.id, ...formData }
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
                    description: `Table ${editingTable ? 'updated' : 'created'} successfully`,
                });
                setDialogOpen(false);
                resetForm();
                fetchTables();
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to save table',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save table',
                variant: 'destructive',
            });
        }
    };

    // Handle delete
    const handleDelete = async (tableId: string) => {
        const result = await Swal.fire({
            title: 'Hapus Meja?',
            text: 'Meja yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/${slug}/tables`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: tableId }),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Table deleted successfully',
                });
                fetchTables();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete table',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete table',
                variant: 'destructive',
            });
        }
    };

    // Open dialog for editing
    const openEditDialog = (table: Table) => {
        setEditingTable(table);
        setFormData({
            code: table.code,
            name: table.name,
            capacity: table.capacity.toString(),
        });
        setDialogOpen(true);
    };

    // Open dialog for creating
    const openCreateDialog = () => {
        setEditingTable(null);
        resetForm();
        setDialogOpen(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            capacity: '',
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
                    <h1 className="text-3xl font-bold text-foreground">Manajemen Meja</h1>
                    <p className="text-muted-foreground">
                        Kelola meja restoran dan generate QR code untuk pesanan
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Meja
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingTable ? 'Edit Meja' : 'Tambah Meja'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingTable
                                    ? 'Edit detail meja'
                                    : 'Tambah meja baru untuk restoran'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Kode Meja</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="A01, B02, dll"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Meja</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Meja Indoor A01"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="capacity">Kapasitas</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min="1"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        placeholder="4"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">
                                    {editingTable ? 'Update' : 'Tambah'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tables Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Meja</CardTitle>
                    <CardDescription>
                        Semua meja yang tersedia di restoran
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {tables.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Belum ada meja. Tambah meja pertama Anda.
                        </div>
                    ) : (
                        <TableUI>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Kapasitas</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                    <TableHead className="w-[120px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tables.map((table) => (
                                    <TableRow key={table.id}>
                                        <TableCell className="font-medium">
                                            {table.code}
                                        </TableCell>
                                        <TableCell>{table.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-1" />
                                                {table.capacity} orang
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="default">
                                                Aktif
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(table.createdAt).toLocaleDateString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <QRCode
                                                    tableId={table.id}
                                                    tableCode={table.code}
                                                    tableName={table.name}
                                                    tenantSlug={slug}
                                                />
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditDialog(table)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(table.id)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableUI>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}