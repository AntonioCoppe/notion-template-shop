import TemplateCard from "./template-card";
import templates from "./templates";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Notion Template Shop
      </h1>

      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
        {templates.map(t => (
          <TemplateCard key={t.id} {...t} />
        ))}
      </div>
    </main>
  );
}
