"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Yael K.",
    role: "Engineering Student · Tel Aviv University",
    text: "I was completely lost in Linear Algebra before Elnatan. He explained eigenvalues in a way that suddenly made everything click. Passed my exam with an 87 — up from a 54 the semester before.",
    rating: 5,
  },
  {
    name: "Ariel M.",
    role: "CS Student · Technion",
    text: "His approach to algorithms is different from any tutor I've had. Instead of just showing solutions, he teaches you how to think through problems. My LeetCode performance improved dramatically.",
    rating: 5,
  },
  {
    name: "Noa S.",
    role: "Pre-university student",
    text: "I was dreading Calculus 2. Three sessions with Elnatan and I finally understood integrals. He's patient, clear, and actually cares that you understand — not just get through the material.",
    rating: 5,
  },
  {
    name: "Daniel R.",
    role: "Software Engineering Student",
    text: "Best investment for my semester. We worked through Data Structures and he helped me build intuition for complexity analysis. Aced my midterm.",
    rating: 5,
  },
  {
    name: "Maya T.",
    role: "Math Major · Hebrew University",
    text: "Incredibly well-prepared sessions. He sends practice problems beforehand, tracks my weak spots, and follows up after class. Rare to find someone this dedicated.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent((idx + reviews.length) % reviews.length);
      setTimeout(() => setIsAnimating(false), 400);
    },
    [isAnimating]
  );

  useEffect(() => {
    const id = setInterval(() => goTo(current + 1), 6000);
    return () => clearInterval(id);
  }, [current, goTo]);

  const prev = reviews[(current - 1 + reviews.length) % reviews.length];
  const next = reviews[(current + 1) % reviews.length];

  return (
    <section id="testimonials" className="relative py-24 px-4 sm:px-6 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">Reviews</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What Students Say</h2>
          <p className="text-slate-400 text-sm">Real results from real students.</p>
        </div>

        {/* Slider */}
        <div className="relative">
          {/* Main card */}
          <div
            className={`relative mx-auto max-w-2xl p-8 sm:p-10 rounded-2xl card-border glow-purple transition-all duration-400 ${
              isAnimating ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"
            }`}
          >
            <Quote size={32} className="text-violet-500/30 mb-4" />
            <div className="flex mb-4">
              {Array.from({ length: reviews[current].rating }).map((_, i) => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed mb-6 italic">
              &ldquo;{reviews[current].text}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {reviews[current].name[0]}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{reviews[current].name}</p>
                <p className="text-slate-500 text-xs">{reviews[current].role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => goTo(current - 1)}
              className="p-2.5 rounded-xl border border-[#1e1e2e] text-slate-400 hover:text-white hover:border-violet-500/40 transition-all"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`transition-all rounded-full ${
                    i === current
                      ? "w-6 h-2 bg-violet-500"
                      : "w-2 h-2 bg-slate-700 hover:bg-slate-500"
                  }`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => goTo(current + 1)}
              className="p-2.5 rounded-xl border border-[#1e1e2e] text-slate-400 hover:text-white hover:border-violet-500/40 transition-all"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Side previews (desktop) */}
        <div className="hidden lg:flex items-stretch gap-4 mt-6 max-w-4xl mx-auto">
          {[prev, next].map((r, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx === 0 ? current - 1 : current + 1)}
              className="flex-1 text-left p-5 rounded-xl bg-[#111118] border border-[#1e1e2e] opacity-50 hover:opacity-75 transition-opacity"
            >
              <div className="flex mb-2">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-400 text-xs line-clamp-2 italic">&ldquo;{r.text}&rdquo;</p>
              <p className="text-slate-600 text-xs mt-2">— {r.name}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
