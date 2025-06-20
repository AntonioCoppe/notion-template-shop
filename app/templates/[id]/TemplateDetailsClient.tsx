"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface Template {
  id: string;
  title: string;
  price: number;
  img: string;
  description: string;
}

export default function TemplateDetailsClient({ template }: { template: Template }) {
  const router = useRouter();

  const handleBuy = () => {
    const cart: Template[] = JSON.parse(localStorage.getItem("cart") || "[]");
    // Avoid duplicates
    if (!cart.find((item) => item.id === template.id)) {
      cart.push({ id: template.id, title: template.title, price: template.price, img: template.img, description: template.description });
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    router.push("/cart");
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <img src={template.img} alt={template.title} className="rounded-lg w-full mb-6" style={{ maxHeight: 320, objectFit: 'cover' }} />
      <h1 className="text-3xl font-bold mb-2">{template.title}</h1>
      <p className="text-gray-600 mb-6">{template.description}</p>
      <div className="flex items-center gap-4 mb-8">
        <span className="text-xl font-semibold">${template.price}</span>
        <button onClick={handleBuy} className="rounded bg-black text-white px-6 py-2 hover:opacity-90">Buy</button>
      </div>
      <Link href="/" className="text-blue-600 hover:underline">← Back to templates</Link>
    </main>
  );
} 