import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Music, Star, Shield, Zap, Ticket, ChevronLeft, ChevronRight, MapPin, Calendar, Flame, Play, Mic2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuyTicketsModal from "@/components/BuyTicketsModal";
import { trpc } from "@/lib/trpc";
import type { Event, Zone, EventDay } from "../../../drizzle/schema";
import type { SocialLinks } from "../../../drizzle/schema";

const HERO_FALLBACK = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432613032/4yzfEoxSx65F5YumFPTknr/hero-bg-kvJSatY9gkfRM228ompKm2.webp";

// ── Mega Event Card ─────────────────────────────────────────────────────────
function MegaEventCard({ event, onBuy }: { event: Event; onBuy: (e: Event) => void }) {
  const zones = (event.zones as Zone[]) ?? [];
  const days = (event.days as EventDay[]) ?? [];
  const minPrice = zones.length > 0 ? Math.min(...zones.map((z) => z.price)) : null;
  const maxPrice = zones.length > 0 ? Math.max(...zones.map((z) => z.price)) : null;
  const allArtists = Array.from(new Set(days.flatMap((d) => d.artists))).slice(0, 5);

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 bg-card">
      {/* Image */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full cp-gradient flex items-center justify-center">
            <Music className="w-16 h-16 text-white/30" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

        {/* Featured badge */}
        {event.isFeatured && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-xs font-bold text-black">
            <Flame className="w-3 h-3" />
            DESTACADO
          </div>
        )}

        {/* Price badge */}
        {minPrice !== null && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-background/80 backdrop-blur-sm border border-primary/30">
            <p className="text-xs text-muted-foreground leading-none mb-0.5">Desde</p>
            <p className="text-base font-bold font-display cp-gradient-text leading-none">${minPrice.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground leading-tight group-hover:cp-gradient-text transition-all line-clamp-2">
            {event.title}
          </h3>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
            {event.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" />
                {event.date}
              </span>
            )}
            {event.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                {event.venue}{event.city ? `, ${event.city}` : ""}
              </span>
            )}
          </div>
        </div>

        {/* Artists */}
        {allArtists.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allArtists.map((a, i) => (
              <Badge key={i} variant="secondary" className="text-xs bg-primary/10 text-primary border border-primary/20 py-0.5">
                <Music className="w-2.5 h-2.5 mr-1" />
                {a}
              </Badge>
            ))}
            {days.flatMap((d) => d.artists).length > 5 && (
              <Badge variant="secondary" className="text-xs bg-white/5 text-muted-foreground border border-white/10 py-0.5">
                +{days.flatMap((d) => d.artists).length - 5} más
              </Badge>
            )}
          </div>
        )}

        {/* Zones preview */}
        {zones.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {zones.slice(0, 4).map((z) => (
              <div key={z.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-xs text-muted-foreground truncate">{z.name}</span>
                <span className="text-xs font-bold text-foreground ml-2 flex-shrink-0">${z.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => onBuy(event)}
            className="flex-1 relative group/btn overflow-hidden rounded-xl py-3.5 font-bold text-sm text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
            }}
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              <Ticket className="w-4 h-4" />
              COMPRAR Tickets
            </span>
          </button>
          <Link href={`/eventos/${event.id}`}>
            <button className="px-4 py-3.5 rounded-xl border border-white/20 hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all duration-200 text-sm">
              Ver más
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}

// ── Feature Card ─────────────────────────────────────────────────────────────
const features = [
  { icon: Music, title: "Artistas de Renombre", desc: "Talentos nacionales e internacionales de todos los géneros musicales." },
  { icon: Star, title: "+10 Años de Experiencia", desc: "Produciendo eventos de calidad con estándares internacionales." },
  { icon: Shield, title: "Producción Integral", desc: "Sonido, iluminación, seguridad y logística en un solo lugar." },
  { icon: Zap, title: "Experiencias Únicas", desc: "Cada evento diseñado para crear momentos inolvidables." },
];

// ── Hero Carousel ────────────────────────────────────────────────────────────
function HeroCarousel({ events, onBuy }: { events: Event[]; onBuy: (e: Event) => void }) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const slides = events.filter((e) => e.bannerUrl || e.imageUrl);
  const total = slides.length;

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % total), 5000);
    return () => clearInterval(timer);
  }, [total]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrent((c) => (c + 1) % total);
      else setCurrent((c) => (c - 1 + total) % total);
    }
    setTouchStart(null);
  };

  if (total === 0) {
    // Fallback hero when no events with images
    return (
      <section className="relative h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_FALLBACK} alt="CP Producciones" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background" />
        </div>
        <div className="relative z-10 container text-center flex flex-col items-center gap-6 pt-20 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] md:text-xs font-semibold tracking-widest uppercase">
            Productora de Eventos Premium
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="cp-gradient-text">EXPERIENCIAS</span><br />
            <span className="text-foreground">QUE TRASCIENDEN</span>
          </h1>
          <a href="#eventos">
            <Button size="lg" className="cp-gradient text-white font-bold px-8 py-4 md:py-6 text-sm md:text-base shadow-xl hover:opacity-90 transition-opacity">
              <Ticket className="w-4 md:w-5 h-4 md:h-5 mr-2" />
              Ver Eventos
            </Button>
          </a>
        </div>
      </section>
    );
  }

  const ev = slides[current];
  const zones = (ev.zones as Zone[]) ?? [];
  const days = (ev.days as EventDay[]) ?? [];
  const minPrice = zones.length > 0 ? Math.min(...zones.map((z) => z.price)) : null;
  const allArtists = Array.from(new Set(days.flatMap((d) => d.artists))).slice(0, 4);

  return (
    <section 
      className="relative h-[85vh] md:min-h-screen flex items-end overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.bannerUrl ?? slide.imageUrl ?? HERO_FALLBACK}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 md:via-background/60 to-background/30 md:to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 md:from-background/70 via-transparent to-transparent" />
        </div>
      ))}

      {/* Ambient glow blobs */}
      <div className="hidden md:block absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="hidden md:block absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container pb-16 md:pb-20 pt-24 md:pt-28 px-4">
        <div className="max-w-2xl">
          {/* Tag */}
          <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest">
              <Flame className="w-3 h-3" />
              {ev.isFeatured ? "Evento Destacado" : "Concierto Disponible"}
            </span>
            {ev.date && (
              <span className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-[10px] md:text-xs font-medium">
                <Calendar className="w-3 h-3" />
                {ev.date}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight md:leading-none mb-2 md:mb-3">
            {ev.title}
          </h1>

          {/* Venue */}
          {ev.venue && (
            <p className="flex items-center gap-2 text-white/60 text-xs md:text-sm mb-4 md:mb-5">
              <MapPin className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary flex-shrink-0" />
              {ev.venue}{ev.city ? `, ${ev.city}` : ""}
            </p>
          )}

          {/* Artists */}
          {allArtists.length > 0 && (
            <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
              {allArtists.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[10px] md:text-xs font-medium">
                  <Music className="w-2.5 md:w-3 h-2.5 md:h-3 text-primary" />
                  {a}
                </span>
              ))}
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
            {minPrice !== null && (
              <div className="px-3 md:px-4 py-2 md:py-3 rounded-xl bg-background/60 backdrop-blur-sm border border-white/20">
                <p className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mb-0.5">Desde</p>
                <p className="text-xl md:text-2xl font-bold font-display cp-gradient-text">${minPrice.toLocaleString()}</p>
              </div>
            )}
            <button
              onClick={() => onBuy(ev)}
              className="relative group/btn overflow-hidden rounded-xl px-6 md:px-8 py-3 md:py-4 font-bold text-sm md:text-base text-white transition-all duration-300 hover:shadow-2xl hover:shadow-primary/50 hover:scale-105 active:scale-95 w-full sm:w-auto mt-2 sm:mt-0"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2">
                <Ticket className="w-4 md:w-5 h-4 md:h-5" />
                COMPRAR Tickets
              </span>
            </button>
            <a href="#eventos" className="text-white/50 hover:text-white/80 text-xs md:text-sm transition-colors underline underline-offset-4 hidden sm:inline">
              Ver todos los eventos
            </a>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + total) % total)}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 md:w-10 h-8 md:h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="w-4 md:w-5 h-4 md:h-5" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % total)}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 md:w-10 h-8 md:h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ChevronRight className="w-4 md:w-5 h-4 md:h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === current
                  ? "w-8 h-2 bg-primary"
                  : "w-2 h-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    const num = parseInt(value.replace(/[^0-9]/g, ""));
    const prefix = value.match(/^[^0-9]*/)?.[0] ?? "";
    const suffix = value.match(/[^0-9]*$/)?.[0] ?? "";
    if (isNaN(num)) { setDisplay(value); return; }
    let current = 0;
    const step = Math.ceil(num / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { current = num; clearInterval(timer); }
      setDisplay(`${prefix}${current}${suffix}`);
    }, 30);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center p-6 rounded-xl border border-white/10 bg-card/50 hover:border-primary/30 transition-colors">
      <p className="font-display text-3xl md:text-4xl font-bold cp-gradient-text mb-2">{display}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

