import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const checkSlugSchema = z.object({
    slug: z.string().min(3, 'Slug minimal 3 karakter'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body
        const validatedData = checkSlugSchema.parse(body);

        // Check if slug already exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { slug: validatedData.slug },
        });

        const isAvailable = !existingTenant;

        return NextResponse.json({
            slug: validatedData.slug,
            available: isAvailable,
            message: isAvailable ? 'Slug tersedia' : 'Slug sudah digunakan',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Data tidak valid', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Check slug error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}