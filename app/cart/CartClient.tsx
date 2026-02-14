'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from './cart-context';

type PriceInfo = { courseId: string; classId: string | null; price: number | null };

function money(n: number) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function CartClient() {
    const { items, count, setQty, remove, clear } = useCart();

    const [loadingPrices, setLoadingPrices] = useState(false);
    const [priceMap, setPriceMap] = useState<Record<string, PriceInfo>>({});

    // 🔒 Key estable para evitar refetches innecesarios
    const cartKey = useMemo(() => {
        return items.map((i) => `${i.id}:${i.qty}`).sort().join('|');
    }, [items]);

    // 1) Fetch precios reales
    useEffect(() => {
        const courseIds = items.map((i) => i.id);

        if (courseIds.length === 0) {
            setPriceMap({});
            return;
        }

        let cancelled = false;

        (async () => {
            setLoadingPrices(true);
            try {
                const res = await fetch('/api/prices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseIds }),
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.error || 'No se pudieron cargar precios');

                if (!cancelled) setPriceMap(data?.prices || {});
            } catch (e) {
                console.error('prices fetch error:', e);
                if (!cancelled) setPriceMap({});
            } finally {
                if (!cancelled) setLoadingPrices(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [cartKey]); // ✅ depende del key, no del array en sí

    // 2) Subtotal real
    const subtotal = useMemo(() => {
        return items.reduce((acc, it) => {
            const p = priceMap[it.id]?.price;
            if (typeof p !== 'number' || !Number.isFinite(p) || p <= 0) return acc;
            return acc + p * it.qty;
        }, 0);
    }, [items, priceMap]);

    // 3) Validación: cursos sin precio
    const missingPriceIds = useMemo(() => {
        if (loadingPrices) return []; // mientras carga, no bloquees por missing
        return items
            .filter((it) => {
                const p = priceMap[it.id]?.price;
                return !(typeof p === 'number' && Number.isFinite(p) && p > 0);
            })
            .map((it) => it.id);
    }, [items, priceMap, loadingPrices]);

    const canCheckout = items.length > 0 && missingPriceIds.length === 0 && !loadingPrices;

    return (
        <main className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <section className="max-w-5xl mx-auto">
                {/* Header */}
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
                            className="text-sm px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-60"
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
                            {items.map((it) => {
                                const p = priceMap[it.id]?.price;
                                const hasPrice = typeof p === 'number' && Number.isFinite(p) && p > 0;

                                return (
                                    <article
                                        key={it.id}
                                        className="border border-gray-800 rounded-lg p-4 bg-gray-900/30"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">{it.title}</h3>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    {loadingPrices
                                                        ? 'Cargando precio…'
                                                        : hasPrice
                                                            ? `${money(p)} c/u`
                                                            : 'Precio no disponible'}
                                                </p>
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

                                            <div className="font-semibold">{hasPrice ? money(p * it.qty) : '—'}</div>
                                        </div>

                                        {!loadingPrices && !hasPrice && (
                                            <p className="mt-3 text-xs text-amber-300/90">
                                                Este curso aún no tiene una clase/precio publicado. Quítalo para continuar.
                                            </p>
                                        )}
                                    </article>
                                );
                            })}
                        </div>

                        {/* Resumen */}
                        <aside className="border border-gray-800 rounded-lg p-5 bg-gray-900/30 h-fit">
                            <h2 className="text-lg font-semibold">Resumen</h2>

                            <div className="mt-4 flex items-center justify-between text-gray-300">
                                <span>Subtotal</span>
                                <span className="font-semibold text-white">
                                    {loadingPrices ? 'Calculando…' : money(subtotal)}
                                </span>
                            </div>

                            <button
                                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg disabled:opacity-60"
                                disabled={!canCheckout}
                                onClick={async () => {
                                    const res = await fetch('/api/checkout', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            mode: 'cart',
                                            items: items.map((it) => ({ id: it.id, qty: it.qty })),
                                        }),
                                    });

                                    const data = await res.json().catch(() => ({}));
                                    if (data?.url) window.location.href = data.url;
                                    else alert(data?.error || 'No se pudo iniciar checkout');
                                }}
                            >
                                {loadingPrices
                                    ? 'Cargando…'
                                    : missingPriceIds.length > 0
                                        ? 'Hay cursos sin precio'
                                        : 'Pagar con Stripe'}
                            </button>

                            <p className="mt-3 text-xs text-gray-500">
                                El precio se obtiene del catálogo oficial (Directus) y se valida en checkout.
                            </p>
                        </aside>
                    </div>
                )}
            </section>
        </main>
    );
}
