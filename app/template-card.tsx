"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  id: string;
  title: string;
  price: number;
  img: string;
  description: string;
};

export default function TemplateCard({
  id,
  title,
  price,
  img,
  description,
}: Props) {
  const router = useRouter();

  const handleBuy = () => {
    const cart: Props[] = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!cart.find((item) => item.id === id)) {
      cart.push({ id, title, price, img, description });
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    router.push("/cart");
  };

  return (
    <div
      data-template-id={id}
      className="border rounded-xl p-4 flex flex-col gap-4 shadow card"
    >
      <Link href={`/templates/${id}`}>
        <Image
          src={img}
          alt={title}
          width={400}
          height={250}
          className="rounded-lg object-cover"
          priority={id === "freelancer-dashboard"}
          style={{ width: "auto", height: "auto" }}
        />
      </Link>
      <Link href={`/templates/${id}`} className="text-xl font-semibold hover:underline block">
        {title}
      </Link>
      <p className="text-sm text-gray-600 flex-grow">{description}</p>
      <Link href={`/templates/${id}`} className="text-blue-600 hover:underline text-sm mb-2">View details</Link>

      <button
        onClick={handleBuy}
        className="mt-2 rounded bg-black text-white py-2 hover:opacity-90 btn-primary"
      >
        {`Buy for $${price}`}
      </button>
    </div>
  );
}