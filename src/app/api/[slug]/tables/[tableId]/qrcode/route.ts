import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantSlug } from '@/lib/tenant';
import { handleApiError, NotFoundError } from '@/lib/error-handler';
import QRCode from 'qrcode';

// GET QR code for table
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string; tableId: string }> }
) {
    try {
        const { slug, tableId } = await params;

        // Get tenant by slug to get the tenantId
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            return handleApiError(new NotFoundError('Tenant not found'));
        }

        // Get table
        const table = await prisma.table.findFirst({
            where: {
                id: tableId,
                tenantId: tenant.id,
                deletedAt: null,
            },
        });

        if (!table) {
            return handleApiError(new NotFoundError('Table not found'));
        }

        // Generate QR code URL
        const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/menu?table=${table.qrcodeToken}`;

        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrUrl, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return NextResponse.json({
            qrCode: qrCodeDataURL,
            url: qrUrl,
            table: {
                id: table.id,
                code: table.code,
                name: table.name,
                qrcodeToken: table.qrcodeToken,
            }
        });
    } catch (error) {
        console.error('Generate QR code error:', error);
        return handleApiError(error);
    }
}