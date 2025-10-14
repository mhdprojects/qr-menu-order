import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantSlug } from '@/lib/tenant';
import { orderSchema, orderItemSchema } from '@/lib/validations';
import { handleApiError, NotFoundError, UnauthorizedError } from '@/lib/error-handler';

// POST create order
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Get tenant by slug to get the tenantId
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            return handleApiError(new NotFoundError('Tenant not found'));
        }

        const body = await request.json();
        const validatedData = z.object({
            orderType: z.enum(['dine_in', 'take_away']),
            tableSessionId: z.string().optional(),
            customerName: z.string().optional(),
            customerPhone: z.string().optional(),
            customerEmail: z.string().optional(),
            note: z.string().optional(),
            items: z.array(z.object({
                menuItemId: z.string(),
                variantId: z.string().optional(),
                modifierIds: z.array(z.string()).default([]),
                quantity: z.number().min(1),
                note: z.string().optional(),
                nameSnapshot: z.string(),
                basePriceSnapshot: z.number(),
            })),
        }).parse(body);

        // Generate order number
        const orderCount = await prisma.order.count({
            where: { tenantId: tenant.id },
        });
        const orderNumber = `${slug.toUpperCase()}-${String(orderCount + 1).padStart(6, '0')}`;

        // Calculate totals
        let subtotal = 0;
        const orderItemsData = [];

        for (const item of validatedData.items) {
            // Get menu item with variants and modifiers
            const menuItem = await prisma.menuItem.findUnique({
                where: {
                    id: item.menuItemId,
                    tenantId: tenant.id,
                    deletedAt: null,
                },
                include: {
                    variants: true,
                    modifiers: {
                        include: { options: true },
                    },
                },
            });

            if (!menuItem) {
                return handleApiError(new NotFoundError('Menu item not found'));
            }

            let itemPrice = Number(menuItem.basePrice);

            // Add variant price
            let variantSnapshot = null;
            if (item.variantId) {
                const variant = menuItem.variants.find(v => v.id === item.variantId);
                if (variant) {
                    itemPrice += Number(variant.priceDelta);
                    variantSnapshot = {
                        variantId: variant.id,
                        nameSnapshot: variant.name,
                        priceDeltaSnapshot: variant.priceDelta,
                    };
                }
            }

            // Add modifier prices
            const modifierSnapshots = [];
            for (const modifierId of item.modifierIds) {
                // Find modifier option
                for (const modifier of menuItem.modifiers) {
                    const option = modifier.options.find(o => o.id === modifierId);
                    if (option) {
                        itemPrice += Number(option.priceDelta);
                        modifierSnapshots.push({
                            modifierId: modifier.id,
                            optionId: option.id,
                            nameSnapshot: option.name,
                            priceDeltaSnapshot: option.priceDelta,
                        });
                        break;
                    }
                }
            }

            subtotal += itemPrice * item.quantity;

            orderItemsData.push({
                menuItemId: item.menuItemId,
                nameSnapshot: item.nameSnapshot,
                basePriceSnapshot: item.basePriceSnapshot,
                qty: item.quantity,
                note: item.note,
                variantSnapshot,
                modifierSnapshots,
            });
        }

        // Calculate taxes and charges
        const taxAmount = Math.round(subtotal * 0.1); // 10% tax
        const serviceChargeAmount = validatedData.orderType === 'dine_in'
            ? Math.round(subtotal * 0.05) // 5% service charge for dine-in
            : 0;
        const discountAmount = 0; // No discount for now
        const totalAmount = subtotal + taxAmount + serviceChargeAmount - discountAmount;

        // Create order
        const order = await prisma.order.create({
            data: {
                tenantId: tenant.id,
                orderType: validatedData.orderType,
                tableSessionId: validatedData.tableSessionId,
                orderNumber,
                status: 'placed',
                note: validatedData.note,
                subtotalAmount: subtotal,
                discountAmount,
                serviceChargeAmount,
                taxAmount,
                totalAmount,
                items: {
                    create: orderItemsData.map(itemData => ({
                        tenantId: tenant.id,
                        menuItemId: itemData.menuItemId,
                        nameSnapshot: itemData.nameSnapshot,
                        basePriceSnapshot: itemData.basePriceSnapshot,
                        qty: itemData.qty,
                        note: itemData.note,
                        ...(itemData.variantSnapshot && {
                            variant: {
                                create: {
                                    tenantId: tenant.id,
                                    variantId: itemData.variantSnapshot.variantId,
                                    nameSnapshot: itemData.variantSnapshot.nameSnapshot,
                                    priceDeltaSnapshot: itemData.variantSnapshot.priceDeltaSnapshot,
                                },
                            },
                        }),
                        ...(itemData.modifierSnapshots.length > 0 && {
                            modifiers: {
                                create: itemData.modifierSnapshots.map(mod => ({
                                    tenantId: tenant.id,
                                    modifierId: mod.modifierId,
                                    optionId: mod.optionId,
                                    nameSnapshot: mod.nameSnapshot,
                                    priceDeltaSnapshot: mod.priceDeltaSnapshot,
                                })),
                            },
                        }),
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        menuItem: true,
                        variants: true,
                        modifiers: true,
                    },
                },
            },
        });

        return NextResponse.json({ order }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleApiError(error);
        }

        console.error('Create order error:', error);
        return handleApiError(error);
    }
}