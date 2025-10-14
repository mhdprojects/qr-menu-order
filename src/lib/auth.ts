import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret-key-for-development'
);

const cookieName = 'auth-token';

export async function createJWT(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secretKey);
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getSession(request?: NextRequest) {
    let token: string | undefined;

    if (request) {
        token = request.cookies.get(cookieName)?.value;
    } else {
        // For server components, we'll need to use a different approach
        // This is a simplified version for now
        return null;
    }

    if (!token) {
        return null;
    }

    return await verifyJWT(token);
}

export function createLogoutResponse() {
    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });
    return response;
}

export async function updateSession(request: NextRequest) {
    const token = request.cookies.get(cookieName)?.value;

    if (!token) {
        return null;
    }

    const payload = await verifyJWT(token);

    if (!payload) {
        return null;
    }

    // Refresh token if it's close to expiring
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp as number;

    if (exp - now < 60 * 60 * 24) { // Less than 1 day left
        const newToken = await createJWT(payload);

        const response = NextResponse.json({ success: true });
        response.cookies.set(cookieName, newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return { response, payload };
    }

    return { payload };
}

export async function hashPassword(password: string) {
    const { hash } = await import('bcryptjs');
    return await hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string) {
    const { compare } = await import('bcryptjs');
    return await compare(password, hashedPassword);
}