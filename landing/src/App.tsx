import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext";
import { WaitlistProvider } from "./context/WaitlistContext";
import { WaitlistModal } from "./components/waitlist/WaitlistModal";
import { useReferralCapture } from "./hooks/useReferralCapture";
import { AnnouncementBar } from "./components/AnnouncementBar";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import HomePage from "./pages/HomePage";

const LifeOsCaseStudyPage = lazy(() => import("./pages/LifeOsCaseStudyPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const WaitlistVerifiedPage = lazy(() => import("./pages/WaitlistVerifiedPage"));

function AppContent() {
  useReferralCapture();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary transition-colors duration-200">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/about"
            element={
              <Suspense fallback={<div className="px-6 py-20 text-center text-sm text-slate-500">Loading...</div>}>
                <AboutPage />
              </Suspense>
            }
          />
          <Route
            path="/waitlist/verified"
            element={
              <Suspense fallback={<div className="px-6 py-20 text-center text-sm text-slate-500">Loading your spot...</div>}>
                <WaitlistVerifiedPage />
              </Suspense>
            }
          />
          <Route path="/case-study/life-os" element={<Suspense fallback={<div className="px-6 py-20 text-center text-sm text-slate-500">Loading the case study...</div>}><LifeOsCaseStudyPage /></Suspense>} />
          <Route path="/case-study/life-os/:phase" element={<Suspense fallback={<div className="px-6 py-20 text-center text-sm text-slate-500">Loading the case study...</div>}><LifeOsCaseStudyPage /></Suspense>} />
        </Routes>
      </main>
      <Footer />
      <WaitlistModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WaitlistProvider>
        <BrowserRouter>
          <MotionConfig reducedMotion="user">
            <AppContent />
          </MotionConfig>
        </BrowserRouter>
      </WaitlistProvider>
    </ThemeProvider>
  );
}

