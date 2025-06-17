"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function VendorPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [productName, setProductName] = useState('');
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setUser(data.user);
      setMessage('Signed up successfully');
    }
  };

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setUser(data.user);
      setMessage('Signed in');
    }
  };

  const handleAddProduct = async () => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: productName }),
    });
    const json = await res.json();
    if (res.ok) {
      setMessage('Product added');
      setProductName('');
    } else {
      setMessage(json.error || 'Error adding product');
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-10 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4">Vendor</h1>

      <input
        className="border p-2 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex gap-2">
        <button className="bg-black text-white px-4 py-2 rounded" onClick={handleSignUp}>
          Sign Up
        </button>
        <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={handleSignIn}>
          Sign In
        </button>
      </div>

      {user && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Add Product</h2>
          <input
            className="border p-2 rounded w-full"
            placeholder="Product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2" onClick={handleAddProduct}>
            Add
          </button>
        </div>
      )}

      {message && <p className="text-sm text-red-500 mt-2">{message}</p>}
    </main>
  );
}
