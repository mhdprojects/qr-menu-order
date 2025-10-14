'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicUser, Tenant } from '@/types/auth';

interface AuthState {
    user: PublicUser | null;
    tenants: Tenant[];
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<{ success?: boolean; error?: string }>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        tenants: [],
        isLoading: true,
        isAuthenticated: false,
    });

    const router = useRouter();

    const refresh = async () => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true }));

            const response = await fetch('/api/auth/me');

            if (response.ok) {
                const data = await response.json();
                setAuthState({
                    user: data.user,
                    tenants: data.tenants || [],
                    isLoading: false,
                    isAuthenticated: true,
                });
            } else {
                setAuthState({
                    user: null,
                    tenants: [],
                    isLoading: false,
                    isAuthenticated: false,
                });
            }
        } catch (error) {
            console.error('Auth refresh error:', error);
            setAuthState({
                user: null,
                tenants: [],
                isLoading: false,
                isAuthenticated: false,
            });
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                await refresh();
                return { success: true };
            } else {
                const data = await response.json();
                return { error: data.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { error: 'Terjadi kesalahan saat login' };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });

            setAuthState({
                user: null,
                tenants: [],
                isLoading: false,
                isAuthenticated: false,
            });

            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const contextValue: AuthContextType = {
        ...authState,
        login,
        logout,
        refresh,
    };

    return React.createElement(
        AuthContext.Provider,
        { value: contextValue },
        children
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Hook to get current tenant
export function useCurrentTenant(slug?: string) {
    const { tenants } = useAuth();

    if (!slug) return null;

    return tenants.find(tenant => tenant.slug === slug) || null;
}

// Hook to check if user has access to tenant
export function useTenantAccess(slug?: string) {
    const { tenants, isAuthenticated } = useAuth();

    if (!isAuthenticated || !slug) return false;

    return tenants.some(tenant => tenant.slug === slug);
}

// Hook to get user's first tenant (for redirect)
export function useFirstTenant() {
    const { tenants, isAuthenticated } = useAuth();

    if (!isAuthenticated || tenants.length === 0) return null;

    return tenants[0];
}