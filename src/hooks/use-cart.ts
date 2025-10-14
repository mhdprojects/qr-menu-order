'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem, Variant, ModifierOption, CartItem } from '@/types/menu';

interface CartStore {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    getSubtotal: () => number;
    getTaxAmount: () => number;
    getServiceCharge: () => number;
    getGrandTotal: () => number;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (newItem: CartItem) => {
                set((state) => {
                    // Check if item with same configuration already exists
                    const existingIndex = state.items.findIndex((item) =>
                        item.id === newItem.id &&
                        item.variant?.id === newItem.variant?.id &&
                        JSON.stringify(item.modifiers.map(m => m.id).sort()) ===
                        JSON.stringify(newItem.modifiers.map(m => m.id).sort()) &&
                        item.note === newItem.note
                    );

                    if (existingIndex >= 0) {
                        // Update quantity of existing item
                        const updatedItems = [...state.items];
                        updatedItems[existingIndex].quantity += newItem.quantity;
                        return { items: updatedItems };
                    } else {
                        // Add new item
                        return { items: [...state.items, newItem] };
                    }
                });
            },

            removeItem: (itemId: string) => {
                set((state) => ({
                    items: state.items.filter(item => item.id !== itemId)
                }));
            },

            updateQuantity: (itemId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                    return;
                }

                set((state) => ({
                    items: state.items.map(item =>
                        item.id === itemId
                            ? { ...item, quantity }
                            : item
                    )
                }));
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => {
                    const basePrice = Number(item.menuItem.basePrice);
                    const variantPrice = Number(item.variant?.priceDelta || 0);
                    const modifierPrice = item.modifiers.reduce((sum, mod) => sum + Number(mod.priceDelta), 0);
                    const itemTotal = (basePrice + variantPrice + modifierPrice) * item.quantity;
                    return total + itemTotal;
                }, 0);
            },

            getSubtotal: () => {
                return get().getTotalPrice();
            },

            getTaxAmount: () => {
                // 10% tax
                return Math.round(get().getSubtotal() * 0.1);
            },

            getServiceCharge: () => {
                // 5% service charge for dine-in
                return Math.round(get().getSubtotal() * 0.05);
            },

            getGrandTotal: () => {
                return get().getSubtotal() + get().getTaxAmount() + get().getServiceCharge();
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);