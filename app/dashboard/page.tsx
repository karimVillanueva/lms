// app/dashboard/DashboardClient.tsx
'use client';

import { setAttr } from '@/lib/visual-editor';
import type { HTMLAttributes } from 'react';

type Course = {
    id: string | number;
    title?: string;
    description?: string;
};

const attr = (enabled: boolean, value: unknown): HTMLAttributes<HTMLElement> =>
    enabled && value && typeof value === 'object' ? (value as any) : {};

export default function DashboardClient({ courses }: { courses: Course[] }) {
    const canEdit = true; // el visual editor mostrará edición si estás en modo preview desde Directus

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
                        {courses.map((course) => (
                            <article
                                key={course.id}
                                className="border border-gray-800 rounded-lg p-4 hover:border-indigo-500 transition"
                                {...attr(canEdit, setAttr({ collection: 'courses', item: course.id }))}
                            >
                                <h3
                                    className="text-lg font-semibold text-indigo-300"
                                    {...attr(
                                        canEdit,
                                        setAttr({
                                            collection: 'courses',
                                            item: course.id,
                                            fields: ['title'],
                                        })
                                    )}
                                >
                                    {course.title}
                                </h3>

                                <p
                                    className="text-sm text-gray-400 mt-2"
                                    {...attr(
                                        canEdit,
                                        setAttr({
                                            collection: 'courses',
                                            item: course.id,
                                            fields: ['description'],
                                        })
                                    )}
                                >
                                    {course.description}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
