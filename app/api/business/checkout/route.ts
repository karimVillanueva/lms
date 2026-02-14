import Stripe from 'stripe';
import { NextResponse, type NextRequest } from 'next/server';
import { getLatestClassForCourse } from '@/lib/directus';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Payload = {
    company?: { name?: string; admin_email?: string };
    items: Array<{ courseId: string; qtySeats: number; companyCoveragePercent: number }>;
    assignments?: Array<{ email: string; courseId: string }>;
};

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as Payload;

        if (!Array.isArray(body.items) || body.items.length === 0) {
            return NextResponse.json({ error: 'No items' }, { status: 400 });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (!siteUrl) return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SITE_URL' }, { status: 500 });

        // 1) Validar cantidades y obtener precios reales (Classes.price)
        const expanded = [];
        for (const it of body.items) {
            const qty = Math.max(0, Math.floor(it.qtySeats || 0));
            if (!it.courseId || qty <= 0) continue;

            const pct = clamp(Number(it.companyCoveragePercent ?? 100), 0, 100);

            const cls = await getLatestClassForCourse(String(it.courseId));
            if (!cls || !Number.isFinite(Number(cls.price)) || Number(cls.price) <= 0) {
                return NextResponse.json(
                    { error: `Curso sin precio publicado (Classes.price)`, courseId: it.courseId },
                    { status: 400 }
                );
            }

            expanded.push({
                courseId: String(it.courseId),
                classId: String(cls.id),
                unitPrice: Number(cls.price),          // MXN “normal”
                qtySeats: qty,
                companyCoveragePercent: pct,
            });
        }

        if (expanded.length === 0) {
            return NextResponse.json({ error: 'No valid items' }, { status: 400 });
        }

        // 2) Calcular lo que paga la empresa (solo su porción)
        //    Empresa paga: unitPrice * (pct/100) * qtySeats
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
        let companyTotal = 0;

        for (const x of expanded) {
            const companyUnit = (x.unitPrice * x.companyCoveragePercent) / 100;
            const companyUnitRounded = Math.round(companyUnit * 100) / 100;

            // si empresa cubre 0%, no va en checkout de empresa
            if (companyUnitRounded <= 0) continue;

            companyTotal += companyUnitRounded * x.qtySeats;

            lineItems.push({
                quantity: x.qtySeats,
                price_data: {
                    currency: 'mxn',
                    unit_amount: Math.round(companyUnitRounded * 100), // centavos
                    product_data: {
                        name: `Licencia corporativa: ${x.courseId}`,
                        description: `Cobertura empresa ${x.companyCoveragePercent}% (Classes: ${x.classId})`,
                    },
                },
            });
        }

        if (lineItems.length === 0) {
            return NextResponse.json(
                { error: 'La empresa no cubre nada. Checkout empresa no aplica.' },
                { status: 400 }
            );
        }

        // 3) Crear un “order_id” simple (sin DB aún)
        //    En W2 ideal: guardar orden en Directus antes de ir a Stripe.
        const orderId = `corp_${Date.now()}_${Math.random().toString(16).slice(2)}`;

        // 4) Crear Checkout Session (empresa)
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: lineItems,
            success_url: `${siteUrl}/business/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/business/buy/review`,
            metadata: {
                order_id: orderId,
                order_kind: 'company',
                // guardamos mini-resumen (sin exceder metadata)
                company_email: body.company?.admin_email ?? '',
            },
        });

        // 5) (W1) devolvemos URL y un “order draft” mínimo
        return NextResponse.json({
            url: session.url,
            orderId,
            companyTotal,
            // para que luego el webhook o un /api/business/confirm pueda usarlo,
            // en W2 lo guardamos en Directus
            draft: {
                items: expanded,
                assignments: body.assignments ?? [],
                company: body.company ?? {},
            },
        });
    } catch (e: any) {
        console.error('business checkout error', e);
        return NextResponse.json({ error: e?.message ?? 'Checkout error' }, { status: 500 });
    }
}
