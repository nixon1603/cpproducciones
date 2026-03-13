import { useState } from "react";
import { Search, ShoppingBag, ChevronDown, ChevronUp, Calendar, Users, Filter, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  whatsapp_sent: "Enviado a WhatsApp",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  whatsapp_sent: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function AdminPurchases() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: events } = trpc.events.listAll.useQuery();
  const { data: purchases, isLoading, refetch } = trpc.purchases.listAll.useQuery();
  const updateStatus = trpc.purchases.updateStatus.useMutation({
    onSuccess: () => { toast.success("Estado actualizado"); refetch(); },
    onError: () => toast.error("Error al actualizar estado"),
  });

  const filtered = (purchases ?? []).filter((p) => {
    const matchSearch =
      p.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.buyerEmail ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.buyerPhone ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchEvent = eventFilter === "all" || String(p.eventId) === eventFilter;
    return matchSearch && matchStatus && matchEvent;
  });

  const totalRevenue = filtered.reduce((acc, p) => acc + parseFloat(p.totalPrice ?? "0"), 0);
  const whatsappSent = filtered.filter((p) => p.status === "whatsapp_sent").length;
  const confirmed = filtered.filter((p) => p.status === "confirmed").length;

  // Map eventId to event title
  const eventMap = new Map((events ?? []).map((e) => [e.id, e.title]));

  return (
    <AdminLayout title="Compras">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-card/50 text-center">
            <p className="text-2xl font-bold font-display cp-gradient-text">{filtered.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-card/50 text-center">
            <p className="text-2xl font-bold font-display text-emerald-400">{whatsappSent}</p>
            <p className="text-sm text-muted-foreground">WhatsApp</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-card/50 text-center">
            <p className="text-2xl font-bold font-display text-green-400">{confirmed}</p>
            <p className="text-sm text-muted-foreground">Confirmadas</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-card/50 text-center">
            <p className="text-2xl font-bold font-display cp-gradient-text">${totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Ingresos</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card/50 border-white/20"
            />
          </div>

          {/* Filter by event */}
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-full sm:w-56 bg-card/50 border-white/20">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filtrar por evento" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10">
              <SelectItem value="all">Todos los eventos</SelectItem>
              {(events ?? []).map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>{e.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter by status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 bg-card/50 border-white/20">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10">
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="whatsapp_sent">Enviado a WhatsApp</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <div className="rounded-xl border border-white/10 bg-card/50 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No hay compras que mostrar.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filtered.map((purchase) => {
                const isExpanded = expandedId === purchase.id;
                const zone = purchase.selectedZone as any;
                const days = (purchase.selectedDays as any[]) ?? [];
                const eventTitle = eventMap.get(purchase.eventId) ?? `Evento #${purchase.eventId}`;

                return (
                  <div key={purchase.id} className="hover:bg-white/5 transition-colors">
                    <div
                      className="px-4 py-3 flex items-center gap-3 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : purchase.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{purchase.buyerName}</p>
                          <Badge
                            variant="outline"
                            className={`text-xs border ${statusColors[purchase.status ?? "pending"]}`}
                          >
                            {purchase.status === "whatsapp_sent" && <MessageCircle className="w-3 h-3 mr-1" />}
                            {statusLabels[purchase.status ?? "pending"]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className="text-primary/70">{eventTitle}</span>
                          {" · "}{zone?.name ?? "Sin zona"} · {purchase.quantity} ticket{purchase.quantity > 1 ? "s" : ""}
                          {days.length > 0 && ` · ${days.length} día${days.length > 1 ? "s" : ""}`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold cp-gradient-text">${parseFloat(purchase.totalPrice ?? "0").toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString("es-VE") : ""}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/10 bg-card/30">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                          <div className="space-y-2 text-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-display">Comprador</p>
                            <p className="text-foreground font-medium">{purchase.buyerName}</p>
                            {purchase.buyerEmail && <p className="text-muted-foreground">{purchase.buyerEmail}</p>}
                            {purchase.buyerPhone && <p className="text-muted-foreground">{purchase.buyerPhone}</p>}
                          </div>

                          <div className="space-y-2 text-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-display">Pedido</p>
                            <p className="text-foreground">Evento: <span className="text-primary">{eventTitle}</span></p>
                            <p className="text-foreground">Zona: <span className="text-primary">{zone?.name ?? "—"}</span></p>
                            <p className="text-foreground">Cantidad: {purchase.quantity} ticket{purchase.quantity > 1 ? "s" : ""}</p>
                            <p className="text-foreground">Precio unitario: ${parseFloat(purchase.unitPrice ?? "0").toLocaleString()}</p>
                            <p className="font-bold text-foreground">Total: <span className="cp-gradient-text">${parseFloat(purchase.totalPrice ?? "0").toLocaleString()}</span></p>
                          </div>

                          {days.length > 0 && (
                            <div className="sm:col-span-2 space-y-2 text-sm">
                              <p className="text-xs text-muted-foreground uppercase tracking-widest font-display">Días seleccionados</p>
                              <div className="flex flex-wrap gap-2">
                                {days.map((d: any, i: number) => (
                                  <div key={i} className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs">
                                    <p className="font-medium text-foreground">{d.name}</p>
                                    {d.artists?.length > 0 && (
                                      <p className="text-muted-foreground">{d.artists.join(", ")}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {purchase.notes && (
                            <div className="sm:col-span-2 text-sm">
                              <p className="text-xs text-muted-foreground uppercase tracking-widest font-display mb-1">Notas</p>
                              <p className="text-muted-foreground">{purchase.notes}</p>
                            </div>
                          )}

                          {/* Status actions */}
                          <div className="sm:col-span-2 flex flex-wrap gap-2 pt-2 border-t border-white/10">
                            <p className="text-xs text-muted-foreground self-center">Cambiar estado:</p>
                            {(["whatsapp_sent", "confirmed", "cancelled"] as const).map((s) => (
                              <Button
                                key={s}
                                size="sm"
                                variant={purchase.status === s ? "default" : "outline"}
                                className={`text-xs ${purchase.status === s ? "cp-gradient text-white" : "border-white/20"}`}
                                onClick={() => updateStatus.mutate({ id: purchase.id, status: s })}
                                disabled={purchase.status === s || updateStatus.isPending}
                              >
                                {s === "whatsapp_sent" && <MessageCircle className="w-3 h-3 mr-1" />}
                                {statusLabels[s]}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
