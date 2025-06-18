"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
    id: string;
    title: string;
    price: number;
    img: string;
    description: string;
    priceId: string;
};

export default function TemplateCard({ id,title,price, img, description, priceId, }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleBuy = async () => {
        const email = prompt("Where should we send your template link?")?.trim();
        if (!email) return;

        setLoading(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId, email }),
            });

            if (!res.ok) throw new Error("Checkout session failed");
            const { url } = await res.json();
            router.push(url); // Stripe Checkout
        } catch (err) {
            console.error(err);
            alert("Something went wrong – please try again.");
            setLoading(false);
        }
    };

    return (
        <div
            data-template-id={id}
            className="border rounded-xl p-4 flex flex-col gap-4 shadow"
        >
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
                onClick={handleBuy}
                disabled={loading}
                className={`mt-2 rounded bg-black text-white py-2 hover:opacity-90 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
                {loading ? "Redirecting…" : `Buy for $${price}`}
            </button>
        </div>
    );
}