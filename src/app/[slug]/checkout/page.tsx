'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock } from 'lucide-react';

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const tableToken = searchParams.get('table');

    const [orderPlaced, setOrderPlaced] = useState<any>(null);

    const handleOrderPlaced = (order: any) => {
        setOrderPlaced(order);
    };

    const handleBackToMenu = () => {
        router.push(`/${slug}${tableToken ? `?table=${tableToken}` : ''}`);
    };

    const handleBackToCheckout = () => {
        setOrderPlaced(null);
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardContent className="p-8 text-center">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                                <h1 className="text-3xl font-bold mb-4">Pesanan Berhasil!</h1>
                                <p className="text-lg text-muted-foreground mb-6">
                                    Terima kasih atas pesanan Anda. Pesanan sedang diproses.
                                </p>

                                <div className="bg-muted p-4 rounded-lg mb-6">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Clock className="h-5 w-5" />
                                        <span className="font-semibold">Nomor Pesanan:</span>
                                    </div>
                                    <div className="text-2xl font-bold text-primary">
                                        {orderPlaced.orderNumber}
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm text-muted-foreground mb-6">
                                    <div>Status: <span className="font-medium text-foreground">Menunggu Konfirmasi</span></div>
                                    <div>Total: <span className="font-medium text-foreground">
                                        Rp {orderPlaced.totalAmount.toLocaleString('id-ID')}
                                    </span></div>
                                    {orderPlaced.customer && (
                                        <div>Pelanggan: <span className="font-medium text-foreground">
                                            {orderPlaced.customer.name || 'Tidak disebutkan'}
                                        </span></div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={handleBackToMenu} className="flex-1">
                                        Kembali ke Menu
                                    </Button>
                                    <Button onClick={handleBackToCheckout} className="flex-1">
                                        Pesan Lagi
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Button variant="ghost" onClick={handleBackToMenu}>
                        ← Kembali ke Menu
                    </Button>
                </div>

                <CheckoutForm
                    tableToken={tableToken || undefined}
                    onOrderPlaced={handleOrderPlaced}
                    onBack={handleBackToMenu}
                />
            </div>
        </div>
    );
}