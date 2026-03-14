import { Link } from "wouter";
import { CalendarDays, ShoppingBag, Users, TrendingUp, ArrowRight, Plus, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const { data: events } = trpc.events.listAll.useQuery();
  const { data: purchases } = trpc.purchases.listAll.useQuery();
  const { data: admins } = trpc.admins.list.useQuery();
  const { data: artistsList } = trpc.artists.listAll.useQuery();

  const activeEvents = events?.filter((e) => e.isActive).length ?? 0;
  const totalEvents = events?.length ?? 0;
  const totalPurchases = purchases?.length ?? 0;
  const totalAdmins = admins?.length ?? 0;
  const totalArtists = artistsList?.length ?? 0;

  const recentPurchases = purchases?.slice(0, 5) ?? [];
  const recentEvents = events?.slice(0, 5) ?? [];

  const stats = [
    { label: "Eventos Activos", value: activeEvents, total: totalEvents, icon: CalendarDays, href: "/admin/eventos" },
    { label: "Total Compras", value: totalPurchases, icon: ShoppingBag, href: "/admin/compras" },
    { label: "Artistas", value: totalArtists, icon: Mic2, href: "/admin/artistas" },
    { label: "Administradores", value: totalAdmins, icon: Users, href: "/admin/administradores" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, total, icon: Icon, href }) => (
            <Link key={label} href={href}>
              <div className="group p-5 rounded-xl border border-white/10 bg-card/50 hover:border-primary/30 hover:bg-card transition-all duration-200 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg cp-gradient flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-2xl font-bold font-display cp-gradient-text">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
                {total !== undefined && (
                  <p className="text-xs text-muted-foreground/60 mt-0.5">de {total} total</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/eventos/nuevo">
            <Button className="cp-gradient text-white font-semibold gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Evento
            </Button>
          </Link>
          <Link href="/admin/eventos">
            <Button variant="outline" className="border-white/20 gap-2">
              <CalendarDays className="w-4 h-4" />
              Ver Eventos
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <div className="rounded-xl border border-white/10 bg-card/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-heading text-base font-semibold text-foreground">Eventos Recientes</h3>
              <Link href="/admin/eventos">
                <Button variant="ghost" size="sm" className="text-primary text-xs">Ver todos</Button>
              </Link>
            </div>
            <div className="divide-y divide-white/10">
              {recentEvents.length === 0 ? (
                <div className="px-5 py-8 text-center text-muted-foreground text-sm">
                  No hay eventos creados aún.
                </div>
              ) : (
                recentEvents.map((event) => (
                  <div key={event.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.date ?? "Sin fecha"}</p>
                    </div>
                    <Badge
                      variant={event.isActive ? "default" : "secondary"}
                      className={event.isActive ? "cp-gradient text-white text-xs" : "text-xs"}
                    >
                      {event.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="rounded-xl border border-white/10 bg-card/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-heading text-base font-semibold text-foreground">Compras Recientes</h3>
              <Link href="/admin/compras">
                <Button variant="ghost" size="sm" className="text-primary text-xs">Ver todas</Button>
              </Link>
            </div>
            <div className="divide-y divide-white/10">
              {recentPurchases.length === 0 ? (
                <div className="px-5 py-8 text-center text-muted-foreground text-sm">
                  No hay compras registradas aún.
                </div>
              ) : (
                recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{purchase.buyerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {(purchase.selectedZone as any)?.name ?? "Sin zona"} · {purchase.quantity} ticket{purchase.quantity > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold cp-gradient-text">${parseFloat(purchase.totalPrice ?? "0").toLocaleString()}</p>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          purchase.status === "confirmed"
                            ? "bg-green-500/20 text-green-400"
                            : purchase.status === "cancelled"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {purchase.status === "confirmed" ? "Confirmado" : purchase.status === "cancelled" ? "Cancelado" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
