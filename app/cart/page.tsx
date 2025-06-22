"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useRouter } from "next/navigation";
import { buyerApiCall } from "@/lib/api-client";

interface CartItem {
  id: string;
  title: string;
  price: number;
  img: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user, loading } = useSupabaseUser();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  // Enhanced access control with loading state
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/sign-in?redirect=/cart");
        return;
      }
      
      if (user.user_metadata?.role !== "buyer") {
        setAccessDenied(true);
        return;
      }
    }
  }, [user, loading, router]);

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const handleRemove = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const response = await buyerApiCall("/api/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          cartDetails: cart.map((item) => ({ id: item.id })),
        }),
      });

      const payload = await response.json();

      // on success, redirect to Stripe Checkout
      if (payload.url) {
        window.location.assign(payload.url);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Checkout failed. Please try again.");
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied message
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            This page is only accessible to buyers. Vendors cannot access the shopping cart.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-black text-white px-6 py-2 rounded hover:opacity-90"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Don't render the main content until we have a user and they're a buyer
  if (!user || user.user_metadata?.role !== "buyer") {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl mb-4">Your cart is empty.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4 mb-4"
              >
                <div className="flex items-center">
                  <Image
                    src={item.img}
                    alt={item.title}
                    width={80}
                    height={80}
                    className="rounded-lg mr-4"
                  />
                  <div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="text-gray-600">${item.price}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">${total}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || cart.length === 0}
              className="w-full rounded bg-black text-white py-3 text-lg hover:opacity-90 disabled:opacity-50"
            >
              {isCheckingOut ? "Processing..." : "Checkout"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
