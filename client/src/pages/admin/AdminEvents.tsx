import { useState } from "react";
import { Link } from "wouter";
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, StarOff, Search, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminEvents() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: events, isLoading, refetch } = trpc.events.listAll.useQuery();
  const deleteEvent = trpc.events.delete.useMutation({
    onSuccess: () => { toast.success("Evento eliminado"); refetch(); setDeleteId(null); },
    onError: () => toast.error("Error al eliminar evento"),
  });
  const toggleActive = trpc.events.toggleActive.useMutation({
    onSuccess: () => { toast.success("Estado actualizado"); refetch(); },
    onError: () => toast.error("Error al actualizar estado"),
  });
  const toggleFeatured = trpc.events.toggleFeatured.useMutation({
    onSuccess: () => { toast.success("Destacado actualizado"); refetch(); },
    onError: () => toast.error("Error al actualizar destacado"),
  });

  const filtered = (events ?? []).filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.venue ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Eventos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card/50 border-white/20"
            />
          </div>
          <Link href="/admin/eventos/nuevo">
            <Button className="cp-gradient text-white font-semibold gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Evento
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/10 bg-card/50 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {search ? "No se encontraron eventos." : "No hay eventos creados aún."}
              </p>
              {!search && (
                <Link href="/admin/eventos/nuevo">
                  <Button className="mt-4 cp-gradient text-white">Crear primer evento</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-medium">Evento</th>
                    <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Venue</th>
                    <th className="px-4 py-3 text-left font-medium">Zonas</th>
                    <th className="px-4 py-3 text-left font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filtered.map((event) => {
                    const zones = (event.zones as any[]) ?? [];
                    const days = (event.days as any[]) ?? [];
                    return (
                      <tr key={event.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{event.title}</p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant="outline" className="text-xs border-primary/30 text-primary capitalize py-0">
                                {event.type === "concert" ? "Concierto" : event.type === "festival" ? "Festival" : "Otro"}
                              </Badge>
                              {days.length > 1 && (
                                <Badge variant="secondary" className="text-xs py-0">{days.length}d</Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-sm text-muted-foreground">{event.date ?? "—"}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {event.venue ? `${event.venue}${event.city ? `, ${event.city}` : ""}` : "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-muted-foreground">{zones.length} zona{zones.length !== 1 ? "s" : ""}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Badge
                              variant={event.isActive ? "default" : "secondary"}
                              className={`text-xs ${event.isActive ? "cp-gradient text-white" : ""}`}
                            >
                              {event.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => toggleFeatured.mutate({ id: event.id, isFeatured: !event.isFeatured })}
                              title={event.isFeatured ? "Quitar destacado" : "Destacar"}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                            >
                              {event.isFeatured ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> : <StarOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => toggleActive.mutate({ id: event.id, isActive: !event.isActive })}
                              title={event.isActive ? "Desactivar" : "Activar"}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                              {event.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <Link href={`/admin/eventos/${event.id}/editar`}>
                              <button
                                title="Editar"
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => setDeleteId(event.id)}
                              title="Eliminar"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción no se puede deshacer. Se eliminará el evento y todas sus compras asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteId && deleteEvent.mutate({ id: deleteId })}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
