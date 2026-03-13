import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import BuyTicketsModal from "@/components/BuyTicketsModal";
import { trpc } from "@/lib/trpc";
import type { Event } from "../../../drizzle/schema";

const typeLabels: Record<string, string> = {
  all: "Todos",
  concert: "Conciertos",
  festival: "Festivales",
  other: "Otros",
};

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "concert" | "festival" | "other">("concert");

  const { data: events, isLoading } = trpc.events.listPublic.useQuery(
    typeFilter !== "all" ? { type: typeFilter } : {}
  );

  const filtered = (events ?? []).filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.venue ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (e.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-3 font-display">
              Catálogo
            </p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Próximos <span className="cp-gradient-text">Eventos</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Descubre los mejores conciertos y festivales producidos por CP Producciones.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-8 sticky top-16 md:top-20 z-30 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos, venues, ciudades..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card/50 border-white/20 focus:border-primary/50 text-sm"
              />
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              {Object.entries(typeLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    typeFilter === key
                      ? "cp-gradient text-white shadow-md"
                      : "bg-card/50 border border-white/20 text-muted-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-10">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-xl bg-card/50 animate-pulse border border-white/10" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-card/50 flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                No se encontraron eventos
              </h3>
              <p className="text-muted-foreground text-sm">
                {search ? "Intenta con otros términos de búsqueda." : "No hay eventos disponibles en este momento."}
              </p>
              {search && (
                <Button
                  variant="ghost"
                  className="mt-4 text-primary"
                  onClick={() => setSearch("")}
                >
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {filtered.length} evento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onBuyClick={(e) => setSelectedEvent(e)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

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
