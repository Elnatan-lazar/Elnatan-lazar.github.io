"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, GraduationCap, Binary } from "lucide-react";

const stats = [
  { value: "50+", label: "Students Helped" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "3+", label: "Years Teaching" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/5 rounded-full blur-[160px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#a78bfa 1px, transparent 1px), linear-gradient(90deg, #a78bfa 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
          <Sparkles size={12} />
          CS Student · Math & Programming Tutor
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
          Master{" "}
          <span className="gradient-text">Math & CS</span>
          <br />
          with a{" "}
          <span className="text-white">Top Student</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed mb-10">
          I break down complex topics — from calculus and linear algebra to algorithms and data structures —
          into clear, intuitive steps. No fluff, just results.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/booking"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold text-sm shadow-[0_0_30px_#7c3aed40] hover:shadow-[0_0_40px_#7c3aed60] hover:opacity-90 transition-all"
          >
            Book a Free Trial
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#about"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[#1e1e2e] text-slate-300 font-medium text-sm hover:border-violet-500/40 hover:text-white transition-all"
          >
            Learn More
          </a>
        </div>

        {/* Subject pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {[
            { icon: <Binary size={14} />, label: "Data Structures" },
            { icon: <Binary size={14} />, label: "Algorithms" },
            { icon: <GraduationCap size={14} />, label: "Calculus" },
            { icon: <GraduationCap size={14} />, label: "Linear Algebra" },
            { icon: <Binary size={14} />, label: "Python / Java" },
            { icon: <GraduationCap size={14} />, label: "Discrete Math" },
          ].map((s) => (
            <span
              key={s.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111118] border border-[#1e1e2e] text-slate-400 text-xs font-medium hover:border-violet-500/30 hover:text-violet-300 transition-all cursor-default"
            >
              {s.icon}
              {s.label}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center p-4 rounded-xl card-border transition-colors"
            >
              <span className="text-2xl sm:text-3xl font-bold gradient-text">{s.value}</span>
              <span className="text-xs text-slate-500 mt-1 text-center">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
