"use client";

import { useEffect, useState } from "react";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import TemplateCard from "../template-card";

// Define the Template type
interface Template {
  id: string;
  title: string;
  price: number;
  img: string;
  description: string;
}

export default function DashboardPage() {
  const { user, loading } = useSupabaseUser();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      const res = await fetch("/api/templates");
      const json = await res.json();
      setTemplates(json.data || []);
      setTemplatesLoading(false);
    };
    fetchTemplates();
  }, []);

  if (loading) {
    return <main className="max-w-4xl mx-auto px-4 py-20 text-center">Loading...</main>;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Welcome, {user?.email || "buyer"}!</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">Browse all available Notion templates below and find the perfect one for you.</p>
      {templatesLoading ? (
        <div className="text-center py-12 text-lg">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-lg">No templates available at the moment.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {templates.map((tpl) => (
            <TemplateCard key={tpl.id} {...tpl} />
          ))}
        </div>
      )}
    </main>
  );
} 