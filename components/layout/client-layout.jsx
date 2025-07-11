"use client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { Toaster } from "@/components/ui/sonner";

export function ClientLayout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartDrawer />
      <Toaster />
    </>
  );
}
