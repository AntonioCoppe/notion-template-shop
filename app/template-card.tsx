"use client";
import Image from "next/image";

export default function TemplateCard({
  title,
  price,
  img,
  description,
}: {
  id: string;
  title: string;
  price: number;
  img: string;
  description: string;
}) {
  return (
    <div className="border rounded-xl p-4 flex flex-col gap-4 shadow">
      <Image
        src={img}
        alt={title}
        width={400}
        height={250}
        className="rounded-lg object-cover"
      />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-gray-600 flex-grow">{description}</p>
      <button
        className="mt-2 rounded bg-black text-white py-2 hover:opacity-90"
        onClick={() => alert("Stripe checkout coming soon!")}
      >
        Buy for ${price}
      </button>
    </div>
  );
}
