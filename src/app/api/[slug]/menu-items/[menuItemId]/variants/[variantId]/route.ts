import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantSlug } from '@/lib/tenant';
import { variantSchema } from '@/lib/validations';
import { handleApiError, NotFoundError, UnauthorizedError } from '@/lib/error-handler';

// PUT update variant
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; menuItemId: string; variantId: string }> }
) {
    try {
        const { slug, menuItemId, variantId } = await params;

        // Get tenant by slug to get the tenantId
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            return handleApiError(new NotFoundError('Tenant not found'));
        }

        const body = await request.json();
        const validatedData = variantSchema.parse(body);

        const variant = await prisma.menuVariant.update({
            where: {
                id: variantId,
                menuItemId,
                tenantId: tenant.id,
                deletedAt: null,
            },
            data: {
                name: validatedData.name,
                priceDelta: parseFloat(validatedData.price_delta),
            },
        });

        return NextResponse.json({ variant });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleApiError(error);
        }

        console.error('Update variant error:', error);
        return handleApiError(error);
    }
}

// DELETE variant (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; menuItemId: string; variantId: string }> }
) {
    try {
        const { slug, menuItemId, variantId } = await params;

        // Get tenant by slug to get the tenantId
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            return handleApiError(new NotFoundError('Tenant not found'));
        }

        const variant = await prisma.menuVariant.update({
            where: {
                id: variantId,
                menuItemId,
                tenantId: tenant.id,
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({ variant });
    } catch (error) {
        console.error('Delete variant error:', error);
        return handleApiError(error);
    }
}