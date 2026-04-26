import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingClient from "./BookingClient";

export const metadata: Metadata = {
  title: "Book a Session | Elnatan Lazar Tutoring",
  description: "Schedule your free 30-minute intro session in Math or Computer Science.",
};

export default function BookingPage() {
  return (
    <main>
      <Navbar />
      <BookingClient />
      <Footer />
    </main>
  );
}
