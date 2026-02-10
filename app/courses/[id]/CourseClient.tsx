// app/courses/[id]/CourseClient.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { setAttr } from '@/lib/visual-editor';
import type { HTMLAttributes } from 'react';
import type { Course, ClassItem } from '@/lib/directus';

const attr = (value: unknown): HTMLAttributes<HTMLElement> =>
    value && typeof value === 'object' ? (value as any) : {};

function money(n: number) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

function safeSlice(s: string, n: number) {
    return s.length > n ? s.slice(0, n) + '…' : s;
}

export default function CourseClient({
    course,
    classInfo,
    price,
}: {
    course: Course;
    classInfo: ClassItem | null;
    price: number | null;
}) {
    const [loadingCheckout, setLoadingCheckout] = useState(false);

    const hasPrice = typeof price === 'number' && Number.isFinite(price) && price > 0;

    const bullets = useMemo(() => {
        // Placeholder premium: si luego agregas campos reales, aquí se mapea
        return [
            'Aprende con casos reales y ejercicios prácticos.',
            'Acceso inmediato y contenido diseñado para resultados.',
            'Certificado y material descargable (según configuración).',
        ];
    }, []);

    const buyNow = async () => {
        if (!classInfo?.id || !hasPrice) {
            alert('Este curso aún no tiene una clase/precio disponible.');
            return;
        }

        setLoadingCheckout(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'single',
                    courseId: course.id,
                    classId: classInfo.id,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'No se pudo iniciar checkout');

            if (data?.url) window.location.href = data.url;
            else throw new Error('Stripe no devolvió URL de checkout');
        } catch (e: any) {
            console.error(e);
            alert(e?.message || 'Error al iniciar checkout');
        } finally {
            setLoadingCheckout(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-950 text-white">
            {/* Top bar */}
            <div className="px-6 py-4 border-b border-gray-800">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <Link href="/" className="text-sm text-gray-300 hover:text-white">
                        ← Volver al catálogo
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/org/catalog?courseId=${encodeURIComponent(course.id)}`}
                            className="text-sm px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700"
                        >
                            Comprar para mi empresa
                        </Link>
                    </div>
                </div>
            </div>

            {/* HERO */}
            <section className="px-6 py-10 border-b border-gray-800">
                <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1fr_360px]">
                    {/* Left */}
                    <div>
                        <h1
                            className="text-3xl md:text-5xl font-extrabold text-indigo-400"
                            {...attr(setAttr({ collection: 'courses', item: course.id, fields: ['title'] }))}
                        >
                            {course.title ?? 'Curso'}
                        </h1>

                        <p
                            className="mt-4 text-gray-300 text-base md:text-lg max-w-2xl"
                            {...attr(setAttr({ collection: 'courses', item: course.id, fields: ['description', 'summary'] }))}
                        >
                            {course.description ?? course.summary ?? 'Sin descripción todavía.'}
                        </p>

                        <ul className="mt-6 grid gap-3 max-w-2xl">
                            {bullets.map((b, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-3"
                                >
                                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-700/30">
                                        ✓
                                    </span>
                                    <span className="text-gray-200">{b}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Trust row */}
                        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                            <span className="px-3 py-1 rounded-full border border-gray-800 bg-gray-900/20">
                                Acceso inmediato
                            </span>
                            <span className="px-3 py-1 rounded-full border border-gray-800 bg-gray-900/20">
                                Aprende a tu ritmo
                            </span>
                            <span className="px-3 py-1 rounded-full border border-gray-800 bg-gray-900/20">
                                Soporte y actualizaciones
                            </span>
                        </div>
                    </div>

                    {/* Right sticky card */}
                    <aside className="lg:sticky lg:top-6 h-fit rounded-2xl border border-gray-800 bg-gray-900/30 p-5 shadow">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm text-gray-400">Precio</p>
                                <div className="mt-1 text-3xl font-extrabold text-white">
                                    {hasPrice ? money(price!) : '—'}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    {classInfo?.id ? `Clase: ${safeSlice(classInfo.id, 10)}` : 'No hay clase publicada aún'}
                                </p>
                            </div>

                            <div className="text-right">
                                <span className="inline-flex items-center text-xs px-2 py-1 rounded-full border border-gray-800 bg-gray-950/40 text-gray-300">
                                    Premium
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-2 text-sm text-gray-300">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Formato</span>
                                <span>On-demand</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Certificado</span>
                                <span>Incluido</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Acceso</span>
                                <span>Ilimitado</span>
                            </div>
                        </div>

                        <button
                            onClick={buyNow}
                            disabled={!hasPrice || loadingCheckout}
                            className="mt-5 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 font-semibold py-3"
                        >
                            {loadingCheckout ? 'Redirigiendo…' : 'Comprar ahora'}
                        </button>

                        <Link
                            href={`/org/catalog?courseId=${encodeURIComponent(course.id)}`}
                            className="mt-3 block w-full text-center rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 font-semibold py-3"
                        >
                            Comprar para mi empresa
                        </Link>

                        <p className="mt-3 text-xs text-gray-500">
                            Compra individual: acceso inmediato tras confirmación de pago.
                            Compras para empresa: asigne a empleados ahora o después.
                        </p>
                    </aside>
                </div>
            </section>

            {/* CONTENT */}
            <section className="px-6 py-12">
                <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1fr_360px]">
                    {/* Left content */}
                    <div className="space-y-8">
                        <div className="rounded-2xl border border-gray-800 bg-gray-900/20 p-6">
                            <h2 className="text-xl font-bold text-white">Temario</h2>
                            <p className="mt-2 text-gray-400 text-sm">
                                (Placeholder premium) En la siguiente iteración lo conectamos a campos reales de Directus.
                            </p>
                            <div className="mt-4 space-y-3">
                                {['Introducción y objetivos', 'Módulo 1: Fundamentos', 'Módulo 2: Práctica guiada', 'Proyecto final'].map(
                                    (t) => (
                                        <details
                                            key={t}
                                            className="rounded-xl border border-gray-800 bg-gray-950/30 px-4 py-3"
                                        >
                                            <summary className="cursor-pointer text-gray-200 font-semibold">{t}</summary>
                                            <p className="mt-2 text-sm text-gray-400">
                                                Contenido y ejercicios prácticos para dominar el tema paso a paso.
                                            </p>
                                        </details>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-800 bg-gray-900/20 p-6">
                            <h2 className="text-xl font-bold text-white">Preguntas frecuentes</h2>
                            <div className="mt-4 space-y-3">
                                {[
                                    ['¿Cuándo obtengo acceso?', 'Al confirmarse el pago (vía webhook).'],
                                    ['¿Puedo verlo a mi ritmo?', 'Sí, acceso on-demand.'],
                                    ['¿La empresa puede comprar para mi equipo?', 'Sí, desde el portal de empresa.'],
                                ].map(([q, a]) => (
                                    <details key={q} className="rounded-xl border border-gray-800 bg-gray-950/30 px-4 py-3">
                                        <summary className="cursor-pointer text-gray-200 font-semibold">{q}</summary>
                                        <p className="mt-2 text-sm text-gray-400">{a}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right side CTA (desktop only – optional) */}
                    <aside className="hidden lg:block">
                        <div className="rounded-2xl border border-gray-800 bg-gray-900/20 p-6">
                            <h3 className="text-lg font-bold text-white">¿Compras para tu equipo?</h3>
                            <p className="mt-2 text-sm text-gray-400">
                                Compra seats o paquetes y asigna a tus empleados cuando quieras.
                            </p>
                            <Link
                                href={`/org/catalog?courseId=${encodeURIComponent(course.id)}`}
                                className="mt-4 block text-center rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 font-semibold py-3"
                            >
                                Ir al portal empresa
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>

            {/* Mobile sticky CTA bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-950/95 backdrop-blur px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs text-gray-400">Precio</p>
                        <p className="text-lg font-bold">{hasPrice ? money(price!) : '—'}</p>
                    </div>
                    <button
                        onClick={buyNow}
                        disabled={!hasPrice || loadingCheckout}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 font-semibold px-5 py-3"
                    >
                        {loadingCheckout ? '…' : 'Comprar'}
                    </button>
                </div>
            </div>
        </main>
    );
}
