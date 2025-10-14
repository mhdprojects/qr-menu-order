import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantSlug } from '@/lib/tenant';
import { variantSchema } from '@/lib/validations';
import { handleApiError, NotFoundError, UnauthorizedError } from '@/lib/error-handler';

// GET variants for a menu item
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; menuItemId: string }> }
) {
    try {
        const { slug, menuItemId } = await params;

        // Get tenant by slug to get the tenantId
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            return handleApiError(new NotFoundError('Tenant not found'));
        }

        // Verify menu item belongs to tenant
        const menuItem = await prisma.menuItem.findFirst({
            where: {
                id: menuItemId,
                tenantId: tenant.id,
                deletedAt: null,
            },
        });

        if (!menuItem) {
            return handleApiError(new NotFoundError('Menu item not found'));
        }

        const variants = await prisma.menuVariant.findMany({
            where: {
                menuItemId,
                tenantId: tenant.id,
                deletedAt: null,
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });

        return NextResponse.json({ variants });
    } catch (error) {
        console.error('Get variants error:', error);
        return handleApiError(error);
    }
}

// POST create variant
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; menuItemId: string }> }
) {
    try {
        const { slug, menuItemId } = await params;

        // Get tenant by slug to get the tenantId
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            return handleApiError(new NotFoundError('Tenant not found'));
        }

        // Verify menu item belongs to tenant
        const menuItem = await prisma.menuItem.findFirst({
            where: {
                id: menuItemId,
                tenantId: tenant.id,
                deletedAt: null,
            },
        });

        if (!menuItem) {
            return handleApiError(new NotFoundError('Menu item not found'));
        }

        const body = await request.json();
        const validatedData = variantSchema.parse(body);

        // Get the highest sort order
        const lastVariant = await prisma.menuVariant.findFirst({
            where: {
                menuItemId,
                tenantId: tenant.id,
                deletedAt: null,
            },
            orderBy: {
                sortOrder: 'desc',
            },
        });

        const sortOrder = lastVariant ? lastVariant.sortOrder + 1 : 1;

        const variant = await prisma.menuVariant.create({
            data: {
                name: validatedData.name,
                priceDelta: parseFloat(validatedData.price_delta),
                sortOrder,
                menuItemId,
                tenantId: tenant.id,
            },
        });

        return NextResponse.json({ variant }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleApiError(error);
        }

        console.error('Create variant error:', error);
        return handleApiError(error);
    }
}