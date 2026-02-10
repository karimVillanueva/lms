'use client';

import { useEffect } from 'react';
import { initVisualEditor } from '@/lib/visual-editor';
import { CartProvider } from './cart/cart-context';

export default function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initVisualEditor();
    }, []);

    return <CartProvider>{children}</CartProvider>;
}
