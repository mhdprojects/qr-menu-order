'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/actions/auth';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
    tenantSlug: string;
    tenantName: string;
}

export function LoginForm({ tenantSlug, tenantName }: LoginFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: FormValues) => {
        setError(null);

        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('email', data.email);
                formData.append('password', data.password);

                const result = await login(formData);

                if (result?.error) {
                    setError(result.error);
                } else if (result?.redirectUrl) {
                    // Login successful, redirect to tenant dashboard
                    window.location.href = result.redirectUrl;
                } else {
                    // Fallback: redirect to tenant dashboard
                    window.location.href = `/${tenantSlug}/admin`;
                }
            } catch (error) {
                setError('Terjadi kesalahan saat login');
                console.error('Login error:', error);
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    {...form.register('email')}
                    disabled={isPending}
                />
                {form.formState.errors.email && (
                    <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    {...form.register('password')}
                    disabled={isPending}
                />
                {form.formState.errors.password && (
                    <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isPending}
            >
                {isPending ? 'Login...' : 'Login'}
            </Button>
        </form>
    );
}