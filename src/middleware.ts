import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

// Define public routes that don't require authentication
const publicRoutes = [
    '/',
    '/register',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/me',
    '/api/tenants/register',
    '/api/tenants/check-slug',
    '/api/tenants/[slug]',
];

// Define tenant routes that require tenant context
const tenantRoutes = [
    '/[slug]',
    '/[slug]/menu',
    '/[slug]/cart',
    '/[slug]/checkout',
    '/[slug]/order-status',
];

// Define admin routes that require authentication
const adminRoutes = [
    '/[slug]/admin',
    '/[slug]/admin/categories',
    '/[slug]/admin/menu-items',
    '/[slug]/admin/tables',
    '/[slug]/admin/orders',
    '/[slug]/admin/customers',
    '/[slug]/admin/settings',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Extract tenant slug from URL if it matches tenant pattern
    const slugMatch = pathname.match(/^\/([^\/]+)/);
    const slug = slugMatch ? slugMatch[1] : null;

    // Check if this is a tenant route
    const isTenantRoute = slug && (
        tenantRoutes.some(route => pathname.startsWith(route.replace('[slug]', slug))) ||
        adminRoutes.some(route => pathname.startsWith(route.replace('[slug]', slug)))
    );

    // Check if this is an admin route
    const isAdminRoute = slug && adminRoutes.some(route =>
        pathname.startsWith(route.replace('[slug]', slug))
    );

    // Get auth token from cookies
    const token = request.cookies.get('auth-token')?.value;

    // For admin routes, verify authentication
    if (isAdminRoute) {
        if (!token) {
            // Redirect to login page for the tenant
            return NextResponse.redirect(new URL(`/${slug}/login`, request.url));
        }

        try {
            const payload = await verifyJWT(token);

            if (!payload) {
                // Invalid token, redirect to login
                return NextResponse.redirect(new URL(`/${slug}/login`, request.url));
            }

            // Check if user has access to this tenant
            const userTenants = (payload as any).tenants || [];
            const hasAccess = Array.isArray(userTenants) && userTenants.some((t: any) => t.slug === slug);

            if (!hasAccess) {
                // User doesn't have access to this tenant
                return NextResponse.redirect(new URL('/', request.url));
            }

            // Add user and tenant info to request headers
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-user-id', (payload as any).userId as string);
            requestHeaders.set('x-user-email', (payload as any).email as string);
            requestHeaders.set('x-tenant-slug', slug);

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        } catch (error) {
            console.error('Middleware auth error:', error);
            return NextResponse.redirect(new URL(`/${slug}/login`, request.url));
        }
    }

    // For tenant public routes, add tenant context
    if (isTenantRoute && slug) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-tenant-slug', slug);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // For public routes, continue without modification
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};