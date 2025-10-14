import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantSlug } from '@/lib/tenant';
import { menuItemSchema } from '@/lib/validations';
import { handleApiError, NotFoundError, UnauthorizedError } from '@/lib/error-handler';

// GET all menu items
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Get tenant by slug to get the tenantId
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            return handleApiError(new NotFoundError('Tenant not found'));
        }

        const menuItems = await prisma.menuItem.findMany({
            where: {
                tenantId: tenant.id,
                deletedAt: null,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                variants: {
                    where: { deletedAt: null },
                    orderBy: { sortOrder: 'asc' },
                },
                modifiers: {
                    where: { deletedAt: null },
                    include: {
                        options: {
                            where: { deletedAt: null },
                            orderBy: { sortOrder: 'asc' },
                        },
                    },
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: [
                { category: { sortOrder: 'asc' } },
                { createdAt: 'desc' },
            ],
        });

        return NextResponse.json({ menuItems });
    } catch (error) {
        console.error('Get menu items error:', error);
        return handleApiError(error);
    }
}

// POST create menu item
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Get tenant by slug to get the tenantId
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            return handleApiError(new NotFoundError('Tenant not found'));
        }

        const body = await request.json();
        const validatedData = menuItemSchema.parse(body);

        const menuItem = await prisma.menuItem.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                basePrice: parseFloat(validatedData.base_price),
                categoryId: validatedData.category_id,
                availability: validatedData.availability,
                photoUrl: validatedData.photo_url,
                tenantId: tenant.id,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({ menuItem }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleApiError(error);
        }

        console.error('Create menu item error:', error);
        return handleApiError(error);
    }
}

// PUT update menu item
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Get tenant by slug to get the tenantId
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            return handleApiError(new NotFoundError('Tenant not found'));
        }

        const { id, ...updateData } = await request.json();
        const validatedData = menuItemSchema.parse(updateData);

        const menuItem = await prisma.menuItem.update({
            where: {
                id,
                tenantId: tenant.id,
                deletedAt: null,
            },
            data: {
                name: validatedData.name,
                description: validatedData.description,
                basePrice: parseFloat(validatedData.base_price),
                categoryId: validatedData.category_id,
                availability: validatedData.availability,
                photoUrl: validatedData.photo_url,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({ menuItem });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleApiError(error);
        }

        console.error('Update menu item error:', error);
        return handleApiError(error);
    }
}

// DELETE menu item (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Get tenant by slug to get the tenantId
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            return handleApiError(new NotFoundError('Tenant not found'));
        }

        const { id } = await request.json();

        const menuItem = await prisma.menuItem.update({
            where: {
                id,
                tenantId: tenant.id,
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({ menuItem });
    } catch (error) {
        console.error('Delete menu item error:', error);
        return handleApiError(error);
    }
}