// lib/directus.ts
import { createDirectus, rest, readItems, readItem, staticToken } from '@directus/sdk';

type Schema = any;

// =====================================================
// Configuración cliente Directus
// =====================================================

const DIRECTUS_URL =
    process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || '';

const token = process.env.DIRECTUS_TOKEN;

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
                fields: ['id', 'title', 'subtitle', 'cta_text', 'footer_text', 'slug'],
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

        const courses = await directus.request(
            readItems('courses', {
                sort: ['title'],
                fields: ['id', 'title', 'description', 'summary'],
                limit: 100,
            })
        );

        if (!Array.isArray(courses)) return [];

        return courses.map((c: any) => ({
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
// Classes (precio real desde Directus)
// IMPORTANTE: respeta el CASE EXACTO → Course / Price
// =====================================================

export type ClassItem = {
    id: string;
    course: string;
    price: number;
    date_created?: string | null;
    updated_at?: string | null;
};

/**
 * R3: obtener la Class más reciente para un Course
 */
export async function getLatestClassForCourse(
    courseId: string
): Promise<ClassItem | null> {
    try {
        if (!directus) return null;

        const items: any = await directus.request(
            readItems('classes', {
                filter: { Course: { _eq: courseId } }, // ✅ CASE correcto
                limit: 1,
                sort: ['-date_updated'], // Directus default
                fields: ['id', 'Course', 'Price', 'date_created', 'date_updated'],
            })
        );

        if (!Array.isArray(items) || !items[0]) return null;

        return {
            id: String(items[0].id),
            course: String(items[0].Course),
            price: Number(items[0].Price),
            date_created: items[0].date_created ?? null,
            updated_at: items[0].date_updated ?? null,
        };
    } catch (e) {
        console.error('getLatestClassForCourse error:', e);
        return null;
    }
}

/**
 * Obtener Class por id (usado en checkout single)
 */
export async function getClassById(classId: string): Promise<ClassItem | null> {
    try {
        if (!directus) return null;

        const c: any = await directus.request(
            readItem('classes', String(classId), {
                fields: ['id', 'Course', 'Price', 'date_created', 'date_updated'],
            })
        );

        if (!c) return null;

        return {
            id: String(c.id),
            course: String(c.Course),
            price: Number(c.Price),
            date_created: c.date_created ?? null,
            updated_at: c.date_updated ?? null,
        };
    } catch (e) {
        console.error('getClassById error:', e);
        return null;
    }
}

// =====================================================
// Enrollments (/me/courses)
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
                sort: ['-date_created'],
                limit: 100,
                fields: ['id', 'email', 'course_id', 'class_id', 'status'],
            })
        );

        if (!Array.isArray(rows)) return [];

        const courseIds = Array.from(new Set(rows.map((r: any) => String(r.course_id))));

        const courses: any = await directus.request(
            readItems('courses', {
                filter: { id: { _in: courseIds } },
                fields: ['id', 'title'],
            })
        );

        const titleMap = new Map<string, string>();
        for (const c of courses || []) titleMap.set(String(c.id), String(c.title ?? ''));

        return rows.map((r: any) => ({
            id: String(r.id),
            email: String(r.email),
            course_id: String(r.course_id),
            class_id: String(r.class_id),
            status: String(r.status ?? 'active'),
            course_title: titleMap.get(String(r.course_id)) ?? null,
        }));
    } catch (e) {
        console.error('getEnrollmentsByEmail error:', e);
        return [];
    }
}
