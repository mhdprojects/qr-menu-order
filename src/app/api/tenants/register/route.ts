import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { tenantSchema } from '@/lib/validations';
import { createJWT, hashPassword } from '@/lib/auth';
import { generateSlug } from '@/lib/format';
import { ConflictError, ValidationError, handleApiError } from '@/lib/error-handler';
import type { PublicUser, Tenant } from '@/types/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body
        const validatedData = tenantSchema.parse(body);

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            throw new ConflictError('Email sudah digunakan');
        }

        // Generate slug if not provided
        let slug = validatedData.slug;
        if (!slug) {
            slug = generateSlug(validatedData.name);
        }

        // Check if slug already exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { slug },
        });

        if (existingTenant) {
            throw new ConflictError('Slug sudah digunakan, silakan pilih yang lain');
        }

        // Hash password
        const hashedPassword = await hashPassword(validatedData.password);

        // Create tenant and user in a transaction
        const result = await prisma.$transaction(async (tx: any) => {
            try {
                // Create user
                const user = await tx.user.create({
                    data: {
                        email: validatedData.email,
                        password: hashedPassword,
                        name: validatedData.name,
                    },
                });

                // Create tenant
                const tenant = await tx.tenant.create({
                    data: {
                        name: validatedData.name,
                        email: validatedData.email,
                        slug,
                    },
                });

                // Create tenant user (admin)
                const tenantUser = await tx.tenantUser.create({
                    data: {
                        tenantId: tenant.id,
                        userId: user.id,
                        role: 'admin',
                    },
                });

                return { user, tenant, tenantUser };
            } catch (error) {
                // Log the error for debugging
                console.error('Transaction error:', error);
                throw new Error('Gagal membuat tenant dan user');
            }
        });

        // Create JWT token
        const token = await createJWT({
            userId: result.user.id,
            email: result.user.email,
            name: result.user.name,
            tenants: [{ id: result.tenant.id, slug: result.tenant.slug, name: result.tenant.name }],
        });

        // Extract public user data
        const publicUser: PublicUser = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name || undefined,
            createdAt: result.user.createdAt.toISOString(),
            updatedAt: result.user.updatedAt.toISOString(),
        };

        // Extract tenant data
        const tenant: Tenant = {
            id: result.tenant.id,
            name: result.tenant.name,
            email: result.tenant.email,
            slug: result.tenant.slug,
            isActive: result.tenant.isActive,
            createdAt: result.tenant.createdAt.toISOString(),
            updatedAt: result.tenant.updatedAt.toISOString(),
        };

        // Set HTTP-only cookie
        const response = NextResponse.json({
            user: publicUser,
            tenant,
            message: 'Registrasi berhasil',
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
        console.error('Tenant registration error:', error);
        return handleApiError(error);
    }
}