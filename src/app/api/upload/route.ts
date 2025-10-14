import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentTenantSlug } from '@/lib/tenant';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file size (1MB max)
        if (file.size > 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size too large (max 1MB)' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `menu-items/${fileName}`;

        // Upload to Supabase Storage using service role
        const { data, error } = await supabaseAdmin.storage
            .from('images')
            .upload(filePath, file);

        if (error) {
            console.error('Upload error:', error);
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('images')
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrl,
            path: filePath
        });

    } catch (error) {
        console.error('Server upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}