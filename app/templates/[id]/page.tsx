import { notFound } from "next/navigation";
import TemplateDetailsClient from "./TemplateDetailsClient";

export default async function TemplateDetails({ params }: { params: { id: string } }) {
  const { id } = params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/templates?id=${id}`, { cache: 'no-store' });
  if (!res.ok) return notFound();
  const data = await res.json();
  const template = Array.isArray(data) ? data[0] : data;
  if (!template) return notFound();
  return <TemplateDetailsClient template={template} />;
} 