import { NextResponse } from "next/server";
import { getNews } from "@/lib/news-service";

export async function GET() {
  try {
    const news = await getNews();
    return NextResponse.json({ count: news.length, news });
  } catch (error) {
    console.error("Fallo en test-scraper:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
