// app/page.tsx (SERVER COMPONENT)
import HomeClient from './HomeClient';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';

export default async function HomePage() {
  const pages = await directus.request(
    readItems('pages', {
      filter: { slug: { _eq: 'home' } },
      limit: 1,
    })
  );

  const page = pages?.[0] ?? {
    id: 'missing',
    title: 'OuhNou Academy',
    subtitle: 'Tu plataforma de aprendizaje, reinventada.',
    cta_text: 'Entrar al LMS',
    footer_text: '© 2025 OuhNou Academy — Creando futuros.',
  };

  return (<HomeClient page={page} />);
}
