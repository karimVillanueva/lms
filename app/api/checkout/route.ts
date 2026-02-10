// app/api/checkout/route.ts
import Stripe from 'stripe';
import { NextResponse, type NextRequest } from 'next/server';
import { getClassById, getLatestClassForCourse, getCourseById } from '@/lib/directus';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type CartItem = { id: string; qty: number }; // id = courseId (desde tu cart)
type Body =
    | { mode: 'single'; courseId: string; classId: string }
    | { mode: 'cart'; items: CartItem[] };

export async function POST(req: NextRequest) {
    try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (!siteUrl) {
            return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SITE_URL' }, { status: 500 });
        }
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 });
        }

        const body = (await req.json()) as Body;

        // ---------- SINGLE (buy now) ----------
        if (body?.mode === 'single') {
            const { courseId, classId } = body;

            if (!courseId || !classId) {
                return NextResponse.json({ error: 'Missing courseId/classId' }, { status: 400 });
            }

            // Validar precio server-side desde Classes
            const cls = await getClassById(classId);
            if (!cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
            if (String(cls.course) !== String(courseId)) {
                return NextResponse.json({ error: 'Class does not belong to course' }, { status: 400 });
            }

            const course = await getCourseById(courseId);
            const name = course?.title ?? 'Curso';

            const price = Number(cls.price);
            if (!Number.isFinite(price) || price <= 0) {
                return NextResponse.json({ error: 'Invalid class price' }, { status: 400 });
            }

            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                line_items: [
                    {
                        quantity: 1,
                        price_data: {
                            currency: 'mxn',
                            unit_amount: Math.round(price * 100),
                            product_data: { name },
                        },
                    },
                ],
                success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${siteUrl}/courses/${encodeURIComponent(courseId)}`,
                metadata: {
                    mode: 'single',
                    course_id: String(courseId),
                    class_id: String(classId),
                    cart_source: 'ouhnou_cart',
                },
            });

            return NextResponse.json({ url: session.url });
        }

        // ---------- CART ----------
        if (body?.mode === 'cart') {
            const items = body.items;

            if (!Array.isArray(items) || items.length === 0) {
                return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
            }

            // Sanitizar qty y courseId
            const normalized = items
                .map((it) => ({
                    courseId: String(it.id),
                    qty: Math.max(1, Math.min(99, Number(it.qty) || 1)),
                }))
                .filter((it) => it.courseId);

            if (normalized.length === 0) {
                return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
            }

            // Para cada courseId: obtener la Class más reciente (R3) y el título del curso
            const enriched = await Promise.all(
                normalized.map(async (it) => {
                    const [cls, course] = await Promise.all([
                        getLatestClassForCourse(it.courseId),
                        getCourseById(it.courseId),
                    ]);
                    return { ...it, cls, course };
                })
            );

            // Validar que todos tengan class + precio
            for (const e of enriched) {
                const price = Number(e.cls?.price);
                if (!e.cls?.id || !Number.isFinite(price) || price <= 0) {
                    return NextResponse.json(
                        { error: `Course ${e.courseId} has no valid class/price` },
                        { status: 400 }
                    );
                }
            }

            const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = enriched.map((e) => ({
                quantity: e.qty,
                price_data: {
                    currency: 'mxn',
                    unit_amount: Math.round(Number(e.cls!.price) * 100),
                    product_data: { name: e.course?.title ?? 'Curso' },
                },
            }));

            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                line_items,
                success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${siteUrl}/cart`,
                metadata: {
                    mode: 'cart',
                    cart_source: 'ouhnou_cart',
                    course_ids: enriched.map((e) => e.courseId).join(','),
                },
            });

            return NextResponse.json({ url: session.url });
        }

        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    } catch (e: any) {
        console.error('checkout error', e);
        return NextResponse.json({ error: e?.message ?? 'Checkout error' }, { status: 500 });
    }
}
