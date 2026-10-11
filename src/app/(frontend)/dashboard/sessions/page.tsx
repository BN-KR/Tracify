import { redirect } from "next/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value !== undefined) params.set(key, value);
  }
  const query = params.toString();
  redirect(query ? `/dashboard?${query}` : "/dashboard");
}
