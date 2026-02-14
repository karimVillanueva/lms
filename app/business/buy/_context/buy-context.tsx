'use client';

import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

export type BuyItem = {
    courseId: string;
    qtySeats: number;
    // W1: el price lo mostramos desde catálogo, pero el “source of truth” será W2 preview
    unitPrice?: number | null;
    title?: string | null;
    companyCoveragePercent: number; // 0-100
};

export type Assignment = {
    email: string;
    courseId: string;
};

type State = {
    items: BuyItem[];
    assignments: Assignment[];
};

type Action =
    | { type: 'SET_ITEMS'; items: BuyItem[] }
    | { type: 'SET_COVERAGE'; courseId: string; percent: number }
    | { type: 'SET_QTY'; courseId: string; qtySeats: number }
    | { type: 'SET_ASSIGNMENTS'; assignments: Assignment[] }
    | { type: 'RESET' }
    | { type: 'HYDRATE'; state: State };

const KEY = 'ouhnou_business_buy_v1';

const initial: State = { items: [], assignments: [] };

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'HYDRATE':
            return action.state;

        case 'SET_ITEMS':
            return { ...state, items: action.items };

        case 'SET_COVERAGE':
            return {
                ...state,
                items: state.items.map((it) =>
                    it.courseId === action.courseId
                        ? { ...it, companyCoveragePercent: clamp(Math.round(action.percent), 0, 100) }
                        : it
                ),
            };

        case 'SET_QTY':
            return {
                ...state,
                items: state.items.map((it) =>
                    it.courseId === action.courseId
                        ? { ...it, qtySeats: clamp(Math.floor(action.qtySeats || 0), 0, 9999) }
                        : it
                ),
            };

        case 'SET_ASSIGNMENTS':
            return { ...state, assignments: action.assignments };

        case 'RESET':
            return initial;

        default:
            return state;
    }
}

type Api = {
    state: State;
    setItems: (items: BuyItem[]) => void;
    setCoverage: (courseId: string, percent: number) => void;
    setQty: (courseId: string, qtySeats: number) => void;
    setAssignments: (a: Assignment[]) => void;
    reset: () => void;
};

const Ctx = createContext<Api | null>(null);

export function BusinessBuyProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initial);

    // hydrate
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as State;
            if (parsed?.items && Array.isArray(parsed.items)) {
                dispatch({ type: 'HYDRATE', state: parsed });
            }
        } catch { }
    }, []);

    // persist
    useEffect(() => {
        try {
            sessionStorage.setItem(KEY, JSON.stringify(state));
        } catch { }
    }, [state]);

    const api = useMemo<Api>(() => ({
        state,
        setItems: (items) => dispatch({ type: 'SET_ITEMS', items }),
        setCoverage: (courseId, percent) => dispatch({ type: 'SET_COVERAGE', courseId, percent }),
        setQty: (courseId, qtySeats) => dispatch({ type: 'SET_QTY', courseId, qtySeats }),
        setAssignments: (assignments) => dispatch({ type: 'SET_ASSIGNMENTS', assignments }),
        reset: () => dispatch({ type: 'RESET' }),
    }), [state]);

    return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useBusinessBuy() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useBusinessBuy must be used within BusinessBuyProvider');
    return ctx;
}
