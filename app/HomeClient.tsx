// app/HomeClient.tsx
'use client';

import { useRouter } from 'next/navigation';
import { setAttr } from '@/lib/visual-editor';
import type { HTMLAttributes } from 'react';

type PageData = {
    id: string | number;
    title: string;
    subtitle: string;
    cta_text: string;
    footer_text: string;
};

// ✅ helper: garantiza que lo que se spread es un objeto
const attr = (enabled: boolean, value: unknown): HTMLAttributes<HTMLElement> =>
    enabled && value && typeof value === 'object' ? (value as any) : {};

export default function HomeClient({ page }: { page: PageData }) {
    const router = useRouter();
    const canEdit = Boolean(page?.id);

    const handleEnter = () => {
        router.push('/dashboard');
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-900 text-white font-sans">
            {/* LOGO */}
            <h1
                className="text-5xl md:text-6xl font-extrabold text-indigo-400 drop-shadow-lg opacity-0 animate-[fadeIn_1.2s_ease_forwards]"
                {...attr(canEdit, setAttr({ collection: 'pages', item: page.id, fields: 'title' }))}
            >
                {page.title}
            </h1>

            {/* SUBTÍTULO */}
            <p
                className="mt-4 text-lg md:text-xl text-gray-300 opacity-0"
                style={{ animation: 'fadeIn 1.2s ease forwards', animationDelay: '.4s' }}
                {...attr(canEdit, setAttr({ collection: 'pages', item: page.id, fields: 'subtitle' }))}
            >
                {page.subtitle}
            </p>

            {/* ILUSTRACIÓN */}
            <div
                className="mt-10 opacity-0"
                style={{ animation: 'fadeIn 1.2s ease forwards', animationDelay: '.8s' }}
            >
                <svg
                    width="220"
                    height="220"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    className="mx-auto text-indigo-300 drop-shadow-lg"
                >
                    <path d="M12 20l9-5-9-5-9 5 9 5z" />
                    <path d="M12 12l9-5-9-5-9 5 9 5z" />
                    <path d="M12 12v8" />
                </svg>
            </div>

            {/* BOTÓN */}
            <button
                onClick={handleEnter}
                className="mt-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition opacity-0"
                style={{ animation: 'fadeIn 1.2s ease forwards', animationDelay: '1.2s' }}
                {...attr(canEdit, setAttr({ collection: 'pages', item: page.id, fields: 'cta_text' }))}
            >
                {page.cta_text}
            </button>

            {/* FOOTER */}
            <footer
                className="absolute bottom-4 text-gray-500 text-sm"
                {...attr(canEdit, setAttr({ collection: 'pages', item: page.id, fields: 'footer_text' }))}
            >
                {page.footer_text}
            </footer>

            <style jsx>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
        </main>
    );
}
