import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-background/80 mt-12 border-t backdrop-blur">
      <div className="text-muted-foreground mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-6 py-6 text-sm md:flex-row">
        <p>© {year} Vyapar. All rights reserved.</p>

        <div className="flex items-center gap-4">
          <Link
            href="/coins"
            className="hover:text-foreground transition-colors"
          >
            All Coins
          </Link>
          <Link
            href="https://swayam.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Built by Swayam
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
