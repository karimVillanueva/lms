import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function BusinessLanding() {
    return (
        <main className="min-h-screen bg-gray-950 text-white px-6 py-14">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-400">
                    Capacitación para tu empresa
                </h1>
                <p className="mt-4 text-gray-300 text-lg max-w-2xl">
                    Compra licencias, asigna a tu equipo y comparte el costo por curso si lo necesitas.
                </p>

                <div className="mt-8 flex gap-3">
                    <Link
                        href="/business/buy/select"
                        className="bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-lg font-semibold"
                    >
                        Comprar y asignar ahora
                    </Link>
                    <a href="#how" className="px-5 py-3 rounded-lg border border-gray-800 hover:bg-gray-900/40">
                        Ver cómo funciona
                    </a>
                </div>

                <section id="how" className="mt-14 grid gap-4 md:grid-cols-3">
                    {[
                        ['1) Elige cursos/paquetes', 'Selecciona licencias por curso o un bundle fijo.'],
                        ['2) Define aporte', 'Decide cuánto cubre la empresa por curso (0–100%).'],
                        ['3) Asigna y paga', 'Asigna emails y paga la parte empresa.'],
                    ].map(([t, d]) => (
                        <div key={t} className="border border-gray-800 rounded-xl p-5 bg-gray-900/30">
                            <h3 className="font-semibold text-indigo-200">{t}</h3>
                            <p className="mt-2 text-sm text-gray-300">{d}</p>
                        </div>
                    ))}
                </section>
            </div>
        </main>
    );
}
