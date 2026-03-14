import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-border bg-background/80 mt-12 border-t backdrop-blur">
      <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm md:flex-row">
        {/* Left */}
        <p>© {new Date().getFullYear()} Vyapar. All rights reserved.</p>

        {/* Right */}
        <Link
          href="https://swayam.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Built by Swayam
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
