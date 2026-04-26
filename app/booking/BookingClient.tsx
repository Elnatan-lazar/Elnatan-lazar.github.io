"use client";

import { useEffect, useRef } from "react";
import { sendWhatsAppNotification } from "@/app/actions/notify";
import { Calendar, Clock, MessageCircle, Zap } from "lucide-react";

// Replace with your actual Cal.com username / event-slug
const CAL_URL = "https://cal.com/elnatan/30min";

const perks = [
  { icon: <Clock size={16} />, text: "30-minute free intro session" },
  { icon: <Calendar size={16} />, text: "Flexible scheduling — evenings & weekends" },
  { icon: <MessageCircle size={16} />, text: "WhatsApp support between sessions" },
  { icon: <Zap size={16} />, text: "Instant confirmation" },
];

export default function BookingClient() {
  const notified = useRef(false);

  // Fire WhatsApp notification on first render (page visit)
  useEffect(() => {
    if (notified.current) return;
    notified.current = true;
    sendWhatsAppNotification({ event: "booking_page_visit" }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Booking
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Book a Session
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Pick a time that works for you. Your first 30-minute session is completely free.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Cal.com embed */}
          <div className="relative rounded-2xl overflow-hidden border border-[#1e1e2e] bg-[#111118] min-h-[650px]">
            {/* Seamless iframe with dark theme parameter */}
            <iframe
              src={`${CAL_URL}?embed=true&theme=dark&layout=month_view`}
              className="w-full h-full min-h-[650px] border-0"
              title="Book a tutoring session"
              allow="payment"
            />
          </div>

          {/* Info sidebar */}
          <aside className="space-y-5">
            {/* Session perks */}
            <div className="p-6 rounded-2xl card-border">
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
                What&apos;s included
              </h3>
              <ul className="space-y-3">
                {perks.map((p) => (
                  <li key={p.text} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="text-violet-400 flex-shrink-0">{p.icon}</span>
                    {p.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing */}
            <div className="p-6 rounded-2xl border border-violet-500/20 bg-[#0d0d18] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl" />
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest relative">
                Pricing
              </h3>
              <div className="space-y-3 relative">
                {[
                  { label: "Free Trial (30 min)", price: "Free" },
                  { label: "Single Session (60 min)", price: "₪150" },
                  { label: "5-Session Pack", price: "₪650" },
                  { label: "10-Session Pack", price: "₪1,200" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{item.label}</span>
                    <span
                      className={`font-semibold text-sm ${
                        item.price === "Free" ? "text-emerald-400" : "text-white"
                      }`}
                    >
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact fallback */}
            <div className="p-5 rounded-2xl card-border text-center">
              <p className="text-slate-500 text-xs mb-3">Prefer to reach out directly?</p>
              <a
                href="mailto:elnatan@example.com"
                className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
              >
                elnatan@example.com
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
