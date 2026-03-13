import { Link } from "wouter";
import {
  Globe, Users, Award, Zap, CheckCircle2, Mail, Phone,
  Instagram, Facebook, Twitter, Youtube, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432613032/4yzfEoxSx65F5YumFPTknr/hero-bg-kvJSatY9gkfRM228ompKm2.webp";
const CP_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432613032/4yzfEoxSx65F5YumFPTknr/cp-logo-dark-Go9BaE5TYuBLFpwXvVRuFc.webp";

const stats = [
  { value: "+10", label: "Años de Experiencia" },
  { value: "+200", label: "Eventos Producidos" },
  { value: "+50", label: "Artistas Internacionales" },
  { value: "2", label: "Continentes" },
];

const advantages = [
  "Amplia red de contactos con talentos nacionales e internacionales de diversos géneros.",
  "Equipo profesional y experimentado en la producción de conciertos que garantiza la calidad y el éxito de cada evento.",
  "Precios competitivos y ajustados a las necesidades y presupuestos de nuestros clientes.",
  "Nos adaptamos a las tendencias y preferencias del mercado, ofreciendo propuestas innovadoras y atractivas.",
];

const services = [
  { icon: Globe, title: "Booking Internacional", desc: "Contratación de artistas nacionales e internacionales para cualquier tipo de evento." },
  { icon: Users, title: "Producción Integral", desc: "Gestión completa del evento: sonido, iluminación, seguridad y logística." },
  { icon: Award, title: "Eventos Propios", desc: "Producción de conciertos y festivales propios de alta calidad." },
  { icon: Zap, title: "Eventos de Terceros", desc: "Servicio de producción para eventos organizados por terceros." },
];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter/X" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export default function QuienesSomos() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative h-64 md:h-80 overflow-hidden mt-16 md:mt-20">
        <img src={HERO_BG} alt="CP Producciones" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/60 to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <img src={CP_LOGO} alt="CP Producciones" className="h-16 md:h-20 w-auto mx-auto mb-4 object-contain" />
            <p className="text-xs text-primary font-semibold uppercase tracking-widest font-display">
              Productora de Eventos Premium
            </p>
          </div>
        </div>
      </section>

      {/* Quiénes Somos */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-3 font-display">
              Nuestra Historia
            </p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
              ¿Quiénes <span className="cp-gradient-text">Somos?</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Somos una productora venezolana con más de 10 años de experiencia a nivel nacional
              e internacional manejando talentos de calidad y renombre. Nos hemos consolidado como
              una de las referencias más importantes en la producción de eventos musicales en Venezuela.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="text-center p-6 rounded-xl border border-white/10 bg-card/50 hover:border-primary/30 transition-colors"
              >
                <p className="font-display text-3xl md:text-4xl font-bold cp-gradient-text mb-2">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qué Hacemos */}
      <section className="py-16 md:py-24 bg-card/20 border-y border-white/10">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-3 font-display">
              Servicios
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Qué <span className="cp-gradient-text">Hacemos?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ofrecemos el servicio de booking, que consiste en contratar artistas para eventos,
              ya sean propios o de terceros. Nos encargamos de todo el proceso, desde la negociación,
              la logística, el montaje, el sonido, la iluminación, la seguridad y la promoción.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-xl border border-white/10 bg-card/50 hover:border-primary/30 hover:bg-card transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg cp-gradient flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-3 font-display">
                Ventajas
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                ¿Por qué <span className="cp-gradient-text">Elegirnos?</span>
              </h2>
              <div className="space-y-4">
                {advantages.map((adv, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground leading-relaxed text-sm">{adv}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 cp-gradient rounded-2xl opacity-10 blur-xl" />
              <div className="relative p-8 rounded-2xl border border-white/10 bg-card/50 space-y-6">
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  Nuestro Compromiso
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  En CP Producciones, cada evento es una oportunidad para crear experiencias
                  únicas e irrepetibles. Nuestro compromiso es con la excelencia, la innovación
                  y la satisfacción total de nuestros clientes y el público asistente.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Trabajamos con los mejores profesionales del sector para garantizar que cada
                  detalle esté perfectamente coordinado, desde la contratación del artista hasta
                  el último aplauso del público.
                </p>
                <Link href="/eventos">
                  <Button className="cp-gradient text-white font-semibold w-full hover:opacity-90">
                    Ver Próximos Eventos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="py-16 md:py-24 bg-card/20 border-t border-white/10">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-3 font-display">
              Contacto
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Cómo <span className="cp-gradient-text">Contactarnos?</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Si estás interesado en contratar nuestros servicios o quieres saber más sobre nosotros,
              puedes seguirnos en nuestras redes sociales o escribirnos a nuestro correo electrónico.
              Estaremos encantados de atenderte y aclarar tus dudas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a href="mailto:info@cpproducciones.com">
                <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 gap-2">
                  <Mail className="w-4 h-4" />
                  info@cpproducciones.com
                </Button>
              </a>
              <a href="tel:+584121234567">
                <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 gap-2">
                  <Phone className="w-4 h-4" />
                  +58 412 123 4567
                </Button>
              </a>
            </div>

            <div className="flex justify-center gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-11 h-11 rounded-xl bg-card/50 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
