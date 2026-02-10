// app/api/courses/[id]/route.ts
import { NextResponse } from 'next/server';

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const body = await req.json();

    const url = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const token = process.env.DIRECTUS_TOKEN;

    if (!url || !token) {
        return NextResponse.json(
            { error: 'Missing DIRECTUS_URL or DIRECTUS_TOKEN' },
            { status: 500 }
        );
    }

    // Solo permite estos campos
    const payload: Record<string, any> = {};
    if (typeof body.title === 'string') payload.title = body.title;
    if (typeof body.description === 'string') payload.description = body.description;

    const res = await fetch(`${url}/items/courses/${params.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}
