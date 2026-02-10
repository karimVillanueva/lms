// lib/directus.ts
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';

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
