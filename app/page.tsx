import { getNews } from "@/lib/news-service";
import { NewsDashboard } from "@/components/NewsDashboard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const news = await getNews();

  return <NewsDashboard initialNews={news} />;
}
