import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { modifierOptionSchema } from '@/lib/validations';
import { handleApiError, NotFoundError } from '@/lib/error-handler';

// POST create modifier option
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; menuItemId: string; modifierId: string }> }
) {
    try {
        const { slug, menuItemId, modifierId } = await params;

        // Get tenant by slug to get the tenantId
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            return handleApiError(new NotFoundError('Tenant not found'));
        }

        // Verify modifier exists
        const modifier = await prisma.menuModifier.findFirst({
            where: {
                id: modifierId,
                menuItemId,
                tenantId: tenant.id,
                deletedAt: null,
            },
        });

        if (!modifier) {
            return handleApiError(new NotFoundError('Modifier not found'));
        }

        const body = await request.json();
        const validatedData = modifierOptionSchema.parse(body);

        // Get max sort order for this modifier
        const maxSortOrder = await prisma.menuModifierOption.aggregate({
            where: {
                modifierId,
                tenantId: tenant.id,
                deletedAt: null,
            },
            _max: {
                sortOrder: true,
            },
        });

        const option = await prisma.menuModifierOption.create({
            data: {
                tenantId: tenant.id,
                modifierId,
                name: validatedData.name,
                priceDelta: validatedData.price_delta,
                sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
            },
        });

        return NextResponse.json({ option });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleApiError(error);
        }

        console.error('Create modifier option error:', error);
        return handleApiError(error);
    }
}