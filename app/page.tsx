// app/page.tsx (SERVER)
import HomeClient from './HomeClient';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';

export const dynamic = 'force-dynamic';

type PageData = {
  id: string | number;
  title: string;
  subtitle: string;
  cta_text: string;
  footer_text: string;
};

export default async function HomePage() {
  const pages = await directus.request(
    readItems('pages', {
      filter: { slug: { _eq: 'home' } },
      limit: 1,
      fields: ['id', 'title', 'subtitle', 'cta_text', 'footer_text'],
    })
  );

  const raw = pages?.[0] as Partial<PageData> | undefined;

  const safePage: PageData = {
    id: raw?.id ?? 'missing',
    title: raw?.title ?? 'OuhNou Academy',
    subtitle: raw?.subtitle ?? 'Tu plataforma de aprendizaje, reinventada.',
    cta_text: raw?.cta_text ?? 'Entrar al LMS',
    footer_text: raw?.footer_text ?? '© 2025 OuhNou Academy — Creando futuros.',
  };

  return <HomeClient page={safePage} />;
}
