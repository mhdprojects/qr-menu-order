import { NextResponse } from 'next/server';
import { createLogoutResponse } from '@/lib/auth';

export async function POST() {
    try {
        return createLogoutResponse();
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}