import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <main className="relative overflow-x-hidden">
      <Navbar />
      <Hero />
      <About />
      <Testimonials />

      {/* CTA Banner */}
      <section className="relative py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative p-10 sm:p-14 rounded-3xl overflow-hidden border border-violet-500/20 bg-[#0d0d18]">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/10 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Level Up?
              </h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Book a free 30-minute trial session. No commitment — just come with your toughest question.
              </p>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold shadow-[0_0_40px_#7c3aed50] hover:shadow-[0_0_60px_#7c3aed70] hover:opacity-90 transition-all"
              >
                <BookOpen size={18} />
                Book Free Trial
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
