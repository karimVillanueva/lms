'use client';

import Link from 'next/link';
import { useCart } from './cart-context';

function money(n: number) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function CartClient() {
    const { items, subtotal, count, setQty, remove, clear } = useCart();

    return (
        <main className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <section className="max-w-5xl mx-auto">
                <header className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-400">Carrito</h1>
                        <p className="text-gray-400 mt-1">{count} artículo(s)</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="text-sm px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700"
                        >
                            Seguir comprando
                        </Link>

                        <button
                            onClick={clear}
                            className="text-sm px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700"
                            disabled={items.length === 0}
                        >
                            Vaciar
                        </button>
                    </div>
                </header>

                {items.length === 0 ? (
                    <p className="mt-8 text-gray-500">Tu carrito está vacío.</p>
                ) : (
                    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                        {/* Lista */}
                        <div className="space-y-3">
                            {items.map((it) => (
                                <article
                                    key={it.id}
                                    className="border border-gray-800 rounded-lg p-4 bg-gray-900/30"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">{it.title}</h3>
                                            <p className="text-gray-400 text-sm mt-1">{money(it.price)} c/u</p>
                                        </div>

                                        <button
                                            onClick={() => remove(it.id)}
                                            className="text-sm px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700"
                                        >
                                            Quitar
                                        </button>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="w-9 h-9 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700"
                                                onClick={() => setQty(it.id, it.qty - 1)}
                                            >
                                                −
                                            </button>

                                            <input
                                                value={it.qty}
                                                onChange={(e) => setQty(it.id, Number(e.target.value || 1))}
                                                className="w-16 text-center bg-gray-900 border border-gray-700 rounded h-9"
                                                inputMode="numeric"
                                            />

                                            <button
                                                className="w-9 h-9 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700"
                                                onClick={() => setQty(it.id, it.qty + 1)}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="font-semibold">{money(it.price * it.qty)}</div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Resumen */}
                        <aside className="border border-gray-800 rounded-lg p-5 bg-gray-900/30 h-fit">
                            <h2 className="text-lg font-semibold">Resumen</h2>
                            <div className="mt-4 flex items-center justify-between text-gray-300">
                                <span>Subtotal</span>
                                <span className="font-semibold text-white">{money(subtotal)}</span>
                            </div>

                            <button
                                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg disabled:opacity-60"
                                disabled={items.length === 0}
                                onClick={async () => {
                                    const res = await fetch('/api/checkout', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ items }),
                                    });
                                    const data = await res.json();
                                    if (data?.url) window.location.href = data.url;
                                    else alert(data?.error || 'No se pudo iniciar checkout');
                                }}
                            >
                                Pagar con Stripe
                            </button>


                            <p className="mt-3 text-xs text-gray-500">
                                Este carrito es local (localStorage). Para pagos reales, se conecta un checkout.
                            </p>
                        </aside>
                    </div>
                )}
            </section>
        </main>
    );
}
