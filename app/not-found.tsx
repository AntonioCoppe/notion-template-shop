import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: "2rem",
    }}>
      <h1 style={{ fontSize: "3rem", fontWeight: 700, color: "var(--primary-purple)" }}>404</h1>
      <h2 style={{ fontSize: "1.5rem", color: "var(--foreground)" }}>Page Not Found</h2>
      <p style={{ color: "var(--foreground)", maxWidth: 400 }}>
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="btn-primary" style={{ textDecoration: "none" }}>
        Go back home
      </Link>
    </div>
  );
} 