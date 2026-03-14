import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const CP_LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432613032/4yzfEoxSx65F5YumFPTknr/cp-logo-real_52105279.webp";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/eventos", label: "Eventos" },
  { href: "/nuestros-artistas", label: "Nuestros Artistas" },
  { href: "/quienes-somos", label: "Quiénes Somos" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "cp-glass border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src={CP_LOGO_URL}
              alt="CP Producciones"
              className="h-14 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 hover:text-primary ${
                  location === link.href
                    ? "text-primary"
                    : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                  Panel Admin
                </Button>
              </Link>
            )}
            <Link href="/eventos">
              <Button size="sm" className="cp-gradient text-white font-semibold shadow-lg hover:opacity-90 transition-opacity">
                <Ticket className="w-4 h-4 mr-2" />
                Comprar Tickets
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden cp-glass border-t border-white/10">
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`py-2 text-sm font-medium transition-colors ${
                  location === link.href ? "text-primary" : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              {isAuthenticated && user?.role === "admin" && (
                <Link href="/admin" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary">
                    Panel Admin
                  </Button>
                </Link>
              )}
              {!isAuthenticated && false && null /* Acceder oculto - compra no requiere login */}
              <Link href="/eventos" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="w-full cp-gradient text-white font-semibold">
                  <Ticket className="w-4 h-4 mr-2" />
                  Comprar Tickets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
