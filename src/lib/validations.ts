import { z } from 'zod';

// Auth validations
export const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z.object({
    name: z.string().min(1, 'Nama harus diisi'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
});

// Tenant validations
export const tenantSchema = z.object({
    name: z.string().min(1, 'Nama resto harus diisi'),
    email: z.string().email('Email tidak valid'),
    slug: z.string()
        .min(3, 'Slug minimal 3 karakter')
        .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung')
        .optional()
        .or(z.literal('')),
    password: z.string().min(6, 'Password minimal 6 karakter'),
});

// Menu validations
export const categorySchema = z.object({
    name: z.string().min(1, 'Nama kategori harus diisi'),
    is_active: z.boolean().default(true),
    sort_order: z.number().default(0),
});

export const menuItemSchema = z.object({
    name: z.string().min(1, 'Nama menu harus diisi'),
    description: z.string().optional(),
    base_price: z.string().min(1, 'Harga harus diisi').refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        'Harga harus berupa angka yang valid'
    ),
    category_id: z.string().min(1, 'Kategori harus dipilih'),
    availability: z.enum(['available', 'unavailable']).default('available'),
    photo_url: z.string().optional(),
});

export const variantSchema = z.object({
    name: z.string().min(1, 'Nama variant harus diisi'),
    price_delta: z.string().min(1, 'Perubahan harga harus diisi').refine(
        (val) => !isNaN(parseFloat(val)),
        'Perubahan harga harus berupa angka yang valid'
    ),
    sort_order: z.number().default(0),
});

export const modifierSchema = z.object({
    name: z.string().min(1, 'Nama modifier harus diisi'),
    is_required: z.boolean().default(false),
    max_select: z.number().optional(),
    sort_order: z.number().default(0),
});

export const modifierOptionSchema = z.object({
    name: z.string().min(1, 'Nama opsi harus diisi'),
    price_delta: z.union([
        z.string().refine((val) => !isNaN(parseFloat(val)), 'Perubahan harga harus berupa angka yang valid'),
        z.number()
    ]).transform((val) => typeof val === 'string' ? parseFloat(val) : val),
    sort_order: z.number().default(0),
});

// Table validations
export const tableSchema = z.object({
    code: z.string().min(1, 'Kode meja harus diisi'),
    name: z.string().min(1, 'Nama meja harus diisi'),
    capacity: z.string().min(1, 'Kapasitas harus diisi').refine(
        (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
        'Kapasitas harus berupa angka yang valid'
    ),
});

// Order validations
export const orderSchema = z.object({
    order_type: z.enum(['dine_in', 'take_away']),
    table_session_id: z.string().optional(),
    note: z.string().optional(),
});

export const orderItemSchema = z.object({
    menu_item_id: z.string().min(1, 'Menu harus dipilih'),
    quantity: z.number().min(1, 'Quantity minimal 1'),
    variant_id: z.string().optional(),
    modifier_ids: z.array(z.string()).default([]),
    note: z.string().optional(),
});

// Customer validations
export const customerSchema = z.object({
    name: z.string().min(1, 'Nama pelanggan harus diisi'),
    phone: z.string().min(1, 'Nomor telepon harus diisi'),
    email: z.string().email('Email tidak valid').optional().or(z.literal('')),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type TenantFormData = z.infer<typeof tenantSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type MenuItemFormData = z.infer<typeof menuItemSchema>;
export type VariantFormData = z.infer<typeof variantSchema>;
export type ModifierFormData = z.infer<typeof modifierSchema>;
export type ModifierOptionFormData = z.infer<typeof modifierOptionSchema>;
export type TableFormData = z.infer<typeof tableSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type OrderItemFormData = z.infer<typeof orderItemSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;