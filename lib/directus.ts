// lib/directus.ts
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';

type Schema = any;

// URL (server) + fallback a NEXT_PUBLIC
const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;

if (!DIRECTUS_URL) {
    throw new Error('Missing DIRECTUS_URL / NEXT_PUBLIC_DIRECTUS_URL in env');
}

const token = process.env.DIRECTUS_TOKEN;

// Export nombrado: directus ✅
export const directus = token
    ? createDirectus<Schema>(DIRECTUS_URL).with(staticToken(token)).with(rest())
    : createDirectus<Schema>(DIRECTUS_URL).with(rest());

// Helpers opcionales ✅
export async function getHomePage() {
    const pages = await directus.request(
        readItems('pages', {
            filter: { slug: { _eq: 'home' } },
            limit: 1,
        })
    );
    return pages?.[0] ?? null;
}

export async function getCourses() {
    return await directus.request(
        readItems('courses', {
            sort: ['title'],
            // fields: ['id', 'title', 'slug'], // ajusta si quieres
        })
    );
}
