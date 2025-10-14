import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantSlug } from '@/lib/tenant';
import { categorySchema } from '@/lib/validations';
import { handleApiError, NotFoundError, UnauthorizedError } from '@/lib/error-handler';

// GET all categories
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

        const categories = await prisma.category.findMany({
            where: {
                tenantId: tenant.id,
                deletedAt: null,
            },
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'desc' },
            ],
        });

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        return handleApiError(error);
    }
}

// POST create category
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
        const validatedData = categorySchema.parse(body);

        // Get the highest sort order to place new category at the end
        const lastCategory = await prisma.category.findFirst({
            where: {
                tenantId: tenant.id,
                deletedAt: null,
            },
            orderBy: {
                sortOrder: 'desc',
            },
        });

        const sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 1;

        const category = await prisma.category.create({
            data: {
                name: validatedData.name,
                sortOrder,
                isActive: validatedData.is_active ?? true,
                tenantId: tenant.id,
            },
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleApiError(error);
        }

        console.error('Create category error:', error);
        return handleApiError(error);
    }
}

// PUT update category
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
        const validatedData = categorySchema.parse(updateData);

        const category = await prisma.category.update({
            where: {
                id,
                tenantId: tenant.id,
                deletedAt: null,
            },
            data: {
                name: validatedData.name,
                isActive: validatedData.is_active,
            },
        });

        return NextResponse.json({ category });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleApiError(error);
        }

        console.error('Update category error:', error);
        return handleApiError(error);
    }
}

// DELETE category (soft delete)
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

        const category = await prisma.category.update({
            where: {
                id,
                tenantId: tenant.id,
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({ category });
    } catch (error) {
        console.error('Delete category error:', error);
        return handleApiError(error);
    }
}