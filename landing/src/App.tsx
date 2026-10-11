import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AnnouncementBar } from "./components/AnnouncementBar";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import HomePage from "./pages/HomePage";

const LifeOsCaseStudyPage = lazy(() => import("./pages/LifeOsCaseStudyPage"));

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <AnnouncementBar />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/case-study/life-os" element={<Suspense fallback={<div className="px-6 py-20 text-center text-sm text-slate-500">Loading the case study…</div>}><LifeOsCaseStudyPage /></Suspense>} />
            <Route path="/case-study/life-os/:phase" element={<Suspense fallback={<div className="px-6 py-20 text-center text-sm text-slate-500">Loading the case study…</div>}><LifeOsCaseStudyPage /></Suspense>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
