import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  Calendar, MapPin, Ticket, ChevronLeft, Music, Users,
  FileText, Building2, Play, AlertCircle, Clock, Navigation, ExternalLink, Flame, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuyTicketsModal from "@/components/BuyTicketsModal";
import { trpc } from "@/lib/trpc";
import type { Zone, EventDay } from "../../../drizzle/schema";

const PLACEHOLDER_BANNER = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432613032/4yzfEoxSx65F5YumFPTknr/hero-bg-kvJSatY9gkfRM228ompKm2.webp";

// Helper: parse taquilla JSON or return raw text
function parseTaquilla(raw: string | null | undefined) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // Normalize mapUrl -> mapsUrl for display
    if (parsed.mapUrl && !parsed.mapsUrl) parsed.mapsUrl = parsed.mapUrl;
    return parsed;
  } catch {
    return { address: raw, schedule: null, mapsUrl: null };
  }
}

// Helper: parse normativas JSON or return raw text as single item
function parseNormativas(raw: string | null | undefined) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [{ icon: "📋", title: "Normativas", description: raw }];
  } catch {
    return raw.split("\n").filter(Boolean).map((line: string) => ({
      icon: "✅",
      title: "",
      description: line,
    }));
  }
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const parsedId = id ? parseInt(id, 10) : null;
  const [buyOpen, setBuyOpen] = useState(false);

  const { data: event, isLoading, error } = trpc.events.getById.useQuery(
    { id: parsedId! },
    { enabled: parsedId !== null && !isNaN(parsedId!) }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container py-16">
          <div className="h-80 rounded-2xl bg-card/50 animate-pulse border border-white/10 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-card/50 rounded animate-pulse" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container py-16 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Evento no encontrado</h2>
          <p className="text-muted-foreground mb-6">El evento que buscas no existe o no está disponible.</p>
          <Link href="/eventos">
            <Button className="cp-gradient text-white">Ver todos los eventos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const zones = (event.zones as Zone[]) ?? [];
  const days = (event.days as EventDay[]) ?? [];
  const isMultiDay = days.length > 1;
  const minPrice = zones.length > 0 ? Math.min(...zones.map((z) => z.price)) : null;
  const maxPrice = zones.length > 0 ? Math.max(...zones.map((z) => z.price)) : null;
  const taquillaData = parseTaquilla(event.taquilla);
  const normativasList = parseNormativas(event.normativas);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Banner ──────────────────────────────────────────────────────────── */}
      <section className="relative h-72 md:h-[480px] overflow-hidden mt-16 md:mt-20">
        <img
          src={event.bannerUrl || event.imageUrl || PLACEHOLDER_BANNER}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/30 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />

        <div className="absolute top-4 left-4">
          <Link href="/eventos">
            <Button variant="ghost" size="sm" className="cp-glass text-foreground/80 hover:text-foreground">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver
            </Button>
          </Link>
        </div>

        {/* Title overlay on banner */}
        <div className="absolute bottom-0 left-0 right-0 container pb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className="border-primary/40 text-primary capitalize text-xs bg-background/50 backdrop-blur-sm">
              {event.type === "concert" ? "Concierto" : event.type === "festival" ? "Festival" : "Evento"}
            </Badge>
            {isMultiDay && (
              <Badge className="cp-gradient text-white text-xs">
                {days.length} días
              </Badge>
            )}
            {event.isFeatured && (
              <Badge className="bg-amber-500 text-black text-xs font-bold">
                <Flame className="w-3 h-3 mr-1" />
                Destacado
              </Badge>
            )}
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-white drop-shadow-lg max-w-3xl">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/80">
            {event.date && (
              <span className="flex items-center gap-1.5 bg-background/40 backdrop-blur-sm px-3 py-1 rounded-full">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {event.date}
              </span>
            )}
            {event.venue && (
              <span className="flex items-center gap-1.5 bg-background/40 backdrop-blur-sm px-3 py-1 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {event.venue}{event.city ? `, ${event.city}` : ""}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <section className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── LEFT: Scrollable content ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            {event.description && (
              <div className="p-6 rounded-2xl bg-card/50 border border-white/10">
                <h2 className="font-heading text-lg font-bold text-foreground mb-3">Sobre el Evento</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Days & Artists */}
            {days.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg cp-gradient flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    {isMultiDay ? "Días y Artistas" : "Artistas"}
                  </h2>
                </div>
                <div className="space-y-4">
                  {days.map((day, idx) => (
                    <div key={day.id} className="p-5 rounded-2xl bg-card/50 border border-white/10 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl cp-gradient flex items-center justify-center text-white font-bold font-display flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-bold text-foreground">{day.name}</h3>
                          {day.date && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {day.date}
                            </p>
                          )}
                        </div>
                      </div>
                      {day.artists.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-display flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            Artistas
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {day.artists.map((artist, i) => (
                              <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-sm py-1 px-3">
                                <Music className="w-3 h-3 mr-1.5" />
                                {artist}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zones & Prices */}
            {zones.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg cp-gradient flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">Zonas y Precios</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {zones.map((zone, idx) => (
                    <div key={zone.id} className="relative p-5 rounded-2xl bg-card/50 border border-white/10 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10 group">
                      {idx === 0 && (
                        <div className="absolute top-3 right-3 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                          Premium
                        </div>
                      )}
                      <h3 className="font-heading text-lg font-bold text-foreground mb-1">{zone.name}</h3>
                      <p className="text-3xl font-bold cp-gradient-text font-display mb-2">
                        ${zone.price.toLocaleString()}
                      </p>
                      {zone.capacity && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Capacidad: {zone.capacity.toLocaleString()} personas
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">por persona{isMultiDay ? " / por día" : ""}</p>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venue Map / Plano */}
            {event.venueMapUrl && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg cp-gradient flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">Plano del Recinto</h2>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-card/50">
                  <img
                    src={event.venueMapUrl}
                    alt="Plano del recinto"
                    className="w-full object-contain max-h-[500px]"
                  />
                </div>
              </div>
            )}

            {/* Normativas */}
            {normativasList.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg cp-gradient flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">Normativas del Evento</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {normativasList.map((n: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-white/10 hover:border-primary/20 transition-colors">
                      <span className="text-xl flex-shrink-0 mt-0.5">{n.icon || "✅"}</span>
                      <div>
                        {n.title && <p className="text-sm font-semibold text-foreground mb-0.5">{n.title}</p>}
                        <p className="text-sm text-muted-foreground leading-relaxed">{n.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Taquilla */}
            {taquillaData && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg cp-gradient flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">Taquilla Física</h2>
                </div>
                <div className="p-6 rounded-2xl bg-card/50 border border-white/10 space-y-4">
                  {/* Address */}
                  {taquillaData.address && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-display mb-1">Dirección</p>
                        <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">{taquillaData.address}</p>
                      </div>
                    </div>
                  )}

                  {/* Schedule */}
                  {taquillaData.schedule && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-display mb-1">Horario de Atención</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{taquillaData.schedule}</p>
                      </div>
                    </div>
                  )}

                  {/* Google Maps */}
                  {taquillaData.mapsUrl && (
                    <a
                      href={taquillaData.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl cp-gradient flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Ver en Google Maps</p>
                        <p className="text-xs text-muted-foreground">Cómo llegar a la taquilla</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Video */}
            {event.videoUrl && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg cp-gradient flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">Video Promocional</h2>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video">
                  <iframe
                    src={event.videoUrl}
                    title="Video del evento"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Sticky Purchase Card ───────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-2xl border border-white/10 bg-card/80 backdrop-blur-sm space-y-5">
              {/* Price */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-display mb-1">Precio desde</p>
                {minPrice !== null ? (
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold cp-gradient-text font-display">
                      ${minPrice.toLocaleString()}
                    </p>
                    {maxPrice !== null && maxPrice !== minPrice && (
                      <p className="text-sm text-muted-foreground">— ${maxPrice.toLocaleString()}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Consultar precio</p>
                )}
                {isMultiDay && (
                  <p className="text-xs text-muted-foreground mt-1">por persona / por día</p>
                )}
              </div>

              {/* Zones quick view */}
              {zones.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-display">Zonas disponibles</p>
                  {zones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                      <span className="text-sm text-foreground">{zone.name}</span>
                      <span className="text-sm font-bold text-primary">${zone.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Days quick view */}
              {isMultiDay && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-display">Días del evento</p>
                  {days.map((day, idx) => (
                    <div key={day.id} className="flex items-center gap-2 py-1.5 border-b border-white/10 last:border-0">
                      <span className="w-5 h-5 rounded cp-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-foreground truncate">{day.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => setBuyOpen(true)}
                className="relative w-full overflow-hidden rounded-xl py-4 font-bold text-base text-white transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)" }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  <Ticket className="w-5 h-5" />
                  COMPRAR Tickets
                </span>
              </button>

              {event.whatsappNumber && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  Confirmarás tu compra vía WhatsApp
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {buyOpen && (
        <BuyTicketsModal
          event={event}
          open={buyOpen}
          onClose={() => setBuyOpen(false)}
        />
      )}
    </div>
  );
}
