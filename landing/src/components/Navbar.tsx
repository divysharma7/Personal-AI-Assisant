import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navigation } from "../data/navigation";
import { PageContainer } from "./layout/PageContainer";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg-primary/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav>
        <PageContainer className="flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-lg text-text-primary">
            Life OS
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navigation.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href={navigation.login.href}
            className="text-sm text-text-secondary transition-colors hover:text-text-primary px-3 py-2"
          >
            {navigation.login.label}
          </a>
          <a
            href={navigation.cta.href}
            className="text-sm font-medium bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg transition-colors"
          >
            {navigation.cta.label}
          </a>
        </div>

        <button
          className="md:hidden p-2 text-text-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        </PageContainer>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-primary border-b border-border overflow-hidden"
          >
            <PageContainer className="flex flex-col gap-1 py-4">
              {navigation.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-text-secondary hover:text-text-primary py-2.5 px-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                <a
                  href={navigation.login.href}
                  className="text-text-secondary hover:text-text-primary py-2.5 px-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {navigation.login.label}
                </a>
                <a
                  href={navigation.cta.href}
                  className="text-sm font-medium bg-accent text-white py-2.5 px-5 rounded-lg text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  {navigation.cta.label}
                </a>
              </div>
            </PageContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}