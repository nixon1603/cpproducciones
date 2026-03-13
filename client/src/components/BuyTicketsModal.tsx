import { useState, useMemo } from "react";
import { X, Ticket, ChevronRight, Music, Calendar, Users, MessageCircle, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { Event, Zone, EventDay } from "../../../drizzle/schema";

interface BuyTicketsModalProps {
  event: Event;
  open: boolean;
  onClose: () => void;
}

type Step = "selection" | "buyer" | "confirm";

export default function BuyTicketsModal({ event, open, onClose }: BuyTicketsModalProps) {
  const zones = useMemo(() => (event.zones as Zone[]) ?? [], [event.zones]);
  const days = useMemo(() => (event.days as EventDay[]) ?? [], [event.days]);
  const isMultiDay = days.length > 1;

  // Step state
  const [step, setStep] = useState<Step>("selection");

  // Selection state
  const [selectedZone, setSelectedZone] = useState<Zone | null>(zones.length === 1 ? zones[0] : null);
  const [selectedDays, setSelectedDays] = useState<EventDay[]>(
    days.length === 1 ? [days[0]] : []
  );
  const [quantity, setQuantity] = useState(1);

  // Buyer state
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

  const createPurchase = trpc.purchases.create.useMutation();
  const updateStatus = trpc.purchases.updateStatus.useMutation();

  // Price calculation
  const numDays = isMultiDay ? (selectedDays.length || 1) : 1;
  const unitPrice = selectedZone?.price ?? 0;
  const total = unitPrice * quantity * numDays;

  const toggleDay = (day: EventDay) => {
    setSelectedDays((prev) =>
      prev.find((d) => d.id === day.id)
        ? prev.filter((d) => d.id !== day.id)
        : [...prev, day]
    );
  };

  const canProceedToStep2 = selectedZone !== null && (!isMultiDay || selectedDays.length > 0);
  const canProceedToStep3 = buyerName.trim().length >= 2;

  const handleWhatsApp = async () => {
    if (!event.whatsappNumber) {
      toast.error("Este evento no tiene número de WhatsApp configurado.");
      return;
    }

    // Save purchase to DB and mark as whatsapp_sent
    try {
      const purchase = await createPurchase.mutateAsync({
        eventId: event.id,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim() || undefined,
        buyerPhone: buyerPhone.trim() || undefined,
        selectedZone: selectedZone ?? undefined,
        selectedDays: isMultiDay ? selectedDays : (days.length === 1 ? [days[0]] : undefined),
        quantity,
        unitPrice,
        totalPrice: total,
      });
      // Mark as whatsapp_sent so it doesn't stay as pending
      if (purchase?.insertId) {
        await updateStatus.mutateAsync({ id: Number(purchase.insertId), status: "whatsapp_sent" });
      }
    } catch (err) {
      console.error("Error saving purchase:", err);
    }

    // Build WhatsApp message
    const daysForMsg = isMultiDay ? selectedDays : (days.length === 1 ? [days[0]] : []);
    const daysText = daysForMsg.length > 0
      ? daysForMsg.map((d) => {
          const artistsText = d.artists.length > 0 ? ` (${d.artists.join(", ")})` : "";
          return `  • ${d.name}${d.date ? ` - ${d.date}` : ""}${artistsText}`;
        }).join("\n")
      : "  • Acceso general";

    const message = [
      `🎫 *SOLICITUD DE TICKETS - CP PRODUCCIONES*`,
      ``,
      `📋 *Datos del Comprador*`,
      `Nombre: ${buyerName}`,
      buyerEmail ? `Email: ${buyerEmail}` : null,
      buyerPhone ? `Teléfono: ${buyerPhone}` : null,
      ``,
      `🎵 *Evento*`,
      `${event.title}`,
      event.venue ? `📍 ${event.venue}${event.city ? `, ${event.city}` : ""}` : null,
      event.date ? `📅 ${event.date}` : null,
      ``,
      isMultiDay ? `📆 *Día(s) Seleccionado(s)*` : null,
      isMultiDay ? daysText : null,
      ``,
      `🏟️ *Zona Seleccionada*`,
      `${selectedZone?.name ?? "General"}`,
      ``,
      `🎟️ *Cantidad de Tickets*`,
      `${quantity} entrada${quantity > 1 ? "s" : ""}`,
      isMultiDay ? `${numDays} día${numDays > 1 ? "s" : ""}` : null,
      ``,
      `💰 *Resumen de Pago*`,
      `Precio por ticket: $${unitPrice.toLocaleString()}`,
      isMultiDay ? `Días seleccionados: ${numDays}` : null,
      `Cantidad: ${quantity}`,
      `*TOTAL: $${total.toLocaleString()}*`,
      ``,
      `_Generado desde cpproducciones.com_`,
    ]
      .filter(Boolean)
      .join("\n");

    const phone = event.whatsappNumber.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success("¡Redirigiendo a WhatsApp!");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-white/10 shadow-2xl scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg cp-gradient flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground leading-tight">
                Comprar Tickets
              </h2>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{event.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-5 py-3 flex items-center gap-2 border-b border-white/10">
          {(["selection", "buyer", "confirm"] as Step[]).map((s, idx) => {
            const labels = ["Selección", "Datos", "Confirmar"];
            const isActive = step === s;
            const isDone = (step === "buyer" && idx === 0) || (step === "confirm" && idx < 2);
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? "bg-primary text-white"
                      : isActive
                      ? "cp-gradient text-white"
                      : "bg-white/10 text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <span className={`text-xs ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {labels[idx]}
                </span>
                {idx < 2 && <ChevronRight className="w-3 h-3 text-muted-foreground/50" />}
              </div>
            );
          })}
        </div>

        <div className="p-5 space-y-5">
          {/* ── STEP 1: Selection ─────────────────────────────────────── */}
          {step === "selection" && (
            <>
              {/* Day selector (multi-day only) */}
              {isMultiDay && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-widest font-display mb-3 block">
                    Selecciona el/los día(s)
                  </Label>
                  <div className="space-y-2">
                    {days.map((day, idx) => {
                      const isSelected = selectedDays.some((d) => d.id === day.id);
                      return (
                        <button
                          key={day.id}
                          onClick={() => toggleDay(day)}
                          className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? "border-primary/60 bg-primary/10"
                              : "border-white/10 bg-card/50 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-all ${
                                isSelected ? "cp-gradient text-white" : "bg-white/10 text-muted-foreground"
                              }`}
                            >
                              {isSelected ? <Check className="w-3 h-3" /> : idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground">{day.name}</p>
                              {day.date && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  {day.date}
                                </p>
                              )}
                              {day.artists.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {day.artists.map((artist, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-xs bg-primary/10 text-primary border border-primary/20 py-0"
                                    >
                                      <Music className="w-2.5 h-2.5 mr-1" />
                                      {artist}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedDays.length === 0 && (
                    <p className="text-xs text-destructive mt-2">Selecciona al menos un día</p>
                  )}
                </div>
              )}

              {/* Single day info */}
              {!isMultiDay && days.length === 1 && (
                <div className="p-3 rounded-xl border border-white/10 bg-card/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-display mb-2">Día del evento</p>
                  <p className="font-medium text-sm text-foreground">{days[0].name}</p>
                  {days[0].date && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {days[0].date}
                    </p>
                  )}
                  {days[0].artists.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {days[0].artists.map((artist, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-primary/10 text-primary border border-primary/20 py-0">
                          <Music className="w-2.5 h-2.5 mr-1" />
                          {artist}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Zone selector */}
              {zones.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-widest font-display mb-3 block">
                    Selecciona la zona
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    {zones.map((zone) => {
                      const isSelected = selectedZone?.id === zone.id;
                      return (
                        <button
                          key={zone.id}
                          onClick={() => setSelectedZone(zone)}
                          className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? "border-primary/60 bg-primary/10"
                              : "border-white/10 bg-card/50 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  isSelected ? "border-primary bg-primary" : "border-white/30"
                                }`}
                              >
                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground">{zone.name}</p>
                                {zone.capacity && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    Cap. {zone.capacity.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="font-bold text-base cp-gradient-text font-display">
                              ${zone.price.toLocaleString()}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-display mb-3 block">
                  Cantidad de tickets
                </Label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-foreground transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-bold font-display text-foreground w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-muted-foreground">máx. 20</span>
                </div>
              </div>

              {/* Price summary */}
              {selectedZone && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Zona: {selectedZone.name}</span>
                      <span>${unitPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Cantidad</span>
                      <span>× {quantity}</span>
                    </div>
                    {isMultiDay && selectedDays.length > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Días</span>
                        <span>× {selectedDays.length}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base text-foreground pt-2 border-t border-white/10">
                      <span>Total</span>
                      <span className="cp-gradient-text font-display text-lg">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="w-full cp-gradient text-white font-bold py-5 hover:opacity-90 transition-opacity"
                disabled={!canProceedToStep2}
                onClick={() => setStep("buyer")}
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {/* ── STEP 2: Buyer Info ─────────────────────────────────────── */}
          {step === "buyer" && (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="buyerName" className="text-sm text-foreground mb-1.5 block">
                    Nombre completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="buyerName"
                    placeholder="Tu nombre completo"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="bg-card/50 border-white/20 focus:border-primary/50"
                  />
                </div>
                <div>
                  <Label htmlFor="buyerEmail" className="text-sm text-foreground mb-1.5 block">
                    Correo electrónico
                  </Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    placeholder="tu@email.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="bg-card/50 border-white/20 focus:border-primary/50"
                  />
                </div>
                <div>
                  <Label htmlFor="buyerPhone" className="text-sm text-foreground mb-1.5 block">
                    Teléfono / WhatsApp
                  </Label>
                  <Input
                    id="buyerPhone"
                    type="tel"
                    placeholder="+58 412 000 0000"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="bg-card/50 border-white/20 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20"
                  onClick={() => setStep("selection")}
                >
                  Atrás
                </Button>
                <Button
                  className="flex-1 cp-gradient text-white font-bold hover:opacity-90"
                  disabled={!canProceedToStep3}
                  onClick={() => setStep("confirm")}
                >
                  Revisar pedido
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {/* ── STEP 3: Confirm ───────────────────────────────────────── */}
          {step === "confirm" && (
            <>
              <div className="space-y-4">
                {/* Event summary */}
                <div className="p-4 rounded-xl bg-card/50 border border-white/10 space-y-3">
                  <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">
                    Resumen del Pedido
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Evento</span>
                      <span className="text-foreground font-medium text-right max-w-[200px]">{event.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Comprador</span>
                      <span className="text-foreground">{buyerName}</span>
                    </div>
                    {isMultiDay && selectedDays.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Días</span>
                        <span className="text-foreground text-right max-w-[200px]">
                          {selectedDays.map((d) => d.name).join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zona</span>
                      <span className="text-foreground">{selectedZone?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cantidad</span>
                      <span className="text-foreground">{quantity} ticket{quantity > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precio unitario</span>
                      <span className="text-foreground">${unitPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-base">
                      <span className="text-foreground">Total a pagar</span>
                      <span className="cp-gradient-text font-display text-lg">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Al confirmar, serás redirigido a WhatsApp con toda la información de tu pedido
                    para completar la compra con nuestro equipo.
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20"
                  onClick={() => setStep("buyer")}
                >
                  Atrás
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-5 gap-2"
                  onClick={handleWhatsApp}
                  disabled={createPurchase.isPending}
                >
                  <MessageCircle className="w-4 h-4" />
                  {createPurchase.isPending ? "Procesando..." : "Confirmar vía WhatsApp"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
