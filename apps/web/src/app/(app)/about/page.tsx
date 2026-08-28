import { AboutPageContent } from '@/components/pages/AboutPageContent/AboutPageContent';
import { requireUser } from '@/server/session';

export default async function AboutPage() {
    await requireUser();
    return <AboutPageContent />;
}
