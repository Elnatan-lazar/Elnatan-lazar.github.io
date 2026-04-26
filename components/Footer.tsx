import Link from "next/link";
import { Github, Linkedin, Mail, Code2, Heart } from "lucide-react";

const links = {
  nav: [
    { href: "#about", label: "About" },
    { href: "#subjects", label: "Subjects" },
    { href: "#testimonials", label: "Reviews" },
    { href: "/booking", label: "Book a Session" },
  ],
  social: [
    { href: "https://github.com/Elnatan-lazar", icon: <Github size={18} />, label: "GitHub" },
    { href: "https://linkedin.com/in/elnatan-lazar", icon: <Linkedin size={18} />, label: "LinkedIn" },
    { href: "mailto:elnatan@example.com", icon: <Mail size={18} />, label: "Email" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-[#1e1e2e] py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500">
                <Code2 size={14} className="text-white" />
              </div>
              <span className="text-white font-bold text-sm">
                Elnatan<span className="text-violet-400">.</span>dev
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Math &amp; CS tutoring that builds real understanding — not just exam passes.
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">Navigation</p>
            <ul className="space-y-2.5">
              {links.nav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-slate-500 text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">Connect</p>
            <div className="flex gap-3">
              {links.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="p-2.5 rounded-xl border border-[#1e1e2e] text-slate-400 hover:text-white hover:border-violet-500/40 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#1e1e2e] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} Elnatan Lazar. All rights reserved.
          </p>
          <p className="text-slate-700 text-xs flex items-center gap-1">
            Built with <Heart size={10} className="text-violet-500 fill-violet-500" /> using Next.js &amp; Tailwind
          </p>
        </div>
      </div>
    </footer>
  );
}
