'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { loginSchema, registerSchema, tenantSchema } from '@/lib/validations';
import { createJWT, hashPassword, verifyPassword, createLogoutResponse } from '@/lib/auth';
import { generateSlug } from '@/lib/format';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { PublicUser, Tenant } from '@/types/auth';

// Login action
export async function login(formData: FormData) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // Validate form data
        const validatedData = loginSchema.parse({ email, password });

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
        }) as any;

        if (!user) {
            return { error: 'Email atau password salah' };
        }

        // Check password
        const isPasswordValid = await verifyPassword(
            validatedData.password,
            user.password
        );

        if (!isPasswordValid) {
            return { error: 'Email atau password salah' };
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
        const cookieStore = await cookies();
        cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Return tenant info for client-side redirect
        return {
            success: true,
            redirectUrl: tenants.length > 0 ? `/${tenants[0].slug}/admin` : '/'
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: 'Data tidak valid', details: error.issues };
        }

        console.error('Login error:', error);
        return { error: 'Terjadi kesalahan server' };
    }
}

// Logout action
export async function logout() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('auth-token');

        redirect('/');
    } catch (error) {
        console.error('Logout error:', error);
        return { error: 'Terjadi kesalahan server' };
    }
}

// Register tenant action
export async function registerTenant(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const slug = formData.get('slug') as string;

        // Validate form data
        const validatedData = { name, email, password, slug };
        const validated = tenantSchema.parse(validatedData);

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email },
        });

        if (existingUser) {
            return { error: 'Email sudah digunakan' };
        }

        // Generate slug if not provided
        let finalSlug = validated.slug;
        if (!finalSlug) {
            finalSlug = generateSlug(validated.name);
        }

        // Check if slug already exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { slug: finalSlug },
        });

        if (existingTenant) {
            return { error: 'Slug sudah digunakan, silakan pilih yang lain' };
        }

        // Hash password
        const hashedPassword = await hashPassword(validated.password);

        // Create tenant and user in a transaction
        const result = await prisma.$transaction(async (tx: any) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email: validated.email,
                    password: hashedPassword,
                    name: validated.name,
                },
            });

            // Create tenant
            const tenant = await tx.tenant.create({
                data: {
                    name: validated.name,
                    email: validated.email,
                    slug: finalSlug,
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
        });

        // Create JWT token
        const token = await createJWT({
            userId: result.user.id,
            email: result.user.email,
            name: result.user.name,
            tenants: [{ id: result.tenant.id, slug: result.tenant.slug, name: result.tenant.name }],
        });

        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Return tenant info for client-side redirect
        return {
            success: true,
            redirectUrl: `/${result.tenant.slug}/admin`,
            tenant: {
                id: result.tenant.id,
                name: result.tenant.name,
                slug: result.tenant.slug,
            }
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: 'Data tidak valid', details: error.issues };
        }

        console.error('Tenant registration error:', error);
        return { error: 'Terjadi kesalahan server' };
    }
}

// Get current user action
export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return null;
        }

        // Verify token
        const { verifyJWT } = await import('@/lib/auth');
        const payload = await verifyJWT(token);

        if (!payload) {
            return null;
        }

        // Get user details with tenants
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            include: {
                tenantUsers: {
                    include: {
                        tenant: true,
                    },
                },
            },
        });

        if (!user) {
            return null;
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

        return {
            user: publicUser,
            tenants,
        };
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

// Check slug availability action
export async function checkSlugAvailability(slug: string) {
    try {
        // Check if slug already exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { slug },
        });

        const isAvailable = !existingTenant;

        return {
            slug,
            available: isAvailable,
            message: isAvailable ? 'Slug tersedia' : 'Slug sudah digunakan',
        };
    } catch (error) {
        console.error('Check slug error:', error);
        return {
            slug,
            available: false,
            message: 'Terjadi kesalahan server',
        };
    }
}