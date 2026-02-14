'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Course, Package } from '@/lib/directus';
import { useBusinessBuy } from '../_context/buy-context';

function money(n: number) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function SelectClient({ courses, packages }: { courses: Course[]; packages: Package[] }) {
    const { state, setItems, setQty } = useBusinessBuy();
    const [tab, setTab] = useState<'courses' | 'packages'>('courses');
    const [q, setQ] = useState('');

    const itemsById = useMemo(() => {
        const m = new Map(state.items.map((it) => [it.courseId, it]));
        return m;
    }, [state.items]);

    const filteredCourses = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return courses;
        return courses.filter((c) => (c.title ?? '').toLowerCase().includes(term));
    }, [q, courses]);

    const ensureItem = (course: Course) => {
        const prev = itemsById.get(course.id);
        if (prev) return;
        setItems([
            ...state.items,
            {
                courseId: course.id,
                qtySeats: 1,
                title: course.title,
                companyCoveragePercent: 100,
            },
        ]);
    };

    const updateQty = (courseId: string, qty: number) => {
        const existing = itemsById.get(courseId);
        if (!existing) return;
        setQty(courseId, qty);
    };

    const removeIfZero = (courseId: string, nextQty: number) => {
        if (nextQty > 0) return;
        setItems(state.items.filter((x) => x.courseId !== courseId));
    };

    const pickPackage = (p: Package) => {
        const seats = p.recommended_seats ?? 20;
        // agrega cursos del paquete como items (bundle fijo)
        const next = [...state.items];
        for (const it of p.items) {
            const existing = next.find((x) => x.courseId === it.course_id);
            if (existing) {
                existing.qtySeats = Math.max(existing.qtySeats, seats);
            } else {
                next.push({
                    courseId: it.course_id,
                    qtySeats: seats,
                    title: it.course_title ?? 'Curso',
                    companyCoveragePercent: 100,
                });
            }
        }
        setItems(next);
    };

    const hasSelection = state.items.some((it) => it.qtySeats > 0);

    return (
        <main className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <section className="max-w-5xl mx-auto">
                <header className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-400">Compra corporativa</h1>
                        <p className="text-gray-400 mt-1">Paso 1/4 — Selecciona cursos o paquetes</p>
                    </div>
                    <Link href="/business" className="text-sm px-3 py-2 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700">
                        Volver
                    </Link>
                </header>

                <div className="mt-6 flex gap-2">
                    <button
                        className={`px-4 py-2 rounded border ${tab === 'courses' ? 'bg-indigo-600 border-indigo-500' : 'bg-gray-900/30 border-gray-800'}`}
                        onClick={() => setTab('courses')}
                    >
                        Cursos
                    </button>
                    <button
                        className={`px-4 py-2 rounded border ${tab === 'packages' ? 'bg-indigo-600 border-indigo-500' : 'bg-gray-900/30 border-gray-800'}`}
                        onClick={() => setTab('packages')}
                    >
                        Paquetes
                    </button>
                </div>

                {tab === 'courses' ? (
                    <>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <input
                                className="w-full sm:w-96 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500"
                                placeholder="Buscar cursos…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                            <div className="text-sm text-gray-400 self-center">
                                Seleccionados: <span className="text-white font-semibold">{state.items.length}</span>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredCourses.map((c) => {
                                const it = itemsById.get(c.id);
                                const qty = it?.qtySeats ?? 0;

                                return (
                                    <article key={c.id} className="rounded-xl border border-gray-800 bg-gray-900/30 p-5 hover:border-indigo-500 transition">
                                        <h3 className="text-lg font-semibold text-indigo-200">{c.title ?? 'Sin título'}</h3>
                                        <p className="mt-2 text-sm text-gray-300 min-h-[40px]">
                                            {c.description ?? c.summary ?? 'Sin descripción.'}
                                        </p>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-xs text-gray-400">ID: {c.id.slice(0, 6)}…</div>
                                            <div className="flex items-center gap-2">
                                                {qty === 0 ? (
                                                    <button
                                                        onClick={() => ensureItem(c)}
                                                        className="text-sm px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700"
                                                    >
                                                        Añadir
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="w-9 h-9 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700"
                                                            onClick={() => {
                                                                const next = qty - 1;
                                                                updateQty(c.id, next);
                                                                removeIfZero(c.id, next);
                                                            }}
                                                        >
                                                            −
                                                        </button>
                                                        <input
                                                            className="w-16 text-center bg-gray-900 border border-gray-700 rounded h-9"
                                                            value={qty}
                                                            onChange={(e) => {
                                                                const next = Number(e.target.value || 0);
                                                                updateQty(c.id, next);
                                                                removeIfZero(c.id, next);
                                                            }}
                                                            inputMode="numeric"
                                                        />
                                                        <button
                                                            className="w-9 h-9 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700"
                                                            onClick={() => updateQty(c.id, qty + 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {packages.map((p) => (
                            <article key={p.id} className="rounded-xl border border-gray-800 bg-gray-900/30 p-5 hover:border-indigo-500 transition">
                                <h3 className="text-lg font-semibold text-indigo-200">{p.title}</h3>
                                <p className="mt-2 text-sm text-gray-300">{p.description ?? 'Paquete corporativo.'}</p>

                                <ul className="mt-4 text-sm text-gray-300 list-disc pl-5">
                                    {p.items.slice(0, 6).map((it) => (
                                        <li key={it.course_id}>{it.course_title ?? it.course_id}</li>
                                    ))}
                                    {p.items.length > 6 && <li>…y {p.items.length - 6} más</li>}
                                </ul>

                                <div className="mt-5 flex items-center justify-between">
                                    <div className="text-sm text-gray-400">
                                        Recomendado: <span className="text-white font-semibold">{p.recommended_seats ?? 20}</span> licencias
                                    </div>
                                    <button
                                        onClick={() => pickPackage(p)}
                                        className="text-sm px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 font-semibold"
                                    >
                                        Elegir paquete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <div className="mt-10 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        {hasSelection ? 'Listo para continuar al split por curso.' : 'Selecciona al menos un curso o paquete.'}
                    </div>
                    <Link
                        href="/business/buy/contribution"
                        className={`px-5 py-3 rounded-lg font-semibold ${hasSelection ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800 opacity-60 pointer-events-none'}`}
                    >
                        Continuar
                    </Link>
                </div>
            </section>
        </main>
    );
}
