import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations';
import { createJWT, verifyPassword } from '@/lib/auth';
import type { User, Tenant, TenantUser } from '@/types/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body
        const validatedData = loginSchema.parse(body);

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
            include: {
                tenantUsers: {
                    include: {
                        tenant: true,
                    },
                },
            },
        }) as (User & { tenantUsers: (TenantUser & { tenant: Tenant })[] }) | null;

        if (!user) {
            return NextResponse.json(
                { error: 'Email atau password salah' },
                { status: 401 }
            );
        }

        // Check password
        const isPasswordValid = await verifyPassword(
            validatedData.password,
            user.password
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Email atau password salah' },
                { status: 401 }
            );
        }

        // Get user's tenant(s)
        const tenants = user.tenantUsers.map((tu: any) => tu.tenant);

        // Create JWT token
        const token = await createJWT({
            userId: user.id,
            email: user.email,
            name: user.name,
            tenants: tenants.map((t: any) => ({ id: t.id, slug: t.slug, name: t.name })),
        });

        // Set HTTP-only cookie
        const response = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                tenants: tenants.map((t: any) => ({ id: t.id, slug: t.slug, name: t.name })),
            },
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Data tidak valid', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}