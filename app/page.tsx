import TemplateCard from "./template-card";
import templates from "./templates";
import Link from "next/link";

export const revalidate = 0;  // or force-dynamic, if you like

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Notion Template Shop
      </h1>
      <div className="flex justify-center gap-4 mb-8">
        <Link href="/auth/sign-in" className="rounded bg-black text-white px-4 py-2">
          Sign In
        </Link>
        <Link href="/auth/sign-up" className="rounded bg-black text-white px-4 py-2">
          Sign Up
        </Link>
      </div>
      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
        {templates.map((t) => (
          <TemplateCard key={t.id} {...t} />
        ))}
      </div>
    </main>
  );
}