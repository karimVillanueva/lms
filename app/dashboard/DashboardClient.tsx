'use client';

import { useMemo, useState } from 'react';
import { setAttr } from '@/lib/visual-editor';
import type { HTMLAttributes } from 'react';
import type { Course } from '@/lib/directus';

const attr = (value: unknown): HTMLAttributes<HTMLElement> =>
    value && typeof value === 'object' ? (value as any) : {};

export default function DashboardClient({ courses }: { courses: Course[] }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftTitle, setDraftTitle] = useState('');
    const [draftDesc, setDraftDesc] = useState('');
    const [saving, setSaving] = useState(false);

    const startEdit = (c: Course) => {
        setEditingId(c.id);
        setDraftTitle(c.title ?? '');
        setDraftDesc(c.description ?? '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraftTitle('');
        setDraftDesc('');
    };

    const save = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/courses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: draftTitle, description: draftDesc }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || 'Error al guardar');
            }

            // Opción simple: recargar para ver cambios
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('No se pudo guardar. Revisa consola/permisos.');
        } finally {
            setSaving(false);
            setEditingId(null);
        }
    };

    return (
        <main className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <section className="max-w-5xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-indigo-400">
                        Panel de cursos
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Bienvenido a tu panel de OuhNou Academy conectado a Directus. 🎓
                    </p>
                </header>

                <h2 className="text-2xl font-semibold mb-4">Cursos disponibles</h2>

                {!courses || courses.length === 0 ? (
                    <p className="text-gray-500">Aún no hay cursos creados en Directus.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {courses.map((course) => {
                            const isEditing = editingId === course.id;

                            return (
                                <article
                                    key={course.id}
                                    className="border border-gray-800 rounded-lg p-4 hover:border-indigo-500 transition"
                                    {...attr(setAttr({ collection: 'courses', item: course.id }))}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        {!isEditing ? (
                                            <h3
                                                className="text-lg font-semibold text-indigo-300"
                                                {...attr(
                                                    setAttr({
                                                        collection: 'courses',
                                                        item: course.id,
                                                        fields: ['title'],
                                                    })
                                                )}
                                            >
                                                {course.title ?? 'Sin título'}
                                            </h3>
                                        ) : (
                                            <input
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-indigo-100 outline-none focus:border-indigo-500"
                                                value={draftTitle}
                                                onChange={(e) => setDraftTitle(e.target.value)}
                                                placeholder="Título del curso"
                                            />
                                        )}

                                        {!isEditing ? (
                                            <button
                                                onClick={() => startEdit(course)}
                                                className="shrink-0 text-sm px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700"
                                            >
                                                Editar
                                            </button>
                                        ) : (
                                            <div className="shrink-0 flex gap-2">
                                                <button
                                                    onClick={() => save(course.id)}
                                                    disabled={saving}
                                                    className="text-sm px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
                                                >
                                                    {saving ? 'Guardando…' : 'Guardar'}
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    disabled={saving}
                                                    className="text-sm px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-60"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {!isEditing ? (
                                        <p
                                            className="text-sm text-gray-400 mt-2"
                                            {...attr(
                                                setAttr({
                                                    collection: 'courses',
                                                    item: course.id,
                                                    fields: ['description'],
                                                })
                                            )}
                                        >
                                            {course.description ?? course.summary ?? 'Sin descripción todavía'}
                                        </p>
                                    ) : (
                                        <textarea
                                            className="mt-3 w-full min-h-[90px] bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100 outline-none focus:border-indigo-500"
                                            value={draftDesc}
                                            onChange={(e) => setDraftDesc(e.target.value)}
                                            placeholder="Descripción"
                                        />
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
