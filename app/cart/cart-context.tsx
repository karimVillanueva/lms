'use client';

import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

export type CartItem = {
    id: string;            // course id
    title: string;
    price: number;         // en centavos o en unidades; aquí lo dejamos en number simple
    qty: number;
};

type State = { items: CartItem[] };

type Action =
    | { type: 'ADD'; item: Omit<CartItem, 'qty'>; qty?: number }
    | { type: 'REMOVE'; id: string }
    | { type: 'SET_QTY'; id: string; qty: number }
    | { type: 'CLEAR' }
    | { type: 'HYDRATE'; state: State };

const STORAGE_KEY = 'ouhnou_cart_v1';

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'HYDRATE':
            return action.state;

        case 'ADD': {
            const qty = Math.max(1, action.qty ?? 1);
            const idx = state.items.findIndex((x) => x.id === action.item.id);
            if (idx >= 0) {
                const next = [...state.items];
                next[idx] = { ...next[idx], qty: next[idx].qty + qty };
                return { items: next };
            }
            return { items: [...state.items, { ...action.item, qty }] };
        }

        case 'REMOVE':
            return { items: state.items.filter((x) => x.id !== action.id) };

        case 'SET_QTY': {
            const qty = Math.max(1, Math.floor(action.qty || 1));
            return {
                items: state.items.map((x) => (x.id === action.id ? { ...x, qty } : x)),
            };
        }

        case 'CLEAR':
            return { items: [] };

        default:
            return state;
    }
}

type CartApi = {
    items: CartItem[];
    count: number;
    subtotal: number;
    add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
    remove: (id: string) => void;
    setQty: (id: string, qty: number) => void;
    clear: () => void;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, { items: [] });

    // Hydrate from localStorage once
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as State;
            if (parsed?.items && Array.isArray(parsed.items)) {
                dispatch({ type: 'HYDRATE', state: parsed });
            }
        } catch {
            // ignore
        }
    }, []);

    // Persist on change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // ignore
        }
    }, [state]);

    const api = useMemo<CartApi>(() => {
        const count = state.items.reduce((a, x) => a + x.qty, 0);
        const subtotal = state.items.reduce((a, x) => a + x.qty * x.price, 0);

        return {
            items: state.items,
            count,
            subtotal,
            add: (item, qty) => dispatch({ type: 'ADD', item, qty }),
            remove: (id) => dispatch({ type: 'REMOVE', id }),
            setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
            clear: () => dispatch({ type: 'CLEAR' }),
        };
    }, [state.items]);

    return <CartContext.Provider value={ api }> { children } </CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
