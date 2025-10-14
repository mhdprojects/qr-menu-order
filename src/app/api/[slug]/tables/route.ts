import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantSlug } from '@/lib/tenant';
import { tableSchema } from '@/lib/validations';
import { handleApiError, NotFoundError, UnauthorizedError } from '@/lib/error-handler';

// GET all tables
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

        const tables = await prisma.table.findMany({
            where: {
                tenantId: tenant.id,
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ tables });
    } catch (error) {
        console.error('Get tables error:', error);
        return handleApiError(error);
    }
}

// POST create table
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
        const validatedData = tableSchema.parse(body);

        // Generate unique QR code token
        const qrcodeToken = `table_${Date.now()}_${Math.random().toString(36).substring(2)}`;

        const table = await prisma.table.create({
            data: {
                code: validatedData.code,
                name: validatedData.name,
                capacity: parseInt(validatedData.capacity),
                qrcodeToken,
                tenantId: tenant.id,
            },
        });

        return NextResponse.json({ table }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleApiError(error);
        }

        console.error('Create table error:', error);
        return handleApiError(error);
    }
}

// PUT update table
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
        const validatedData = tableSchema.parse(updateData);

        const table = await prisma.table.update({
            where: {
                id,
                tenantId: tenant.id,
                deletedAt: null,
            },
            data: {
                code: validatedData.code,
                name: validatedData.name,
                capacity: parseInt(validatedData.capacity),
            },
        });

        return NextResponse.json({ table });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleApiError(error);
        }

        console.error('Update table error:', error);
        return handleApiError(error);
    }
}

// DELETE table (soft delete)
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

        const table = await prisma.table.update({
            where: {
                id,
                tenantId: tenant.id,
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({ table });
    } catch (error) {
        console.error('Delete table error:', error);
        return handleApiError(error);
    }
}