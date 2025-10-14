'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/format';
import type { CartItem } from '@/types/menu';

interface CartSidebarProps {
    children: React.ReactNode;
    onCheckout: () => void;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CartSidebar({ children, onCheckout, isOpen: externalIsOpen, onOpenChange }: CartSidebarProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = onOpenChange || setInternalIsOpen;
    const {
        items,
        updateQuantity,
        removeItem,
        getTotalItems,
        getSubtotal,
        getTaxAmount,
        getServiceCharge,
        getGrandTotal,
        clearCart
    } = useCart();

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(itemId);
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleCheckout = () => {
        setIsOpen(false);
        onCheckout();
    };

    const formatPrice = formatCurrency;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg px-4">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Keranjang Belanja
                        {getTotalItems() > 0 && (
                            <Badge variant="secondary">
                                {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-full">
                    {/* Cart Items */}
                    <ScrollArea className="flex-1 pr-4">
                        {items.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">Keranjang Kosong</h3>
                                <p className="text-sm">Tambahkan menu ke keranjang untuk melanjutkan</p>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4">
                                {items.map((item) => (
                                    <CartItemCard
                                        key={item.id}
                                        item={item}
                                        onQuantityChange={handleQuantityChange}
                                        onRemove={() => removeItem(item.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Cart Summary & Actions */}
                    {items.length > 0 && (
                        <div className="border-t pt-4 space-y-4">
                            {/* Price Breakdown */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(getSubtotal())}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Pajak (10%)</span>
                                    <span>{formatCurrency(getTaxAmount())}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Service (5%)</span>
                                    <span>{formatCurrency(getServiceCharge())}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{formatCurrency(getGrandTotal())}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <Button
                                    onClick={handleCheckout}
                                    className="w-full"
                                    size="lg"
                                >
                                    Lanjut ke Checkout
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={clearCart}
                                    className="w-full"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Kosongkan Keranjang
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

interface CartItemCardProps {
    item: CartItem;
    onQuantityChange: (itemId: string, quantity: number) => void;
    onRemove: () => void;
}

function CartItemCard({ item, onQuantityChange, onRemove }: CartItemCardProps) {
    const basePrice = Number(item.menuItem.basePrice);
    const variantPrice = Number(item.variant?.priceDelta || 0);
    const modifierPrice = item.modifiers.reduce((sum, mod) => sum + Number(mod.priceDelta), 0);
    const itemTotal = (basePrice + variantPrice + modifierPrice) * item.quantity;


    return (
        <div className="flex gap-3 p-3 border rounded-lg">
            {/* Item Image */}
            <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                {item.menuItem.photoUrl ? (
                    <img
                        src={item.menuItem.photoUrl}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                )}
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">
                            {item.menuItem.name}
                        </h4>
                        {item.variant && (
                            <p className="text-xs text-muted-foreground">
                                {item.variant.name}
                            </p>
                        )}
                        {item.modifiers.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {item.modifiers.map(m => m.name).join(', ')}
                            </p>
                        )}
                        {item.note && (
                            <p className="text-xs text-muted-foreground italic">
                                "{item.note}"
                            </p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        className="h-6 w-6 p-0 ml-2"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-7 w-7 p-0"
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                            className="h-7 w-7 p-0"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>

                    <div className="text-right">
                        <div className="text-sm font-medium">
                            {formatCurrency(itemTotal)}
                        </div>
                        {item.quantity > 1 && (
                            <div className="text-xs text-muted-foreground">
                                {formatCurrency(basePrice + variantPrice + modifierPrice)} × {item.quantity}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}