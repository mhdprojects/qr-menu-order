export interface User {
    id: string;
    email: string;
    password: string;
    name?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Tenant {
    id: string;
    slug: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TenantUser {
    id: string;
    tenantId: string;
    userId: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    tenant?: Tenant;
    user?: User;
}

export interface AuthState {
    user: User | null;
    tenant: Tenant | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface TenantRegisterData {
    name: string;
    email: string;
    password: string;
    slug?: string;
}

// Public user interface (without password)
export interface PublicUser {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
    updatedAt: string;
}