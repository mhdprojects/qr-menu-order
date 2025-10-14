import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { PublicUser, Tenant } from '@/types/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user details with tenants
        const user = await prisma.user.findUnique({
            where: { id: session.userId as string },
            include: {
                tenantUsers: {
                    include: {
                        tenant: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Extract public user data
        const publicUser: PublicUser = {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };

        // Extract tenants
        const tenants: Tenant[] = user.tenantUsers.map((tu: any) => tu.tenant);

        return NextResponse.json({
            user: publicUser,
            tenants,
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}