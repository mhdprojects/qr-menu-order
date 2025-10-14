export interface Customer {
    id: string;
    tenantId: string;
    name?: string;
    phone?: string;
    email?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
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
    sessions?: TableSession[];
}

export interface TableSession {
    id: string;
    tenantId: string;
    tableId: string;
    customerId?: string;
    startedAt: string;
    endedAt?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    table?: Table;
    customer?: Customer;
    orders?: Order[];
}

export interface Order {
    id: string;
    tenantId: string;
    orderType: 'dine_in' | 'take_away';
    tableSessionId?: string;
    orderNumber: string;
    status: 'placed' | 'preparing' | 'ready' | 'served' | 'canceled';
    note?: string;
    subtotalAmount: number;
    discountAmount: number;
    serviceChargeAmount: number;
    taxAmount: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    tableSession?: TableSession;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    tenantId: string;
    orderId: string;
    menuItemId: string;
    nameSnapshot: string;
    basePriceSnapshot: number;
    qty: number;
    note?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    variants?: OrderItemVariant[];
    modifiers?: OrderItemModifier[];
}

export interface OrderItemVariant {
    id: string;
    tenantId: string;
    orderItemId: string;
    variantId: string;
    nameSnapshot: string;
    priceDeltaSnapshot: number;
    createdAt: string;
}

export interface OrderItemModifier {
    id: string;
    tenantId: string;
    orderItemId: string;
    modifierId: string;
    optionId: string;
    nameSnapshot: string;
    priceDeltaSnapshot: number;
    createdAt: string;
}

export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'served' | 'canceled';
export type OrderType = 'dine_in' | 'take_away';

export interface CreateOrderData {
    orderType: OrderType;
    tableSessionId?: string;
    items: {
        menuItemId: string;
        quantity: number;
        variantId?: string;
        modifierIds: string[];
        note?: string;
    }[];
    customerInfo?: {
        name?: string;
        phone?: string;
        email?: string;
    };
    note?: string;
}