import { Link } from "wouter";
import { Calendar, MapPin, Users, Ticket, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event } from "../../../drizzle/schema";

interface EventCardProps {
  event: Event;
  onBuyClick?: (event: Event) => void;
}

export default function EventCard({ event, onBuyClick }: EventCardProps) {
  const zones = (event.zones as any[]) ?? [];
  const days = (event.days as any[]) ?? [];
  const minPrice = zones.length > 0
    ? Math.min(...zones.map((z: any) => z.price))
    : null;

  const PLACEHOLDER_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432613032/4yzfEoxSx65F5YumFPTknr/hero-bg-kvJSatY9gkfRM228ompKm2.webp";

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden border border-white/10 bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      {/* Featured badge */}
      {event.isFeatured && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="cp-gradient text-white text-xs font-semibold px-2 py-0.5 flex items-center gap-1">
            <Star className="w-3 h-3" />
            Destacado
          </Badge>
        </div>
      )}

      {/* Multi-day badge */}
      {days.length > 1 && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-accent/80 text-white text-xs">
            {days.length} días
          </Badge>
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl || PLACEHOLDER_IMG}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Type badge */}
        <Badge variant="outline" className="w-fit text-xs border-primary/40 text-primary capitalize">
          {event.type === "concert" ? "Concierto" : event.type === "festival" ? "Festival" : "Evento"}
        </Badge>

        <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-2 leading-tight">
          {event.title}
        </h3>

        {event.shortDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.shortDescription}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-col gap-1.5 mt-auto">
          {event.date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>{event.date}</span>
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{event.venue}{event.city ? `, ${event.city}` : ""}</span>
            </div>
          )}
          {zones.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>{zones.length} zona{zones.length > 1 ? "s" : ""} disponible{zones.length > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
          <div>
            {minPrice !== null ? (
              <>
                <p className="text-xs text-muted-foreground">Desde</p>
                <p className="text-lg font-bold cp-gradient-text">
                  ${minPrice.toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Consultar precio</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/eventos/${event.id}`}>
              <Button variant="outline" size="sm" className="border-white/20 text-foreground/70 hover:border-primary/50 hover:text-primary text-xs">
                Ver más
              </Button>
            </Link>
            {onBuyClick && (
              <Button
                size="sm"
                className="cp-gradient text-white font-semibold text-xs hover:opacity-90"
                onClick={() => onBuyClick(event)}
              >
                <Ticket className="w-3.5 h-3.5 mr-1" />
                Tickets
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
