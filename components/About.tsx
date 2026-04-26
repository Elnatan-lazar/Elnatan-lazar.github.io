"use client";

import { Lightbulb, Target, MessageSquare, Repeat } from "lucide-react";

const steps = [
  {
    icon: <Target size={20} />,
    title: "Diagnose First",
    desc: "We start by identifying exactly where you're stuck — not just the symptom but the root gap in understanding.",
  },
  {
    icon: <Lightbulb size={20} />,
    title: "Build Intuition",
    desc: "I explain every concept from first principles using real-world analogies, so it clicks — not just memorized.",
  },
  {
    icon: <Repeat size={20} />,
    title: "Practice Deliberately",
    desc: "Targeted problem sets that move from easy wins to exam-level challenges at exactly the right pace.",
  },
  {
    icon: <MessageSquare size={20} />,
    title: "Stay Connected",
    desc: "Questions between sessions? Send me a message. I don't disappear between classes.",
  },
];

const subjects = [
  {
    category: "Mathematics",
    color: "from-violet-600 to-purple-600",
    glowColor: "#7c3aed30",
    topics: ["Calculus I & II", "Linear Algebra", "Discrete Mathematics", "Probability & Statistics", "Differential Equations"],
  },
  {
    category: "Computer Science",
    color: "from-cyan-600 to-teal-600",
    glowColor: "#22d3ee30",
    topics: ["Data Structures", "Algorithms", "Python / Java / C++", "OOP & Design Patterns", "Interview Prep (LeetCode)"],
  },
];

export default function About() {
  return (
    <>
      {/* About section */}
      <section id="about" className="relative py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">Teaching Method</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              How I Actually Teach
            </h2>
            <p className="max-w-xl mx-auto text-slate-400 text-base">
              Forget passive lectures. My sessions are interactive, adaptive, and built around your specific blind spots.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="group relative p-6 rounded-2xl card-border transition-all duration-300 hover:-translate-y-1 hover:glow-purple"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 mb-4 group-hover:bg-violet-500/20 transition-colors">
                  {step.icon}
                </div>
                <div className="absolute top-4 right-4 text-slate-700 text-xs font-bold font-mono">
                  0{i + 1}
                </div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects section */}
      <section id="subjects" className="relative py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">Curriculum</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What I Cover</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {subjects.map((subj) => (
              <div
                key={subj.category}
                className="relative p-6 rounded-2xl card-border overflow-hidden group transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: `0 0 0 0 ${subj.glowColor}` }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${subj.glowColor}`)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${subj.glowColor}`)
                }
              >
                {/* Corner gradient */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${subj.color} opacity-10 rounded-full blur-2xl translate-x-8 -translate-y-8`}
                />
                <h3 className={`text-lg font-bold mb-4 bg-gradient-to-r ${subj.color} bg-clip-text text-transparent`}>
                  {subj.category}
                </h3>
                <ul className="space-y-2">
                  {subj.topics.map((t) => (
                    <li key={t} className="flex items-center gap-2 text-slate-300 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${subj.color} flex-shrink-0`} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
