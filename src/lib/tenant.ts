import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { Tenant } from '@/types/auth';

// Get current tenant from request headers
export async function getCurrentTenantSlug(): Promise<string | null> {
    try {
        const headersList = await headers();
        return headersList.get('x-tenant-slug');
    } catch (error) {
        // Fallback for environments where headers are not available
        return null;
    }
}

// Get current user from request headers
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const headersList = await headers();
        return headersList.get('x-user-id');
    } catch (error) {
        // Fallback for environments where headers are not available
        return null;
    }
}

// Get current user email from request headers
export async function getCurrentUserEmail(): Promise<string | null> {
    try {
        const headersList = await headers();
        return headersList.get('x-user-email');
    } catch (error) {
        // Fallback for environments where headers are not available
        return null;
    }
}

// Get tenant by slug
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: {
                slug,
                isActive: true,
            },
        });

        if (!tenant) {
            return null;
        }

        return {
            id: tenant.id,
            name: tenant.name,
            email: tenant.email,
            slug: tenant.slug,
            isActive: tenant.isActive,
            createdAt: tenant.createdAt.toISOString(),
            updatedAt: tenant.updatedAt.toISOString(),
        };
    } catch (error) {
        console.error('Get tenant error:', error);
        return null;
    }
}

// Get tenant with user access check
export async function getTenantWithAccessCheck(
    slug: string,
    userId: string
): Promise<{ tenant: Tenant | null; hasAccess: boolean }> {
    try {
        const tenantUser = await prisma.tenantUser.findFirst({
            where: {
                userId,
                tenant: {
                    slug,
                    isActive: true,
                },
            },
            include: {
                tenant: true,
            },
        });

        if (!tenantUser) {
            return { tenant: null, hasAccess: false };
        }

        const tenant: Tenant = {
            id: tenantUser.tenant.id,
            name: tenantUser.tenant.name,
            email: tenantUser.tenant.email,
            slug: tenantUser.tenant.slug,
            isActive: tenantUser.tenant.isActive,
            createdAt: tenantUser.tenant.createdAt.toISOString(),
            updatedAt: tenantUser.tenant.updatedAt.toISOString(),
        };

        return { tenant, hasAccess: true };
    } catch (error) {
        console.error('Get tenant with access check error:', error);
        return { tenant: null, hasAccess: false };
    }
}

// Check if user has access to tenant
export async function checkUserTenantAccess(
    slug: string,
    userId: string
): Promise<boolean> {
    try {
        const tenantUser = await prisma.tenantUser.findFirst({
            where: {
                userId,
                tenant: {
                    slug,
                    isActive: true,
                },
            },
        });

        return !!tenantUser;
    } catch (error) {
        console.error('Check user tenant access error:', error);
        return false;
    }
}

// Get tenant database context for queries
export function getTenantContext(tenantId: string) {
    return {
        tenantId,
        // Add other tenant-specific context here if needed
    };
}

// Validate tenant exists and is active
export async function validateTenant(slug: string): Promise<boolean> {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { isActive: true },
        });

        return !!tenant && tenant.isActive;
    } catch (error) {
        console.error('Validate tenant error:', error);
        return false;
    }
}

// Get tenant stats (for dashboard)
export async function getTenantStats(tenantId: string) {
    try {
        const [
            totalOrders,
            totalMenuItems,
            totalTables,
            activeSessions,
        ] = await Promise.all([
            prisma.order.count({
                where: { tenantId },
            }),
            prisma.menuItem.count({
                where: {
                    tenantId,
                    deletedAt: null,
                },
            }),
            prisma.table.count({
                where: {
                    tenantId,
                    deletedAt: null,
                },
            }),
            prisma.tableSession.count({
                where: {
                    tenantId,
                    isActive: true,
                },
            }),
        ]);

        return {
            totalOrders,
            totalMenuItems,
            totalTables,
            activeSessions,
        };
    } catch (error) {
        console.error('Get tenant stats error:', error);
        return {
            totalOrders: 0,
            totalMenuItems: 0,
            totalTables: 0,
            activeSessions: 0,
        };
    }
}