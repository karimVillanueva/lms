// lib/directus.ts
import {
    createDirectus,
    rest,
    readItems,
    readItem,
    staticToken,
} from '@directus/sdk';

type Schema = any;

// =====================================================
// Configuración cliente Directus
// =====================================================

const DIRECTUS_URL =
    process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || '';

const token = process.env.DIRECTUS_TOKEN;

// ⚠️ Nunca hacer throw aquí (rompe build en Next)
export const directus = DIRECTUS_URL
    ? token
        ? createDirectus<Schema>(DIRECTUS_URL).with(staticToken(token)).with(rest())
        : createDirectus<Schema>(DIRECTUS_URL).with(rest())
    : null;

// =====================================================
// Home Page
// =====================================================

export type HomePageData = {
    id: string | number;
    title?: string;
    subtitle?: string;
    cta_text?: string;
    footer_text?: string;
};

export async function getHomePage(): Promise<HomePageData | null> {
    try {
        if (!directus) return null;

        const pages = await directus.request(
            readItems('pages', {
                filter: { slug: { _eq: 'home' } },
                limit: 1,
                fields: ['id', 'title', 'subtitle', 'cta_text', 'footer_text'],
            })
        );

        return (pages?.[0] as any) ?? null;
    } catch (e) {
        console.error('getHomePage error:', e);
        return null;
    }
}

// =====================================================
// Courses
// =====================================================

export type Course = {
    id: string;
    title: string | null;
    description: string | null;
    summary: string | null;
};

export async function getCourses(): Promise<Course[]> {
    try {
        if (!directus) return [];

        const rows = await directus.request(
            readItems('courses', {
                sort: ['title'],
                fields: ['id', 'title', 'description', 'summary'],
                limit: 200,
            })
        );

        if (!Array.isArray(rows)) return [];

        return rows.map((c: any) => ({
            id: String(c.id),
            title: c.title ?? null,
            description: c.description ?? null,
            summary: c.summary ?? null,
        }));
    } catch (e) {
        console.error('getCourses error:', e);
        return [];
    }
}

export async function getCourseById(id: string): Promise<Course | null> {
    try {
        if (!directus) return null;

        const c: any = await directus.request(
            readItem('courses', id, {
                fields: ['id', 'title', 'description', 'summary'],
            })
        );

        if (!c) return null;

        return {
            id: String(c.id),
            title: c.title ?? null,
            description: c.description ?? null,
            summary: c.summary ?? null,
        };
    } catch (e) {
        console.error('getCourseById error:', e);
        return null;
    }
}

// =====================================================
// Classes (PRECIO REAL)
// Tu Directus usa colección "Classes"
// campos: course / price (minúsculas)
// =====================================================

export type ClassItem = {
    id: string;
    course: string;
    price: number;
    date_created?: string | null;
    updated_at?: string | null;
};

export async function getLatestClassForCourse(
    courseId: string
): Promise<ClassItem | null> {
    try {
        if (!directus) return null;

        let rows: any = await directus.request(
            readItems('Classes', {
                filter: { course: { _eq: courseId } },
                sort: ['-date_updated'],
                limit: 1,
                fields: ['id', 'course', 'price', 'date_created', 'date_updated'],
            })
        );

        if (!Array.isArray(rows) || !rows[0]) {
            rows = await directus.request(
                readItems('Classes', {
                    filter: { course: { _eq: courseId } },
                    sort: ['-date_created'],
                    limit: 1,
                    fields: ['id', 'course', 'price', 'date_created', 'date_updated'],
                })
            );
        }

        if (!rows?.[0]) return null;

        const r = rows[0];

        return {
            id: String(r.id),
            course: String(r.course),
            price: Number(r.price),
            date_created: r.date_created ?? null,
            updated_at: r.date_updated ?? null,
        };
    } catch (e) {
        console.error('getLatestClassForCourse error:', e);
        return null;
    }
}

export async function getClassById(classId: string): Promise<ClassItem | null> {
    try {
        if (!directus) return null;

        const c: any = await directus.request(
            readItem('Classes', classId, {
                fields: ['id', 'course', 'price', 'date_created', 'date_updated'],
            })
        );

        if (!c) return null;

        return {
            id: String(c.id),
            course: String(c.course),
            price: Number(c.price),
            date_created: c.date_created ?? null,
            updated_at: c.date_updated ?? null,
        };
    } catch (e) {
        console.error('getClassById error:', e);
        return null;
    }
}

// =====================================================
// Packages (D2)
// =====================================================

export type Package = {
    id: string;
    title: string;
    slug: string | null;
    description: string | null;
    recommended_seats: number | null;
    items: Array<{ course_id: string; course_title: string | null }>;
};

export async function getPackages(): Promise<Package[]> {
    try {
        if (!directus) return [];

        const rows: any = await directus.request(
            readItems('packages', {
                filter: { is_active: { _eq: true } },
                sort: ['sort', 'title'],
                fields: [
                    'id',
                    'title',
                    'slug',
                    'description',
                    'recommended_seats',
                    {
                        items: [
                            { course: ['id', 'title'] },
                        ],
                    },
                ],
            })
        );

        if (!Array.isArray(rows)) return [];

        return rows.map((p: any) => ({
            id: String(p.id),
            title: String(p.title ?? ''),
            slug: p.slug ?? null,
            description: p.description ?? null,
            recommended_seats: p.recommended_seats ?? null,
            items:
                p.items?.map((it: any) => ({
                    course_id: String(it.course?.id),
                    course_title: it.course?.title ?? null,
                })) ?? [],
        }));
    } catch (e) {
        console.error('getPackages error:', e);
        return [];
    }
}

// =====================================================
// Enrollments
// =====================================================

export type Enrollment = {
    id: string;
    email: string;
    course_id: string;
    class_id: string;
    status: string;
    course_title?: string | null;
};

export async function getEnrollmentsByEmail(email: string): Promise<Enrollment[]> {
    try {
        if (!directus) return [];

        const rows: any = await directus.request(
            readItems('enrollments', {
                filter: { email: { _eq: email } },
                fields: ['id', 'email', 'course_id', 'class_id', 'status'],
                sort: ['-date_created'],
            })
        );

        return rows ?? [];
    } catch (e) {
        console.error('getEnrollmentsByEmail error:', e);
        return [];
    }
}
