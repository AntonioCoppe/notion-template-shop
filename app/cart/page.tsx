"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CartItem {
  id: string;
  title: string;
  price: number;
  img: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    setCart(stored ? JSON.parse(stored) : []);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = () => {
    // For now, just alert. Later, implement checkout logic.
    alert("Proceeding to checkout (to be implemented)");
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {cart.length === 0 ? (
        <div className="text-gray-600 text-center py-12">
          Your cart is empty.<br />
          <Link href="/" className="text-blue-600 hover:underline">Browse templates</Link>
        </div>
      ) : (
        <div>
          <ul className="mb-6 divide-y">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <img src={item.img} alt={item.title} className="w-16 h-16 rounded object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-gray-500 text-sm">${item.price}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mb-6">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">${total}</span>
          </div>
          <button onClick={handleCheckout} className="w-full rounded bg-black text-white py-3 text-lg hover:opacity-90">Checkout</button>
        </div>
      )}
    </main>
  );
} 