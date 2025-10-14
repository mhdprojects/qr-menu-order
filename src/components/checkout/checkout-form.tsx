'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface CheckoutFormProps {
    tableToken?: string;
    onOrderPlaced: (order: any) => void;
    onBack: () => void;
}

export function CheckoutForm({ tableToken, onOrderPlaced, onBack }: CheckoutFormProps) {
    const params = useParams();
    const slug = params.slug as string;
    const { toast } = useToast();

    const {
        items,
        getSubtotal,
        getTaxAmount,
        getServiceCharge,
        getGrandTotal,
        clearCart
    } = useCart();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        orderType: tableToken ? 'dine_in' : 'take_away',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        note: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate cart is not empty
            if (items.length === 0) {
                toast({
                    title: 'Error',
                    description: 'Keranjang kosong',
                    variant: 'destructive',
                });
                return;
            }

            // Validate required fields
            if (formData.orderType === 'dine_in' && !tableToken) {
                toast({
                    title: 'Error',
                    description: 'Meja diperlukan untuk dine-in',
                    variant: 'destructive',
                });
                return;
            }

            // Prepare order items
            const orderItems = items.map(item => ({
                menuItemId: item.menuItem.id,
                variantId: item.variant?.id,
                modifierIds: item.modifiers.map(m => m.id),
                quantity: item.quantity,
                note: item.note,
                nameSnapshot: item.menuItem.name,
                basePriceSnapshot: item.menuItem.basePrice,
            }));

            // Submit order
            const response = await fetch(`/api/${slug}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    tableSessionId: tableToken, // Will be null for take_away
                    items: orderItems,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                clearCart();
                onOrderPlaced(data.order);
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to place order',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to place order',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (price: number) => {
        return `Rp ${price.toLocaleString('id-ID')}`;
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Keranjang Kosong</h2>
                <p className="text-muted-foreground mb-6">
                    Tambahkan menu ke keranjang terlebih dahulu
                </p>
                <Button onClick={onBack}>Kembali ke Menu</Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Order Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Ringkasan Pesanan</CardTitle>
                    <CardDescription>
                        {items.length} item{items.length > 1 ? 's' : ''} dalam keranjang
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {items.map((item) => {
                            const basePrice = item.menuItem.basePrice;
                            const variantPrice = item.variant?.priceDelta || 0;
                            const modifierPrice = item.modifiers.reduce((sum, mod) => sum + mod.priceDelta, 0);
                            const itemTotal = (basePrice + variantPrice + modifierPrice) * item.quantity;

                            return (
                                <div key={item.id} className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium">
                                            {item.menuItem.name} × {item.quantity}
                                        </div>
                                        {item.variant && (
                                            <div className="text-sm text-muted-foreground">
                                                {item.variant.name}
                                            </div>
                                        )}
                                        {item.modifiers.length > 0 && (
                                            <div className="text-sm text-muted-foreground">
                                                {item.modifiers.map(m => m.name).join(', ')}
                                            </div>
                                        )}
                                        {item.note && (
                                            <div className="text-sm text-muted-foreground italic">
                                                "{item.note}"
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">
                                            {formatPrice(itemTotal)}
                                        </div>
                                        {item.quantity > 1 && (
                                            <div className="text-sm text-muted-foreground">
                                                {formatPrice(basePrice + variantPrice + modifierPrice)} × {item.quantity}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Separator className="my-4" />

                    {/* Price Breakdown */}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatPrice(getSubtotal())}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Pajak (10%)</span>
                            <span>{formatPrice(getTaxAmount())}</span>
                        </div>
                        {formData.orderType === 'dine_in' && (
                            <div className="flex justify-between">
                                <span>Service (5%)</span>
                                <span>{formatPrice(getServiceCharge())}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatPrice(getGrandTotal())}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Type */}
            <Card>
                <CardHeader>
                    <CardTitle>Jenis Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={formData.orderType}
                        onValueChange={(value) => setFormData({ ...formData, orderType: value as 'dine_in' | 'take_away' })}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dine_in" id="dine_in" disabled={!tableToken} />
                            <Label htmlFor="dine_in" className={tableToken ? '' : 'text-muted-foreground'}>
                                Makan di Tempat {tableToken && `(Meja ${tableToken})`}
                                {!tableToken && '(Meja diperlukan)'}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="take_away" id="take_away" />
                            <Label htmlFor="take_away">Bawa Pulang</Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Pelanggan</CardTitle>
                    <CardDescription>
                        Opsional, untuk keperluan konfirmasi dan komunikasi
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerName">Nama</Label>
                            <Input
                                id="customerName"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                placeholder="Masukkan nama"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customerPhone">Telepon</Label>
                            <Input
                                id="customerPhone"
                                type="tel"
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                placeholder="081234567890"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerEmail">Email</Label>
                        <Input
                            id="customerEmail"
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                            placeholder="email@example.com"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Order Note */}
            <Card>
                <CardHeader>
                    <CardTitle>Catatan Pesanan</CardTitle>
                    <CardDescription>
                        Instruksi khusus untuk pesanan ini (opsional)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder="Contoh: Tidak pakai bawang, level pedas sedang, dll..."
                        rows={3}
                    />
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Button variant="outline" onClick={onBack} className="flex-1">
                    Kembali
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1"
                    size="lg"
                >
                    {isSubmitting ? 'Memproses...' : 'Pesan Sekarang'}
                </Button>
            </div>
        </div>
    );
}