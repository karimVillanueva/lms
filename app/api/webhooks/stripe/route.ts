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
            const orderId = session.metadata?.order_id;
            const kind = session.metadata?.order_kind;
            console.log('✅ checkout.session.completed', session.id, session.payment_status, { orderId, kind });
            // TODO: aquí guardas orden/enrolas usuario en cursos (Directus)
            if (kind === 'company' && orderId) {
                // W2: aquí guardaremos en Directus:
                // 1) marcar orden pagada
                // 2) crear invitations por assignment + licencias sin asignar
                // 3) si employee_due > 0: crear “employee_payment” pendiente
                // De momento solo log:
                console.log('🔧 TODO: fulfill corporate order', orderId);
            }
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
