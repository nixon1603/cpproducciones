import { Link } from "wouter";
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone } from "lucide-react";

const CP_LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432613032/4yzfEoxSx65F5YumFPTknr/cp-logo-dark-Go9BaE5TYuBLFpwXvVRuFc.webp";

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter/X" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

const footerLinks = [
  { href: "/", label: "Inicio" },
  { href: "/eventos", label: "Eventos" },
  { href: "/nuestros-artistas", label: "Nuestros Artistas" },
  { href: "/quienes-somos", label: "Quiénes Somos" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-background/95">
      {/* Top gradient line */}
      <div className="h-px w-full cp-gradient opacity-50" />

      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <img
              src={CP_LOGO_URL}
              alt="CP Producciones"
              className="h-12 w-auto object-contain"
            />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Productora venezolana con más de 10 años de experiencia en la producción
              de conciertos y festivales a nivel nacional e internacional.
            </p>
            <div className="flex gap-3 mt-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-4 font-display">
              Navegación
            </h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-4 font-display">
              Contacto
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>info@cpproducciones.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+58 412 123 4567</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground/60">
              Venezuela · Operaciones Nacionales e Internacionales
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CP Producciones. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground/50 font-display tracking-wider">
            LUXURY EVENTS · EST. 2014
          </p>
        </div>
      </div>
    </footer>
  );
}
