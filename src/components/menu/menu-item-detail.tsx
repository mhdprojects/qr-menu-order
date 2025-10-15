'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { MenuItem, Variant, Modifier, ModifierOption } from '@/types/menu';

interface MenuItemDetailProps {
    menuItem: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: {
        menuItem: MenuItem;
        variant?: Variant;
        modifiers: ModifierOption[];
        quantity: number;
        specialInstructions: string;
    }) => void;
}

export function MenuItemDetail({
    menuItem,
    isOpen,
    onClose,
    onAddToCart
}: MenuItemDetailProps) {
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierOption[]>>({});
    const [quantity, setQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState('');

    if (!menuItem) return null;

    // Calculate total price
    const basePrice = Number(menuItem.basePrice);
    const variantPrice = Number(selectedVariant?.priceDelta || 0);
    const modifierPrice = Object.values(selectedModifiers).flat().reduce(
        (sum, modifier) => sum + Number(modifier.priceDelta),
        0
    );
    const totalPrice = (basePrice + variantPrice + modifierPrice) * quantity;
    console.log(totalPrice)

    const handleModifierChange = (modifierId: string, option: ModifierOption, checked: boolean) => {
        setSelectedModifiers(prev => {
            const current = prev[modifierId] || [];
            if (checked) {
                return { ...prev, [modifierId]: [...current, option] };
            } else {
                return { ...prev, [modifierId]: current.filter(opt => opt.id !== option.id) };
            }
        });
    };

    const handleAddToCart = () => {
        const selectedModifierOptions = Object.values(selectedModifiers).flat();

        onAddToCart({
            menuItem,
            variant: selectedVariant || undefined,
            modifiers: selectedModifierOptions,
            quantity,
            specialInstructions
        });

        // Reset form
        setSelectedVariant(null);
        setSelectedModifiers({});
        setQuantity(1);
        setSpecialInstructions('');
        onClose();
    };

    const isValidSelection = () => {
        // Check required modifiers
        return menuItem.modifiers?.every(modifier =>
            !modifier.isRequired ||
            (selectedModifiers[modifier.id]?.length || 0) > 0
        ) ?? true;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{menuItem.name}</DialogTitle>
                    <DialogDescription className="text-base">
                        {formatCurrency(menuItem.basePrice)}
                    </DialogDescription>
                </DialogHeader>

                {/* Menu Image */}
                {menuItem.photoUrl && (
                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                        <img
                            src={menuItem.photoUrl}
                            alt={menuItem.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Variants */}
                {menuItem.variants && menuItem.variants.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Pilih Varian</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={selectedVariant?.id || ''}
                                onValueChange={(value) => {
                                    const variant = menuItem.variants?.find(v => v.id === value);
                                    setSelectedVariant(variant || null);
                                }}
                            >
                                {menuItem.variants.map((variant) => (
                                    <div key={variant.id} className="flex items-center">
                                        <RadioGroupItem value={variant.id} id={variant.id} />
                                        <Label htmlFor={variant.id} className="ml-2 flex-1 cursor-pointer">
                                            <div className="flex justify-between items-center w-full">
                                                <span>{variant.name}</span>
                                                {variant.priceDelta !== 0 && (
                                                    <Badge variant="outline">
                                                        {variant.priceDelta > 0 ? '+' : ''}
                                                        {formatCurrency(variant.priceDelta)}
                                                    </Badge>
                                                )}
                                            </div>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                )}

                {/* Modifiers */}
                {menuItem.modifiers && menuItem.modifiers.length > 0 && (
                    <div className="space-y-4">
                        {menuItem.modifiers.map((modifier) => (
                            <Card key={modifier.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        {modifier.name}
                                        {modifier.isRequired && (
                                            <Badge variant="destructive">Wajib</Badge>
                                        )}
                                    </CardTitle>
                                    {modifier.maxSelect && (
                                        <CardDescription>
                                            Maksimal {modifier.maxSelect} pilihan
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {modifier.options?.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={option.id}
                                                    checked={selectedModifiers[modifier.id]?.some(opt => opt.id === option.id) || false}
                                                    onCheckedChange={(checked) => {
                                                        // Check max select limit
                                                        if (checked && modifier.maxSelect) {
                                                            const currentCount = selectedModifiers[modifier.id]?.length || 0;
                                                            if (currentCount >= modifier.maxSelect) {
                                                                return; // Don't allow more selections
                                                            }
                                                        }
                                                        handleModifierChange(modifier.id, option, checked as boolean);
                                                    }}
                                                />
                                                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                                    <div className="flex justify-between items-center w-full">
                                                        <span>{option.name}</span>
                                                        {option.priceDelta !== 0 && (
                                                            <Badge variant="outline">
                                                                {option.priceDelta > 0 ? '+' : ''}
                                                                {formatCurrency(option.priceDelta)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Special Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Catatan Khusus</CardTitle>
                        <CardDescription>
                            Tambahkan instruksi khusus untuk pesanan ini (opsional)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            className="w-full min-h-[80px] p-3 border rounded-md resize-none"
                            placeholder="Contoh: Pedas level 3, tanpa bawang, dll..."
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                        />
                    </CardContent>
                </Card>

                {/* Quantity and Add to Cart */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Label className="text-sm font-medium">Jumlah:</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center">{quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setQuantity(quantity + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">Total:</div>
                                <div className="text-xl font-bold text-primary">
                                    {formatCurrency(totalPrice)}
                                </div>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <Button
                            onClick={handleAddToCart}
                            className="w-full"
                            size="lg"
                            disabled={!isValidSelection()}
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Tambah ke Keranjang - {formatCurrency(totalPrice)}
                        </Button>

                        {!isValidSelection() && (
                            <p className="text-sm text-destructive text-center mt-2">
                                Silakan lengkapi pilihan yang wajib
                            </p>
                        )}
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}