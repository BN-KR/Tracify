import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const secret = request.headers.get("x-vercel-reval-key");

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    if (body._type === "post") {
      const slug = body.slug?.current;
      revalidatePath("/blog");
      if (slug) {
        revalidatePath(`/blog/${slug}`);
      }
    } else {
      revalidatePath("/blog");
    }

    revalidatePath("/sitemap.xml");
    revalidatePath("/blog/rss.xml");

    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 }
    );
  }
}
