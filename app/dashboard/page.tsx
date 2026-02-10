export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { getCourses } from '@/lib/directus';

export default async function DashboardPage() {
    const courses = await getCourses();

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
                    <p className="text-gray-500">
                        Aún no hay cursos creados en Directus.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {courses.map((course) => (
                            <article
                                key={course.id}
                                className="border border-gray-800 rounded-lg p-4 hover:border-indigo-500 transition"
                            >
                                <h3 className="text-lg font-semibold text-indigo-300">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-gray-400 mt-2">
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
