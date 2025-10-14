'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, QrCode as QrCodeIcon, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeProps {
    tableId: string;
    tableCode: string;
    tableName: string;
    tenantSlug: string;
}

export function QRCode({ tableId, tableCode, tableName, tenantSlug }: QRCodeProps) {
    const [qrCodeData, setQrCodeData] = useState<{
        qrCode: string;
        url: string;
        table: { id: string; code: string; name: string; qrcodeToken: string };
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const fetchQRCode = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/${tenantSlug}/tables/${tableId}/qrcode`);
            if (response.ok) {
                const data = await response.json();
                setQrCodeData(data);
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to generate QR code',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to generate QR code',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        if (!qrCodeData) return;

        const link = document.createElement('a');
        link.href = qrCodeData.qrCode;
        link.download = `qr-${tableCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: 'Success',
            description: 'QR code downloaded successfully',
        });
    };

    const copyURL = async () => {
        if (!qrCodeData) return;

        try {
            await navigator.clipboard.writeText(qrCodeData.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
                title: 'Success',
                description: 'URL copied to clipboard',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to copy URL',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <QrCodeIcon className="h-4 w-4 mr-2" />
                    QR Code
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>QR Code Meja {tableCode}</DialogTitle>
                    <DialogDescription>
                        Scan QR code ini untuk mengakses menu dari meja {tableName}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {!qrCodeData && !loading && (
                        <Button onClick={fetchQRCode} className="w-full">
                            <QrCodeIcon className="h-4 w-4 mr-2" />
                            Generate QR Code
                        </Button>
                    )}

                    {loading && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-sm text-muted-foreground mt-2">Generating QR Code...</p>
                        </div>
                    )}

                    {qrCodeData && (
                        <>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex justify-center">
                                        <img
                                            src={qrCodeData.qrCode}
                                            alt={`QR Code for table ${tableCode}`}
                                            className="w-48 h-48"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">URL:</p>
                                <div className="flex items-center space-x-2">
                                    <code className="flex-1 text-xs bg-muted p-2 rounded break-all">
                                        {qrCodeData.url}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyURL}
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <Button onClick={downloadQR} className="flex-1">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PNG
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={fetchQRCode}
                                    disabled={loading}
                                >
                                    <QrCodeIcon className="h-4 w-4 mr-2" />
                                    Regenerate
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}