import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Tenant } from '@/types/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Find tenant by slug
        const tenant = await prisma.tenant.findUnique({
            where: {
                slug,
                isActive: true, // Only return active tenants
            },
        });

        if (!tenant) {
            return NextResponse.json(
                { error: 'Tenant tidak ditemukan' },
                { status: 404 }
            );
        }

        // Extract tenant data
        const tenantData: Tenant = {
            id: tenant.id,
            name: tenant.name,
            email: tenant.email,
            slug: tenant.slug,
            isActive: tenant.isActive,
            createdAt: tenant.createdAt.toISOString(),
            updatedAt: tenant.updatedAt.toISOString(),
        };

        return NextResponse.json({
            tenant: tenantData,
        });
    } catch (error) {
        console.error('Get tenant error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}