// ── Artist Preview Card ───────────────────────────────────────────────────────
function ArtistPreviewCard({ artist, idx }: { artist: any; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: idx * 0.2, duration: 0.6 }}
      className="group relative rounded-2xl overflow-hidden border border-white/10 bg-card/50 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
    >
      <div className="relative h-64 md:h-80 overflow-hidden">
        {artist.photoUrl ? (
          <img src={artist.photoUrl} alt={artist.stageName || artist.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full cp-gradient flex items-center justify-center">
            <Mic2 className="w-16 h-16 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        {artist.genre && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary/80 backdrop-blur-sm text-white text-xs font-bold border-0 py-1 px-3">
              <Music className="w-3 h-3 mr-1.5" />
              {artist.genre}
            </Badge>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-5 space-y-2">
        <h3 className="font-display text-xl md:text-2xl font-bold text-foreground group-hover:cp-gradient-text transition-all">
          {artist.stageName || artist.name}
        </h3>
        {artist.bio && (
          <p className="text-xs text-muted-foreground line-clamp-2">{artist.bio}</p>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { data: events, isLoading } = trpc.events.listPublic.useQuery({ type: "concert" });
  const { data: artistsData } = trpc.artists.listPublic.useQuery();
  const allEvents = events ?? [];
  const allArtists = artistsData ?? [];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Hero Carousel ──────────────────────────────────────── */}
      <HeroCarousel events={allEvents} onBuy={setSelectedEvent} />

      {/* ── Floating particles decorative layer ──────────────── */}
      <div className="absolute top-0 left-0 w-full h-screen pointer-events-none overflow-hidden z-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30 animate-float"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* ── EVENTOS DISPONIBLES ────────────────────────────────── */}
      <motion.section
        id="eventos"
        className="py-16 md:py-24 relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        {/* Decorative top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3">
                <Flame className="w-3 h-3" />
                Conciertos Disponibles
              </div>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
                Próximos <span className="cp-gradient-text">Eventos</span>
              </h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">
                Selecciona tu zona, elige tus días y compra tus tickets directamente por WhatsApp.
              </p>
            </div>
            <Link href="/eventos">
              <Button variant="ghost" className="text-primary hover:text-primary/80 hidden sm:flex gap-2">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-card/50 animate-pulse border border-white/10" />
              ))}
            </div>
          ) : allEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allEvents.map((event) => (
                <MegaEventCard key={event.id} event={event} onBuy={setSelectedEvent} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 rounded-2xl border border-white/10 bg-card/30">
              <div className="w-16 h-16 rounded-full cp-gradient flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">Próximamente</h3>
              <p className="text-muted-foreground">Estamos preparando eventos increíbles para ti. ¡Vuelve pronto!</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/eventos">
              <Button variant="outline" className="border-primary/30 text-primary">
                Ver todos los eventos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ── NUESTROS ARTISTAS (PREVIEW) ─────────────────────────── */}
      {allArtists.length > 0 && (
        <motion.section
          className="py-16 md:py-24 relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3">
                  <Mic2 className="w-3 h-3" />
                  Talento CP
                </div>
                <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
                  Nuestros <span className="cp-gradient-text">Artistas</span>
                </h2>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Conoce a los talentos que hacen posible experiencias musicales inolvidables.
                </p>
              </div>
              <Link href="/nuestros-artistas">
                <Button variant="ghost" className="text-primary hover:text-primary/80 hidden sm:flex gap-2">
                  Ver todos
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {allArtists.slice(0, 2).map((artist, idx) => (
                <ArtistPreviewCard key={artist.id} artist={artist} idx={idx} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/nuestros-artistas">
                <Button variant="outline" className="border-primary/30 text-primary">
                  Ver todos los artistas
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── EXPERIENCIAS QUE TRASCIENDEN ──────────────────────────── */}
      <motion.section
        className="py-16 md:py-24 relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-3 font-display">Nuestra Esencia</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
              Experiencias que <span className="cp-gradient-text">Trascienden</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Cada evento que producimos es una obra maestra de sonido, luz y emoción. No vendemos tickets, creamos recuerdos que duran toda la vida.
            </p>
          </div>

          {/* Animated Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <AnimatedCounter value="+10" label="Años de Experiencia" />
            <AnimatedCounter value="+200" label="Eventos Producidos" />
            <AnimatedCounter value="+50" label="Artistas Internacionales" />
            <AnimatedCounter value="2" label="Continentes" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative p-6 rounded-2xl border border-white/10 bg-card/50 hover:border-primary/40 hover:bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                {/* Number */}
                <div className="absolute top-4 right-4 text-4xl font-display font-bold text-white/5 group-hover:text-primary/10 transition-colors">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="w-12 h-12 rounded-xl cp-gradient flex items-center justify-center mb-5 group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-heading text-base font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── LISTO PARA VIVIR LA EXPERIENCIA ──────────────────────── */}
      <motion.section
        className="py-16 md:py-24"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background layers */}
            <div className="absolute inset-0 cp-gradient" />
            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)",
              }}
            />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative z-10 px-8 md:px-16 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10 md:gap-16">
              {/* Left */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-4">
                  <Play className="w-3 h-3" />
                  Es tu momento
                </div>
                <h2 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                  ¿LISTO PARA<br />
                  <span className="text-white/80">VIVIR</span> LA<br />
                  EXPERIENCIA?
                </h2>
                <p className="text-white/70 text-base md:text-lg mt-4 max-w-md">
                  Adquiere tus tickets ahora y sé parte de los eventos más exclusivos de Venezuela. Zonas premium, artistas de talla mundial.
                </p>
              </div>

              {/* Right */}
              <div className="flex flex-col items-center gap-5">
                {/* Floating ticket visual */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "3s" }} />
                  <div className="absolute inset-4 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
                  <div className="relative w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                    <Ticket className="w-12 h-12 text-white" />
                  </div>
                </div>

                <Link href="/eventos">
                  <button
                    className="relative overflow-hidden px-10 py-5 rounded-2xl font-display font-bold text-lg text-primary bg-white hover:bg-white/90 transition-all duration-300 shadow-2xl hover:shadow-white/30 hover:scale-105 active:scale-95"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                    <span className="relative flex items-center gap-3">
                      <Ticket className="w-5 h-5" />
                      Comprar Tickets
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </button>
                </Link>

                <p className="text-white/50 text-xs text-center">
                  Compra segura vía WhatsApp · Sin comisiones ocultas
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <Footer />

      {selectedEvent && (
        <BuyTicketsModal
          event={selectedEvent}
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
