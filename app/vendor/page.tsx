import Link from 'next/link';

export default function VendorHome() {
  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vendor Area</h1>
      <ul className="flex flex-col gap-2">
        <li><Link className="underline" href="/vendor/sign-up">Sign Up</Link></li>
        <li><Link className="underline" href="/vendor/sign-in">Sign In</Link></li>
        <li><Link className="underline" href="/vendor/new-product">Add New Product</Link></li>
      </ul>
    </main>
  );
}
