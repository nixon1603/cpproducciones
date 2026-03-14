import { useState } from "react";
import { Link } from "wouter";
import { Plus, Trash2, Edit, Music, Mic2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { SocialLinks } from "../../../../drizzle/schema";

export default function AdminArtists() {
  const { data: artists, refetch } = trpc.artists.listAll.useQuery();
  const deleteMutation = trpc.artists.delete.useMutation({
    onSuccess: () => { toast.success("Artista eliminado"); refetch(); },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });
  const updateMutation = trpc.artists.update.useMutation({
    onSuccess: () => { refetch(); },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const toggleActive = (id: number, current: boolean) => {
    updateMutation.mutate({ id, data: { isActive: !current } });
    toast.success(current ? "Artista desactivado" : "Artista activado");
  };

  return (
    <AdminLayout title="Artistas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">
              Gestiona los artistas de CP Producciones. Estos aparecerán en la página pública "Nuestros Artistas".
            </p>
          </div>
          <Link href="/admin/artistas/nuevo">
            <Button className="cp-gradient text-white font-semibold gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Artista
            </Button>
          </Link>
        </div>

        {/* Artists grid */}
        {!artists ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-card/50 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-20 rounded-xl border border-white/10 bg-card/30">
            <Mic2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">Sin artistas</h3>
            <p className="text-muted-foreground text-sm mb-6">Agrega tu primer artista para que aparezca en el sitio.</p>
            <Link href="/admin/artistas/nuevo">
              <Button className="cp-gradient text-white font-semibold gap-2">
                <Plus className="w-4 h-4" />
                Crear Artista
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {artists.map((artist) => {
              const social = (artist.socialLinks as SocialLinks) ?? {};
              return (
                <div
                  key={artist.id}
                  className="group relative rounded-xl overflow-hidden border border-white/10 bg-card/50 hover:border-primary/30 transition-all duration-300"
                >
                  {/* Photo */}
                  <div className="relative h-48 overflow-hidden">
                    {artist.photoUrl ? (
                      <img
                        src={artist.photoUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full cp-gradient flex items-center justify-center">
                        <Mic2 className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant={artist.isActive ? "default" : "secondary"}
                        className={artist.isActive ? "bg-green-500/80 text-white text-xs" : "bg-red-500/20 text-red-400 text-xs"}
                      >
                        {artist.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>

                    {/* Order */}
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold border border-white/20">
                      #{artist.sortOrder}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground">{artist.stageName || artist.name}</h3>
                      {artist.stageName && artist.name !== artist.stageName && (
                        <p className="text-xs text-muted-foreground">{artist.name}</p>
                      )}
                    </div>

                    {artist.genre && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border border-primary/20">
                        <Music className="w-2.5 h-2.5 mr-1" />
                        {artist.genre}
                      </Badge>
                    )}

                    {artist.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{artist.bio}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <Link href={`/admin/artistas/${artist.id}/editar`}>
                        <Button variant="outline" size="sm" className="border-white/20 gap-1.5 text-xs">
                          <Edit className="w-3 h-3" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
                        onClick={() => toggleActive(artist.id, artist.isActive)}
                      >
                        {artist.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {artist.isActive ? "Ocultar" : "Mostrar"}
                      </Button>
                      {confirmDeleteId === artist.id ? (
                        <div className="flex items-center gap-1 ml-auto">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => { deleteMutation.mutate({ id: artist.id }); setConfirmDeleteId(null); }}
                          >
                            Confirmar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            No
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive ml-auto text-xs"
                          onClick={() => setConfirmDeleteId(artist.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
