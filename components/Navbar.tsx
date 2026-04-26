"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Code2, BookOpen } from "lucide-react";

const links = [
  { href: "#about", label: "About" },
  { href: "#subjects", label: "Subjects" },
  { href: "#testimonials", label: "Reviews" },
  { href: "/booking", label: "Book a Session", cta: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#1e1e2e]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-white hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500">
            <Code2 size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            Elnatan<span className="text-violet-400">.</span>dev
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) =>
            l.cta ? (
              <Link
                key={l.href}
                href={l.href}
                className="ml-4 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-[0_0_20px_#7c3aed40]"
              >
                <BookOpen size={14} className="inline mr-1.5 -mt-0.5" />
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                {l.label}
              </a>
            )
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-[#1e1e2e] px-4 pb-4">
          <div className="flex flex-col gap-1 pt-2">
            {links.map((l) =>
              l.cta ? (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="mt-2 w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-medium"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  {l.label}
                </a>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
