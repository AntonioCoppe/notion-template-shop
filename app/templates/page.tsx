"use client";

import { useEffect, useState } from "react";
import TemplateCard from "../template-card";

interface Template {
  id: string;
  title: string;
  price: number;
  img: string;
  description: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">All Notion Templates</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Browse our full collection of Notion templates.
      </p>
      {loading ? (
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