export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getCourses } from '@/lib/directus';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const courses = await getCourses();
    return <DashboardClient courses={courses} />;
}
