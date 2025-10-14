'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MenuHeader, RestaurantHero, CategoryTabs, FloatingCartButton } from '@/components/menu/menu-header';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { MenuItemDetail } from '@/components/menu/menu-item-detail';
import { CartSidebar } from '@/components/cart/cart-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/use-cart';
import type { Tenant } from '@/types/auth';
import type { Category, MenuItem, Variant, ModifierOption } from '@/types/menu';

export default function MenuPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const tableToken = searchParams.get('table');

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { addItem, getTotalItems, getTotalPrice } = useCart();

    // Fetch tenant and menu data
    const fetchData = async () => {
        try {
            // Fetch tenant info
            const tenantResponse = await fetch(`/api/tenants/${slug}`);
            if (tenantResponse.ok) {
                const tenantData = await tenantResponse.json();
                setTenant(tenantData.tenant);
            }

            // Fetch categories
            const categoriesResponse = await fetch(`/api/${slug}/categories`);
            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData.categories);
            }

            // Fetch menu items
            const menuItemsResponse = await fetch(`/api/${slug}/menu-items`);
            if (menuItemsResponse.ok) {
                const menuItemsData = await menuItemsResponse.json();
                setMenuItems(menuItemsData.menuItems);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [slug]);

    // Handle menu item click (for detail view)
    const handleMenuItemClick = (menuItem: MenuItem) => {
        setSelectedMenuItem(menuItem);
        setIsDetailOpen(true);
    };

    // Handle add to cart from detail modal
    const handleAddToCartFromDetail = (cartItem: {
        menuItem: MenuItem;
        variant?: Variant;
        modifiers: ModifierOption[];
        quantity: number;
        specialInstructions: string;
    }) => {
        const cartItemData = {
            id: `${cartItem.menuItem.id}-${cartItem.variant?.id || 'no-variant'}-${Date.now()}`,
            menuItem: cartItem.menuItem,
            variant: cartItem.variant,
            modifiers: cartItem.modifiers,
            quantity: cartItem.quantity,
            note: cartItem.specialInstructions,
        };

        addItem(cartItemData);
        setIsDetailOpen(false);
        setIsCartOpen(true); // Open cart after adding item
    };

    // Handle quick add to cart (without detail modal)
    const handleAddToCart = (menuItem: MenuItem) => {
        handleAddToCartFromDetail({
            menuItem,
            modifiers: [],
            quantity: 1,
            specialInstructions: ''
        });
    };

    // Handle cart click
    const handleCartClick = () => {
        setIsCartOpen(true);
    };

    // Handle checkout
    const handleCheckout = () => {
        const checkoutUrl = `/${slug}/checkout${tableToken ? `?table=${tableToken}` : ''}`;
        window.location.href = checkoutUrl;
    };

    // Get menu items for a category
    const getMenuItemsForCategory = (categoryId: string) => {
        return menuItems.filter(item => item.categoryId === categoryId);
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="space-y-6">
                        {/* Header Skeleton */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-64" />
                                        <Skeleton className="h-4 w-48" />
                                    </div>
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Categories Skeleton */}
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <Skeleton className="h-6 w-32" />
                                    </CardContent>
                                </Card>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <Card key={j}>
                                            <CardContent className="p-4 space-y-3">
                                                <Skeleton className="h-48 w-full" />
                                                <Skeleton className="h-6 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                                <div className="flex justify-between">
                                                    <Skeleton className="h-6 w-20" />
                                                    <Skeleton className="h-8 w-24" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card>
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-2">Restoran Tidak Ditemukan</h2>
                        <p className="text-muted-foreground">
                            Restoran dengan slug "{slug}" tidak ditemukan.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4">
                <div className="space-y-8">
                    {/* Header */}
                    <MenuHeader
                        tenant={tenant}
                        tableCode={tableToken ? 'Unknown' : undefined} // TODO: Get table code from token
                        cartItemCount={getTotalItems()}
                        onCartClick={handleCartClick}
                    />

                    {/* Restaurant Hero */}
                    <RestaurantHero
                        tenant={tenant}
                        tableCode={tableToken ? 'Unknown' : undefined}
                        cartItemCount={getTotalItems()}
                        onCartClick={handleCartClick}
                    />

                    {/* Category Tabs */}
                    <CategoryTabs
                        categories={categories.filter(c => c.isActive)}
                        selectedCategory={selectedCategory}
                        onCategorySelect={(categoryId: string) => setSelectedCategory(categoryId)}
                    />

                    {/* Menu Items */}
                    <div className="py-8">
                        <h2 className="text-2xl font-bold mb-6 text-[#111717] dark:text-white">
                            {selectedCategory
                                ? categories.find(c => c.id === selectedCategory)?.name
                                : categories.find(c => c.isActive)?.name || 'Menu'
                            }
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {selectedCategory
                                ? getMenuItemsForCategory(selectedCategory).map((menuItem) => (
                                    <MenuItemCard
                                        key={menuItem.id}
                                        menuItem={menuItem}
                                        onClick={() => handleMenuItemClick(menuItem)}
                                        onAddToCart={() => handleAddToCart(menuItem)}
                                    />
                                ))
                                : categories
                                    .filter(category => category.isActive)
                                    .slice(0, 1)
                                    .map((category) =>
                                        getMenuItemsForCategory(category.id).map((menuItem) => (
                                            <MenuItemCard
                                                key={menuItem.id}
                                                menuItem={menuItem}
                                                onClick={() => handleMenuItemClick(menuItem)}
                                                onAddToCart={() => handleAddToCart(menuItem)}
                                            />
                                        ))
                                    )
                            }
                        </div>
                        {selectedCategory && getMenuItemsForCategory(selectedCategory).length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-black/5 dark:bg-white/5 rounded-xl">
                                <div className="mb-4">
                                    <span className="material-symbols-outlined text-6xl text-primary">lunch_dining</span>
                                </div>
                                <p className="text-xl font-semibold text-[#111717] dark:text-white">Menu belum tersedia di kategori ini.</p>
                                <p className="text-base text-[#648687] dark:text-gray-400 mt-2">Silakan cek kategori lainnya.</p>
                            </div>
                        )}
                    </div>

                    {/* Floating Cart Button */}
                    {getTotalItems() > 0 && (
                        <FloatingCartButton
                            cartItemCount={getTotalItems()}
                            totalPrice={getTotalPrice()}
                            onCartClick={handleCartClick}
                        />
                    )}

                    {/* Cart Sidebar */}
                    <CartSidebar onCheckout={handleCheckout} isOpen={isCartOpen} onOpenChange={setIsCartOpen}>
                        <div />
                    </CartSidebar>

                    {categories.filter(c => c.isActive).length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <h3 className="text-lg font-medium mb-2">Menu Belum Tersedia</h3>
                                <p>Restoran sedang menyiapkan menu. Silakan kembali lagi nanti.</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Menu Item Detail Modal */}
                    <MenuItemDetail
                        menuItem={selectedMenuItem}
                        isOpen={isDetailOpen}
                        onClose={() => {
                            setIsDetailOpen(false);
                            setSelectedMenuItem(null);
                        }}
                        onAddToCart={handleAddToCartFromDetail}
                    />
                </div>
            </div>
        </div>
    );
}