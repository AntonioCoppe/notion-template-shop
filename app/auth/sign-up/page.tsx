import Link from 'next/link';

export default function SignUpChoice() {
  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <div className="flex flex-col gap-3">
        <Link href="/vendor/sign-up" className="rounded bg-black text-white py-2 text-center">
          I&apos;m a Seller
        </Link>
        <Link href="/buyer/sign-up" className="rounded bg-black text-white py-2 text-center">
          I&apos;m a Buyer
        </Link>
      </div>
    </main>
  );
}
