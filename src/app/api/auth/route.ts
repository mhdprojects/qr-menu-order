import { NextRequest, NextResponse } from 'next/server';

// Mock handler - akan diimplementasikan setelah Supabase setup
export async function GET(request: NextRequest) {
    return NextResponse.json({ message: 'Auth API endpoint' });
}

export async function POST(request: NextRequest) {
    return NextResponse.json({ message: 'Auth API endpoint' });
}