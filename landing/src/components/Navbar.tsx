import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navigation } from "../data/navigation";
import { PageContainer } from "./layout/PageContainer";
import { LifeOsMark } from "./brand/LifeOsLogo";
import { useTheme } from "../context/ThemeContext";
import { useWaitlistModal } from "../context/WaitlistContext";

export function Navbar() {
  const { openWaitlist } = useWaitlistModal();
  const [scrolled, setScrolled] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isCaseStudy = location.pathname.startsWith("/case-study");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isCaseStudy
          ? scrolled
            ? "bg-[#FFFFFF]/95 backdrop-blur-xl border-b border-[#E8E8E8]"
            : "bg-[#FFFFFF] border-b border-[#E8E8E8]"
          : scrolled
          ? "bg-bg-primary/85 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav>
        <PageContainer className="flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <LifeOsMark size={32} className="transition-transform duration-200 group-hover:scale-105" />
          <span
            className={`font-semibold tracking-tight text-lg md:text-xl ${
              isCaseStudy ? "text-[#1B1B1B]" : "text-text-primary"
            }`}
          >
            Life OS
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navigation.links.map((link) => (
            link.href.startsWith("/") ? <Link
              key={link.href}
              to={link.href}
              className={`text-sm transition-colors ${
                isCaseStudy
                  ? "text-[#666666] hover:text-[#1B1B1B]"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {link.label}
            </Link> : <a
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                isCaseStudy
                  ? "text-[#666666] hover:text-[#1B1B1B]"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* Theme switcher button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200 active:scale-95 ${
              isCaseStudy
                ? "border-[#E8E8E8] bg-white text-[#555555] hover:text-[#111111] hover:border-[#CCCCCC]"
                : "border-border bg-bg-elevated/70 text-text-secondary hover:text-text-primary hover:border-border-hover"
            }`}
          >
            {theme === "dark" ? (
              <Sun size={16} className="text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
              <Moon size={16} className="text-indigo-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
            )}
          </button>

          <a
            href={navigation.login.href}
            className={`text-sm px-3 py-2 transition-colors ${
              isCaseStudy
                ? "text-[#666666] hover:text-[#1B1B1B]"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {navigation.login.label}
          </a>
          <button
            type="button"
            onClick={openWaitlist}
            className="button-primary button-sm"
          >
            Join Waitlist
          </button>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-bg-elevated/80 text-text-secondary"
          >
            {theme === "dark" ? (
              <Sun size={16} className="text-amber-400" />
            ) : (
              <Moon size={16} className="text-indigo-600" />
            )}
          </button>

          <button
            ref={menuButtonRef}
            className="p-2 text-text-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
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
                link.href.startsWith("/") ? <Link
                  key={link.href}
                  to={link.href}
                  className="text-text-secondary hover:text-text-primary py-2.5 px-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link> : <a
                  key={link.href}
                  href={link.href}
                  className="text-text-secondary hover:text-text-primary py-2.5 px-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >{link.label}</a>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                <a
                  href={navigation.login.href}
                  className="text-text-secondary hover:text-text-primary py-2.5 px-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {navigation.login.label}
                </a>
                <button
                  type="button"
                  className="button-primary text-center justify-center"
                  onClick={() => {
                    setMobileOpen(false);
                    openWaitlist();
                  }}
                >
                  Join Waitlist
                </button>
              </div>
            </PageContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
