import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantSlug } from '@/lib/tenant';
import { modifierSchema } from '@/lib/validations';
import { handleApiError, NotFoundError, UnauthorizedError } from '@/lib/error-handler';

// GET modifiers for a menu item
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

        const modifiers = await prisma.menuModifier.findMany({
            where: {
                menuItemId,
                tenantId: tenant.id,
                deletedAt: null,
            },
            include: {
                options: {
                    where: { deletedAt: null },
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });

        return NextResponse.json({ modifiers });
    } catch (error) {
        console.error('Get modifiers error:', error);
        return handleApiError(error);
    }
}

// POST create modifier
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
        const validatedData = modifierSchema.parse(body);

        // Get the highest sort order
        const lastModifier = await prisma.menuModifier.findFirst({
            where: {
                menuItemId,
                tenantId: tenant.id,
                deletedAt: null,
            },
            orderBy: {
                sortOrder: 'desc',
            },
        });

        const sortOrder = lastModifier ? lastModifier.sortOrder + 1 : 1;

        const modifier = await prisma.menuModifier.create({
            data: {
                name: validatedData.name,
                isRequired: validatedData.is_required,
                maxSelect: validatedData.max_select,
                sortOrder,
                menuItemId,
                tenantId: tenant.id,
            },
        });

        return NextResponse.json({ modifier }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleApiError(error);
        }

        console.error('Create modifier error:', error);
        return handleApiError(error);
    }
}