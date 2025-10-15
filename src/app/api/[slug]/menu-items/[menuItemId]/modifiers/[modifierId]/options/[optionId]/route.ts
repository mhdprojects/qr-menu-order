import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, NotFoundError } from '@/lib/error-handler';

// DELETE modifier option (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; menuItemId: string; modifierId: string; optionId: string }> }
) {
    try {
        const { slug, menuItemId, modifierId, optionId } = await params;

        // Get tenant by slug to get the tenantId
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            return handleApiError(new NotFoundError('Tenant not found'));
        }

        // Verify option exists and belongs to the modifier
        const option = await prisma.menuModifierOption.findFirst({
            where: {
                id: optionId,
                modifierId,
                tenantId: tenant.id,
                deletedAt: null,
            },
        });

        if (!option) {
            return handleApiError(new NotFoundError('Modifier option not found'));
        }

        // Soft delete the option
        const deletedOption = await prisma.menuModifierOption.update({
            where: {
                id: optionId,
                tenantId: tenant.id,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({ option: deletedOption });
    } catch (error) {
        console.error('Delete modifier option error:', error);
        return handleApiError(error);
    }
}