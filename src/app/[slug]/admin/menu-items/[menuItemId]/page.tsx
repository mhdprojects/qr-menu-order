'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';
import type { MenuItem, Variant, Modifier } from '@/types/menu';
import { MenuItemInfo } from '@/components/admin/menu-item-info';
import { VariantsTab } from '@/components/admin/variants-tab';
import { ModifiersTab } from '@/components/admin/modifiers-tab';

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
            <MenuItemInfo menuItem={menuItem} variantsCount={variants.length} />

            {/* Variants and Modifiers Tabs */}
            <Tabs defaultValue="variants" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="variants">Variants ({variants.length})</TabsTrigger>
                    <TabsTrigger value="modifiers">Modifiers ({modifiers.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="variants" className="space-y-4">
                    <VariantsTab
                        variants={variants}
                        variantDialogOpen={variantDialogOpen}
                        setVariantDialogOpen={setVariantDialogOpen}
                        editingVariant={editingVariant}
                        variantFormData={variantFormData}
                        setVariantFormData={setVariantFormData}
                        onVariantSubmit={handleVariantSubmit}
                        onVariantDelete={handleVariantDelete}
                        onVariantEdit={openVariantEditDialog}
                        onVariantCreate={openVariantCreateDialog}
                    />
                </TabsContent>

                <TabsContent value="modifiers" className="space-y-4">
                    <ModifiersTab
                        modifiers={modifiers}
                        modifierDialogOpen={modifierDialogOpen}
                        setModifierDialogOpen={setModifierDialogOpen}
                        editingModifier={editingModifier}
                        modifierFormData={modifierFormData}
                        setModifierFormData={setModifierFormData}
                        onModifierSubmit={handleModifierSubmit}
                        onModifierDelete={handleModifierDelete}
                        onModifierEdit={openModifierEditDialog}
                        onModifierCreate={openModifierCreateDialog}
                        tenantSlug={slug}
                        menuItemId={menuItemId}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}