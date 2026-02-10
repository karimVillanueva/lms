// app/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import HomeClient from './HomeClient';
import { getHomePage } from '@/lib/directus';

type PageData = {
  id: string | number;
  title: string;
  subtitle: string;
  cta_text: string;
  footer_text: string;
};

export default async function HomePage() {
  const raw = await getHomePage();

  const page: PageData = {
    id: raw?.id ?? 'missing',
    title: raw?.title ?? 'OuhNou Academy',
    subtitle: raw?.subtitle ?? 'Tu plataforma de aprendizaje, reinventada.',
    cta_text: raw?.cta_text ?? 'Entrar al LMS',
    footer_text: raw?.footer_text ?? '© 2025 OuhNou Academy — Creando futuros.',
  };

  return <HomeClient page={page} />;
}
