// app/api/prices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getLatestClassForCourse } from '@/lib/directus';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const courseIds = Array.isArray(body?.courseIds)
            ? body.courseIds.map(String).filter(Boolean)
            : [];

        if (courseIds.length === 0) {
            return NextResponse.json({ prices: {} }, { status: 200 });
        }

        const entries = await Promise.all(
            courseIds.map(async (courseId) => {
                try {
                    const cls = await getLatestClassForCourse(courseId);

                    return [
                        courseId,
                        {
                            courseId,
                            classId: cls?.id ?? null,
                            price: cls?.price ?? null,
                        },
                    ] as const;
                } catch (e: any) {
                    // ⚠️ NO tronar por un solo curso
                    console.error('getLatestClassForCourse failed', { courseId, error: e?.message || e });
                    return [
                        courseId,
                        { courseId, classId: null, price: null, error: 'class_lookup_failed' },
                    ] as const;
                }
            })
        );

        return NextResponse.json({ prices: Object.fromEntries(entries) }, { status: 200 });
    } catch (e: any) {
        console.error('❌ /api/prices handler error:', e?.message || e);
        return NextResponse.json(
            { error: e?.message ?? 'Failed to load prices' },
            { status: 500 }
        );
    }
}
