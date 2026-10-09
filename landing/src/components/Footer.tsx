import { Github, Twitter } from "lucide-react";
import { PageContainer } from "./layout/PageContainer";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#product" },
      { label: "Use Cases", href: "#use-cases" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Blog", href: "#" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary">
      <PageContainer className="py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-lg text-text-primary">
                Life OS
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-[240px] mb-5">
              One calm interface for tasks, habits, calendar, focus, workflows,
              and AI. Your daily operating system.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/divysharma7/Personal-AI-Assisant"
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border-hover transition-colors"
                aria-label="GitHub"
              >
                <Github size={14} />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border-hover transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={14} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-medium text-text-primary mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-text-muted">
            &copy; {new Date().getFullYear()} Life OS. All rights reserved.
          </p>
          <p className="text-[11px] text-text-muted">
            Built with React · Express · Prisma
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}