export interface Category {
    id: string;
    tenantId: string;
    name: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface MenuItem {
    id: string;
    tenantId: string;
    categoryId: string;
    name: string;
    description?: string;
    basePrice: number;
    photoUrl?: string;
    availability: 'available' | 'unavailable';
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    category?: Category;
    variants?: Variant[];
    modifiers?: Modifier[];
}

export interface Variant {
    id: string;
    tenantId: string;
    menuItemId: string;
    name: string;
    priceDelta: number;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface Modifier {
    id: string;
    tenantId: string;
    menuItemId: string;
    name: string;
    isRequired: boolean;
    maxSelect?: number;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    options?: ModifierOption[];
}

export interface ModifierOption {
    id: string;
    tenantId: string;
    modifierId: string;
    name: string;
    priceDelta: number;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface CartItem {
    id: string;
    menuItem: MenuItem;
    variant?: Variant;
    modifiers: ModifierOption[];
    quantity: number;
    note: string;
}

export interface Table {
    id: string;
    tenantId: string;
    code: string;
    name: string;
    capacity: number;
    qrcodeToken: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface CartStore {
    items: CartItem[];
    addItem: (item: MenuItem, variant?: Variant, modifiers?: ModifierOption[]) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}