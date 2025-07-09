import Link from "next/link";
import SplitText from './SplitText';

export const metadata = {
  title: 'Welcome - Notion Template Shop',
  description: 'Premium Notion templates for productivity and organization.',
};

export default function LandingPage() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 px-4">
      {/* Animated heading using SplitText */}
      <SplitText
        text="notiontemplateshop.com"
        duration={0.7}
        delay={0.08}
        className="text-4xl font-bold text-[var(--primary-purple)]"
      />
      <h2 className="text-2xl font-semibold">Notion Template Shop</h2>
      <p className="max-w-md text-lg text-gray-700">
        Premium Notion templates designed to boost your productivity and organize your workflow.
      </p>
      <Link href="/" className="btn-primary">
        Browse Templates
      </Link>
    </main>
  );
}
// If you haven't already, run: npm install @reactbits/split-text
