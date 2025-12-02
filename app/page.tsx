import { getNews } from '@/lib/news-service';
import { NewsDashboard } from '@/components/NewsDashboard';

// Revalidate every 15 minutes
export const revalidate = 900;

export default async function Home() {
  const news = await getNews();

  return (
    <NewsDashboard initialNews={news} />
  );
}
