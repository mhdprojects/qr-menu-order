'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerTenant, checkSlugAvailability } from '@/actions/auth';
import { generateSlug } from '@/lib/format';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    name: z.string().min(1, 'Nama resto harus diisi'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string(),
    slug: z.string()
        .min(3, 'Slug minimal 3 karakter')
        .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung')
        .optional()
        .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
});

type FormValues = z.infer<typeof formSchema>;

export function TenantRegisterForm() {
    const [isPending, startTransition] = useTransition();
    const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            slug: '',
        },
    });

    const watchName = form.watch('name');
    const watchSlug = form.watch('slug');

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        form.setValue('name', name);

        // Only auto-generate slug if user hasn't manually entered one
        if (!watchSlug || watchSlug === generateSlug(form.getValues('name'))) {
            const newSlug = generateSlug(name);
            form.setValue('slug', newSlug);
            if (newSlug) {
                checkSlug(newSlug);
            }
        }
    };

    const checkSlug = async (slug: string) => {
        if (slug.length < 3) {
            setSlugStatus('idle');
            return;
        }

        setSlugStatus('checking');
        try {
            const result = await checkSlugAvailability(slug);
            setSlugStatus(result.available ? 'available' : 'taken');
        } catch (error) {
            setSlugStatus('idle');
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const slug = e.target.value;
        form.setValue('slug', slug);
        if (slug) {
            checkSlug(slug);
        } else {
            setSlugStatus('idle');
        }
    };

    const onSubmit = async (data: FormValues) => {
        setError(null);

        startTransition(async () => {
            try {
                // Create FormData and append all form data
                const formData = new FormData();
                formData.append('name', data.name);
                formData.append('email', data.email);
                formData.append('password', data.password);
                formData.append('confirmPassword', data.confirmPassword);
                if (data.slug) {
                    formData.append('slug', data.slug);
                }

                const result = await registerTenant(formData);

                if (result?.error) {
                    setError(result.error);
                } else if (result?.redirectUrl) {
                    // Registration successful, redirect to tenant dashboard
                    window.location.href = result.redirectUrl;
                } else {
                    setError('Terjadi kesalahan saat mendaftar');
                }
            } catch (error) {
                setError('Terjadi kesalahan saat mendaftar');
            }
        });
    };

    const getSlugStatusColor = () => {
        switch (slugStatus) {
            case 'available':
                return 'text-green-600';
            case 'taken':
                return 'text-red-600';
            case 'checking':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    const getSlugStatusText = () => {
        switch (slugStatus) {
            case 'available':
                return 'Slug tersedia';
            case 'taken':
                return 'Slug sudah digunakan';
            case 'checking':
                return 'Memeriksa...';
            default:
                return watchSlug ? 'Masukkan minimal 3 karakter' : '';
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Nama Resto/Cafe</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Nama restoran atau cafe"
                    {...form.register('name')}
                    onChange={handleNameChange}
                    disabled={isPending}
                />
                {form.formState.errors.name && (
                    <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="email@restoran.com"
                    {...form.register('email')}
                    disabled={isPending}
                />
                {form.formState.errors.email && (
                    <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">ordermenu.com/</span>
                    </div>
                    <Input
                        id="slug"
                        type="text"
                        placeholder="nama-resto"
                        className="pl-32"
                        {...form.register('slug')}
                        onChange={handleSlugChange}
                        disabled={isPending}
                    />
                </div>
                {watchSlug && (
                    <p className={`text-sm ${getSlugStatusColor()}`}>
                        {getSlugStatusText()}
                    </p>
                )}
                {form.formState.errors.slug && (
                    <p className="text-sm text-red-600">{form.formState.errors.slug.message}</p>
                )}
                <p className="text-xs text-gray-500">
                    Slug akan digunakan sebagai URL unik untuk restoran Anda. Contoh: ordermenu.com/{watchSlug || 'nama-resto'}
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    {...form.register('password')}
                    disabled={isPending}
                />
                {form.formState.errors.password && (
                    <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ulangi password"
                    {...form.register('confirmPassword')}
                    disabled={isPending}
                />
                {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isPending || slugStatus === 'taken'}
            >
                {isPending ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>
        </form>
    );
}