import Stripe from 'stripe';
import { NextResponse, type NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    const sig = req.headers.get('stripe-signature');
    if (!sig) return new NextResponse('Missing stripe-signature', { status: 400 });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) return new NextResponse('Missing STRIPE_WEBHOOK_SECRET', { status: 500 });

    // En Route Handlers puedes leer raw body con req.text() para verificar firma :contentReference[oaicite:4]{index=4}
    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed.', err.message);
        return new NextResponse('Webhook Error', { status: 400 });
    }

    // Maneja eventos
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('✅ checkout.session.completed', session.id, session.payment_status);
            // TODO: aquí guardas orden/enrolas usuario en cursos (Directus)
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
