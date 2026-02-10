// app/courses/[id]/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import CourseClient from './CourseClient';
import { getCourseById, getLatestClassForCourse } from '@/lib/directus';

export default async function CoursePage({
    params,
}: {
    params: { id: string };
}) {
    const courseId = params.id;

    const course = await getCourseById(courseId);
    if (!course) {
        return (
            <main className="min-h-screen bg-gray-950 text-white px-6 py-10">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-bold text-indigo-400">Curso no encontrado</h1>
                    <p className="mt-2 text-gray-400">Revisa el enlace o vuelve al catálogo.</p>
                </div>
            </main>
        );
    }

    const cls = await getLatestClassForCourse(courseId); // R3: “más reciente”
    const price = cls?.price ?? null;

    return <CourseClient course={course} classInfo={cls} price={price} />;
}
