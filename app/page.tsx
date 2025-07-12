"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const testimonials = [
  {
    text: "This marketplace transformed the way I organize my work. The templates are beautiful and so easy to use!",
    author: "Jane Doe / Project Manager, ABC Corp",
  },
  {
    text: "A fantastic resource for Notion users. I found exactly what I needed in minutes.",
    author: "John Smith / Freelancer",
  },
  {
    text: "The best Notion template shop out there. Highly recommended!",
    author: "Emily Chen / Startup Founder",
  },
];

export default function Home() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const nextTestimonial = () => setTestimonialIdx((testimonialIdx + 1) % testimonials.length);
  const prevTestimonial = () => setTestimonialIdx((testimonialIdx - 1 + testimonials.length) % testimonials.length);

  return (
    <>
      {/* Hero Section */}
      <section className="hero w-full max-w-full overflow-x-hidden">
        <div className="hero__image" style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image
            src="/backgound.png"
            alt="Notion Templates Hero"
            fill
            style={{
              objectFit: "cover",
              borderRadius: "var(--border-radius)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
            }}
            priority
          />
        </div>
        <h1 className="hero__title px-2 text-2xl sm:text-3xl md:text-5xl">Unlock Your Creativity with Notion Templates</h1>
        <p className="hero__subtitle px-2 text-base sm:text-lg md:text-xl">
          Discover a diverse collection of professionally designed Notion templates to boost your productivity, streamline your workflow, and spark your creativity. Whether for work, study, or personal projects, you’ll find the perfect template to meet your needs.
        </p>
        <div className="buttons flex flex-col sm:flex-row gap-2 sm:gap-4 px-2 w-full max-w-xs mx-auto">
          <Link href="/templates" className="btn-primary">Explore</Link>
          <Link href="#" className="btn-secondary">Learn More</Link>
        </div>
      </section>
      {/* Marketplace Intro */}
      <section className="section-intro w-full px-2">
        <div className="section-intro__small">Explore</div>
        <div className="section-intro__headline">Discover Our Unique Notion Templates Marketplace</div>
        <div className="section-intro__text">
          Our marketplace offers a curated selection of Notion templates crafted by top creators. From project management to personal growth, you’ll find the perfect fit.
        </div>
      </section>
      {/* Features Grid */}
      <section className="container w-full px-2">
        <div className="features">
          <div className="feature-card">
            <div className="feature-card__image" />
            <div className="feature-card__title">Curated Selection</div>
            <div className="feature-card__desc">Handpicked templates for every use case, ensuring quality and variety.</div>
          </div>
          <div className="feature-card">
            <div className="feature-card__image" />
            <div className="feature-card__title">Easy Customization</div>
            <div className="feature-card__desc">Effortlessly adapt templates to your workflow and style.</div>
          </div>
          <div className="feature-card">
            <div className="feature-card__image" />
            <div className="feature-card__title">Instant Access</div>
            <div className="feature-card__desc">Get started right away with instant downloads and clear instructions.</div>
          </div>
        </div>
        <div className="feature-actions flex flex-col sm:flex-row gap-2 sm:gap-6 mt-4 justify-center items-center text-center">
          <Link href="/templates">Browse</Link>
          <Link href="/auth/sign-up">Get Started</Link>
        </div>
      </section>
      {/* Testimonial Carousel */}
      <section className="testimonial w-full px-2">
        <button className="arrow arrow--left" onClick={prevTestimonial} aria-label="Previous testimonial">&#8592;</button>
        <div className="testimonial__text">“{testimonials[testimonialIdx].text}”</div>
        <div className="testimonial__author">{testimonials[testimonialIdx].author}</div>
        <button className="arrow arrow--right" onClick={nextTestimonial} aria-label="Next testimonial">&#8594;</button>
        <div className="dots">
          {testimonials.map((_, i) => (
            <span key={i} style={{
              display: 'inline-block',
              width: 8, height: 8, borderRadius: '50%',
              background: i === testimonialIdx ? 'var(--color-accent)' : '#ccc',
              margin: '0 4px',
            }} />
          ))}
        </div>
      </section>
      {/* Best Selling Section */}
      <section className="best-selling container w-full flex flex-col md:flex-row items-center gap-6 px-2">
        <div className="best-selling__text w-full md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="best-selling__heading">Best-Selling Templates</div>
          <div className="best-selling__para">Explore our most popular Notion templates, loved by thousands of users for their design and functionality.</div>
          <Link href="/templates" className="btn-primary mt-2 mx-auto md:mx-0">See Best Sellers</Link>
        </div>
        <div className="best-selling__image w-full md:w-1/2 mx-auto md:mx-0" />
      </section>
      {/* Newsletter / Final CTA */}
      <section className="newsletter container w-full flex flex-col md:flex-row items-center gap-6 px-2 text-center md:text-left">
        <div className="newsletter__heading w-full md:w-1/2 mx-auto md:mx-0">Discover Your Perfect Template</div>
        <div className="newsletter__content w-full md:w-1/2 flex flex-col items-center md:items-start">
          <div className="newsletter__para">Join our community and get updates on the latest Notion templates, tips, and exclusive offers.</div>
          <div className="buttons flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 w-full max-w-xs mx-auto md:mx-0 md:w-auto">
            <Link href="/templates" className="btn-primary">Explore</Link>
            <Link href="#" className="btn-secondary">Subscribe</Link>
          </div>
        </div>
      </section>
    </>
  );
}