'use client';

import { useEffect } from 'react';
import { initVisualEditor } from '@/lib/visual-editor';

export default function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initVisualEditor();
    }, []);

    return <>{children}</>;
}
