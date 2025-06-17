'use client';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function NewProduct() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('products')
      .insert({ title, price: Number(price), description });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Product created!');
      setTitle('');
      setPrice('');
      setDescription('');
    }
  };

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="border p-2 rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="border p-2 rounded" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <textarea className="border p-2 rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit" className="rounded bg-black text-white py-2">Create</button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </main>
  );
}
