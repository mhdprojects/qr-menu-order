import { NextResponse } from 'next/server';

// Custom error classes
export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string, public field?: string) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT');
        this.name = 'ConflictError';
    }
}

// Handle API errors
export function handleApiError(error: unknown): NextResponse {
    if (error instanceof AppError) {
        return NextResponse.json(
            {
                error: error.message,
                code: error.code,
                field: error instanceof ValidationError ? error.field : undefined,
            },
            { status: error.statusCode }
        );
    }

    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
        return NextResponse.json(
            {
                error: 'Validation error',
                code: 'VALIDATION_ERROR',
                details: (error as any).issues,
            },
            { status: 400 }
        );
    }

    // Log unexpected errors
    console.error('Unexpected error:', error);

    return NextResponse.json(
        {
            error: 'Internal server error',
            code: 'INTERNAL_SERVER_ERROR'
        },
        { status: 500 }
    );
}

// Handle form action errors
export function handleActionError(error: unknown): { error: string; field?: string } {
    if (error instanceof ValidationError) {
        return {
            error: error.message,
            field: error.field,
        };
    }

    if (error instanceof AppError) {
        return {
            error: error.message,
        };
    }

    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
        const firstIssue = (error as any).issues[0];
        return {
            error: firstIssue?.message || 'Validation error',
            field: firstIssue?.path?.join('.'),
        };
    }

    console.error('Unexpected action error:', error);

    return {
        error: 'Terjadi kesalahan server',
    };
}

// Log error with context
export function logError(error: unknown, context?: Record<string, any>) {
    const errorInfo = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        context,
        timestamp: new Date().toISOString(),
    };

    console.error('Application error:', errorInfo);

    // Here you could also send to external logging service
    // like Sentry, LogRocket, etc.
}

// Async error wrapper for server actions
export function withErrorHandler<T extends any[], R>(
    fn: (...args: T) => Promise<R>
) {
    return async (...args: T): Promise<R | { error: string; field?: string }> => {
        try {
            return await fn(...args);
        } catch (error) {
            return handleActionError(error);
        }
    };
}

// Create consistent error responses
export const createErrorResponse = {
    validation: (message: string, field?: string) => ({
        error: message,
        code: 'VALIDATION_ERROR',
        field,
        status: 400,
    }),

    notFound: (resource: string) => ({
        error: `${resource} not found`,
        code: 'NOT_FOUND',
        status: 404,
    }),

    unauthorized: (message?: string) => ({
        error: message || 'Unauthorized',
        code: 'UNAUTHORIZED',
        status: 401,
    }),

    forbidden: (message?: string) => ({
        error: message || 'Forbidden',
        code: 'FORBIDDEN',
        status: 403,
    }),

    conflict: (message: string) => ({
        error: message,
        code: 'CONFLICT',
        status: 409,
    }),

    server: (message?: string) => ({
        error: message || 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
    }),
};