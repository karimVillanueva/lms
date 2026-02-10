// lib/directus.ts
import { createDirectus, rest, readItems, readItem, staticToken } from '@directus/sdk';


type Schema = any;

// URL (server) + fallback a NEXT_PUBLIC
const DIRECTUS_URL =
    process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || '';

const token = process.env.DIRECTUS_TOKEN;

// ⚠️ No hagas throw en top-level (rompe builds). Si no hay URL, el cliente queda null.
export const directus = DIRECTUS_URL
    ? (token
        ? createDirectus<Schema>(DIRECTUS_URL).with(staticToken(token)).with(rest())
        : createDirectus<Schema>(DIRECTUS_URL).with(rest()))
    : null;

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


export type ClassItem = {
    id: string;
    course: string; // relación a courses
    price: number;
    date_created?: string | null;
    updated_at?: string | null;
};

export async function getCourseById(id: string): Promise<Course | null> {
    try {
        if (!directus) return null;

        const c: any = await directus.request(
            readItem('courses', id, { fields: ['id', 'title', 'description', 'summary'] })
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

// R3: la Class “más reciente” por updated_at desc (fallback date_created desc)
export async function getLatestClassForCourse(courseId: string): Promise<ClassItem | null> {
    try {
        if (!directus) return null;

        // Intento 1: sort por updated_at desc
        let items: any = await directus.request(
            readItems('classes', {
                filter: { course: { _eq: courseId } },
                limit: 1,
                sort: ['-updated_at'],
                fields: ['id', 'course', 'price', 'date_created', 'updated_at'],
            })
        );

        if (Array.isArray(items) && items[0]) {
            return {
                id: String(items[0].id),
                course: String(items[0].course),
                price: Number(items[0].price),
                date_created: items[0].date_created ?? null,
                updated_at: items[0].updated_at ?? null,
            };
        }

        // Fallback: sort por date_created desc
        items = await directus.request(
            readItems('classes', {
                filter: { course: { _eq: courseId } },
                limit: 1,
                sort: ['-date_created'],
                fields: ['id', 'course', 'price', 'date_created', 'updated_at'],
            })
        );

        if (!Array.isArray(items) || !items[0]) return null;

        return {
            id: String(items[0].id),
            course: String(items[0].course),
            price: Number(items[0].price),
            date_created: items[0].date_created ?? null,
            updated_at: items[0].updated_at ?? null,
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
            readItem('classes', String(classId), {
                fields: ['id', 'course', 'price', 'date_created', 'updated_at'],
            })
        );

        if (!c) return null;

        return {
            id: String(c.id),
            course: String(c.course),
            price: Number(c.price),
            date_created: c.date_created ?? null,
            updated_at: c.updated_at ?? null,
        };
    } catch (e) {
        console.error('getClassById error:', e);
        return null;
    }
}
