import Stripe from 'stripe';
import { NextResponse, type NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // Stripe recomienda fijar apiVersion (si tu paquete ya lo fija, también está ok)
    // apiVersion: '2025-06-30.preview',
});

type CartItem = { id: string; title: string; price: number; qty: number };

export async function POST(req: NextRequest) {
    try {
        const { items } = (await req.json()) as { items: CartItem[] };

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (!siteUrl) {
            return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SITE_URL' }, { status: 500 });
        }

        // Si aún no tienes Products/Prices en Stripe:
        // usamos price_data inline (válido para Checkout Sessions) :contentReference[oaicite:1]{index=1}
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: items.map((it) => ({
                quantity: it.qty,
                price_data: {
                    currency: 'mxn',
                    unit_amount: Math.round(it.price * 100), // si price viene en MXN (ej 1999 = $1999), ajusta según tu convención
                    product_data: { name: it.title },
                },
            })),
            success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/cart`,
            // metadata útil para reconciliar
            metadata: {
                cart_source: 'ouhnou_cart',
            },
        }); // :contentReference[oaicite:2]{index=2}

        return NextResponse.json({ url: session.url });
    } catch (e: any) {
        console.error('checkout error', e);
        return NextResponse.json({ error: e?.message ?? 'Checkout error' }, { status: 500 });
    }
}
