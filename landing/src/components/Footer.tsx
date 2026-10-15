import { Link } from "react-router-dom";
import { PageContainer } from "./layout/PageContainer";
import { LifeOsMark } from "./brand/LifeOsLogo";

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-bg-canvas pt-14 pb-12 text-text-primary md:pt-20 md:pb-16 transition-colors duration-200">
      <PageContainer className="relative z-10">
        {/* Card */}
        <div className="mx-auto max-w-[1080px] rounded-2xl border border-border bg-bg-surface p-7 md:p-12 lg:p-14 transition-colors duration-200">
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1.5fr_1fr] md:gap-14">
            {/* Left Column: Brand, Tagline, Description & CTA */}
            <div>
              <div className="flex items-center gap-3">
                <LifeOsMark size={36} />
                <span className="text-xl font-semibold tracking-tight text-text-primary">
                  Life OS
                </span>
              </div>

              <p className="mt-5 text-base font-medium text-text-primary md:text-lg">
                Turn intentions into action.
              </p>

              <p className="mt-2 max-w-[460px] text-sm leading-relaxed text-text-secondary">
                A personal productivity system for people who want to spend less
                time managing tasks and more time making meaningful progress.
              </p>

              <div className="mt-6 md:mt-8">
                <a
                  href="https://laif-iota.vercel.app/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                >
                  Start with what matters →
                </a>
              </div>
            </div>

            {/* Right Column: Explore Navigation Links */}
            <div className="md:pl-8 lg:pl-16">
              <p className="text-sm font-medium text-text-muted">
                Explore
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="/#product"
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Why Life OS
                  </a>
                </li>
                <li>
                  <a
                    href="/#workflow"
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <Link
                    to="/case-study/life-os"
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Case study
                  </Link>
                </li>
                <li>
                  <a
                    href="/#faq"
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Divider & Sign-off Row */}
          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-7 text-xs sm:flex-row sm:items-center md:mt-16">
            <p className="text-text-muted">
              © 2026 Life OS. All rights reserved.
            </p>
            <p className="text-text-secondary">
              Made for people who want to do more of what matters.
            </p>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}