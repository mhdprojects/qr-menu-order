import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantSlug } from '@/lib/tenant';
import { modifierSchema } from '@/lib/validations';
import { handleApiError, NotFoundError, UnauthorizedError } from '@/lib/error-handler';

// PUT update modifier
export async function PUT(
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

        const body = await request.json();
        const validatedData = modifierSchema.parse(body);

        const modifier = await prisma.menuModifier.update({
            where: {
                id: modifierId,
                menuItemId,
                tenantId: tenant.id,
                deletedAt: null,
            },
            data: {
                name: validatedData.name,
                isRequired: validatedData.is_required,
                maxSelect: validatedData.max_select,
            },
        });

        return NextResponse.json({ modifier });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleApiError(error);
        }

        console.error('Update modifier error:', error);
        return handleApiError(error);
    }
}

// DELETE modifier (soft delete)
export async function DELETE(
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

        const modifier = await prisma.menuModifier.update({
            where: {
                id: modifierId,
                menuItemId,
                tenantId: tenant.id,
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({ modifier });
    } catch (error) {
        console.error('Delete modifier error:', error);
        return handleApiError(error);
    }
}