// app/HomeClient.tsx
'use client';
import Link from 'next/link';
import { useCart } from './cart/cart-context';

import { useMemo, useState } from 'react';
import { setAttr } from '@/lib/visual-editor';
import type { HTMLAttributes } from 'react';
import type { Course } from '@/lib/directus';

type PageData = {
    id: string | number;
    title: string;
    subtitle: string;
    cta_text: string;
    footer_text: string;
};

const attr = (value: unknown): HTMLAttributes<HTMLElement> =>
    value && typeof value === 'object' ? (value as any) : {};

export default function HomeClient({ page, courses }: { page: PageData; courses: Course[] }) {
    const [q, setQ] = useState('');

    const { add, count } = useCart();

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return courses;
        return courses.filter((c) => (c.title ?? '').toLowerCase().includes(term));
    }, [q, courses]);

    return (
        <main className="min-h-screen bg-gray-950 text-white">
            {/* HERO */}
            <Link
                href="/cart"
                className="text-sm px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700"
            >
                Carrito ({count})
            </Link>
            <section className="px-6 py-14 border-b border-gray-800">
                <div className="max-w-5xl mx-auto">
                    <h1
                        className="text-4xl md:text-5xl font-extrabold text-indigo-400"
                        {...attr(setAttr({ collection: 'pages', item: page.id, fields: ['title'] }))}
                    >
                        {page.title}
                    </h1>

                    <p
                        className="mt-3 text-gray-300 text-lg"
                        {...attr(setAttr({ collection: 'pages', item: page.id, fields: ['subtitle'] }))}
                    >
                        {page.subtitle}
                    </p>

                    {/* buscador */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar cursos…"
                            className="w-full sm:w-96 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500"
                        />

                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
                            {...attr(setAttr({ collection: 'pages', item: page.id, fields: ['cta_text'] }))}
                            onClick={() => {
                                const el = document.getElementById('catalog');
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {page.cta_text}
                        </button>
                    </div>
                </div>
            </section>

            {/* CATALOGO */}
            <section id="catalog" className="px-6 py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-end justify-between gap-4">
                        <h2 className="text-2xl font-semibold">Catálogo</h2>
                        <p className="text-gray-400 text-sm">
                            {filtered.length} curso{filtered.length === 1 ? '' : 's'}
                        </p>
                    </div>

                    {filtered.length === 0 ? (
                        <p className="mt-6 text-gray-500">No hay cursos que coincidan con tu búsqueda.</p>
                    ) : (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filtered.map((course) => (
                                <article
                                    key={course.id}
                                    className="rounded-xl border border-gray-800 bg-gray-900/30 p-5 hover:border-indigo-500 transition"
                                    {...attr(setAttr({ collection: 'courses', item: course.id }))}
                                >
                                    <h3
                                        className="text-lg font-semibold text-indigo-200"
                                        {...attr(setAttr({ collection: 'courses', item: course.id, fields: ['title'] }))}
                                    >
                                        {course.title ?? 'Sin título'}
                                    </h3>

                                    <p
                                        className="mt-2 text-sm text-gray-300 min-h-[40px]"
                                        {...attr(
                                            setAttr({ collection: 'courses', item: course.id, fields: ['description', 'summary'] })
                                        )}
                                    >
                                        {course.description ?? course.summary ?? 'Sin descripción todavía.'}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs text-gray-400">ID: {course.id.slice(0, 6)}…</span>
                                        <button className="text-sm px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700">
                                            Ver detalles
                                        </button>
                                    </div>

                                    <button
                                        className="text-sm px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700"
                                        onClick={() =>
                                            add(
                                                {
                                                    id: course.id,
                                                    title: course.title ?? 'Curso',
                                                    price: 1999, // 👈 por ahora fijo. Lo ideal es traer course.price desde Directus
                                                },
                                                1
                                            )
                                        }
                                    >
                                        Añadir al carrito
                                    </button>

                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="px-6 py-8 border-t border-gray-800">
                <div
                    className="max-w-5xl mx-auto text-gray-500 text-sm"
                    {...attr(setAttr({ collection: 'pages', item: page.id, fields: ['footer_text'] }))}
                >
                    {page.footer_text}
                </div>
            </footer>
        </main>
    );
}
