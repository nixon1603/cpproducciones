import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import {
  Save, ChevronLeft, Music, Mic2, Upload, Loader2,
  Image as ImageIcon, Play, ExternalLink, Instagram
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { SocialLinks } from "../../../../drizzle/schema";

// ── Image Upload Component (reused from AdminEventForm pattern) ─────────────
function ImageUploader({
  label, value, onChange, hint, accept = "image/*"
}: {
  label: string; value: string; onChange: (url: string) => void;
  hint?: string; accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("La imagen no puede superar 10MB"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Error al subir"); }
      const { url } = await res.json();
      onChange(url);
      toast.success("Imagen subida exitosamente");
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5" />
        {label}
      </Label>
      {value && (
        <div className="relative rounded-lg overflow-hidden border border-white/10 bg-card/30">
          <img src={value} alt="preview" className="w-full h-32 object-cover" />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center text-xs transition-colors"
          >✕</button>
        </div>
      )}
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
          ${uploading ? "border-primary/40 bg-primary/5" : "border-white/20 hover:border-primary/40 hover:bg-primary/5"}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Subiendo imagen...</span>
          </div>
        ) : (
          <div className="text-muted-foreground">
            <Upload className="w-5 h-5 mx-auto mb-1.5" />
            <p className="text-xs font-medium">Arrastra una imagen o haz clic para seleccionar</p>
            {hint && <p className="text-xs mt-0.5 opacity-70">{hint}</p>}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="O pega una URL directamente..."
          className="bg-card/50 border-white/20 focus:border-primary/50 text-xs" />
        {value && (
          <a href={value} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 p-2 rounded-lg border border-white/20 text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminArtistForm() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const parsedId = id ? parseInt(id, 10) : null;
  const isEditing = parsedId !== null && !isNaN(parsedId);

  // Info
  const [name, setName] = useState("");
  const [stageName, setStageName] = useState("");
  const [bio, setBio] = useState("");
  const [genre, setGenre] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  // Media
  const [photoUrl, setPhotoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Social Links
  const [instagram, setInstagram] = useState("");
  const [spotify, setSpotify] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [twitter, setTwitter] = useState("");

  // Load existing artist
  const { data: existing } = trpc.artists.getById.useQuery(
    { id: parsedId! },
    { enabled: isEditing && parsedId !== null }
  );

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setStageName(existing.stageName ?? "");
    setBio(existing.bio ?? "");
    setGenre(existing.genre ?? "");
    setPhotoUrl(existing.photoUrl ?? "");
    setBannerUrl(existing.bannerUrl ?? "");
    setVideoUrl(existing.videoUrl ?? "");
    setIsActive(existing.isActive);
    setSortOrder(existing.sortOrder);
    const social = (existing.socialLinks as SocialLinks) ?? {};
    setInstagram(social.instagram ?? "");
    setSpotify(social.spotify ?? "");
    setYoutube(social.youtube ?? "");
    setTiktok(social.tiktok ?? "");
    setTwitter(social.twitter ?? "");
  }, [existing]);

  const createArtist = trpc.artists.create.useMutation({
    onSuccess: () => { toast.success("Artista creado exitosamente"); navigate("/admin/artistas"); },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });
  const updateArtist = trpc.artists.update.useMutation({
    onSuccess: () => { toast.success("Artista actualizado exitosamente"); navigate("/admin/artistas"); },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const handleSubmit = () => {
    if (!name.trim()) { toast.error("El nombre es requerido"); return; }

    const socialLinks: SocialLinks = {};
    if (instagram.trim()) socialLinks.instagram = instagram.trim();
    if (spotify.trim()) socialLinks.spotify = spotify.trim();
    if (youtube.trim()) socialLinks.youtube = youtube.trim();
    if (tiktok.trim()) socialLinks.tiktok = tiktok.trim();
    if (twitter.trim()) socialLinks.twitter = twitter.trim();

    const payload = {
      name: name.trim(),
      stageName: stageName.trim() || undefined,
      bio: bio.trim() || undefined,
      genre: genre.trim() || undefined,
      photoUrl: photoUrl || undefined,
      bannerUrl: bannerUrl || undefined,
      videoUrl: videoUrl || undefined,
      socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      isActive,
      sortOrder,
    };

    if (isEditing && parsedId) {
      updateArtist.mutate({ id: parsedId, data: payload });
    } else {
      createArtist.mutate(payload);
    }
  };

  const isSaving = createArtist.isPending || updateArtist.isPending;

  const GENRES = ["Reggaeton", "Pop", "Pop Urban", "Trap", "Salsa", "Merengue", "Bachata", "Vallenato", "Rock", "Electrónica", "Hip Hop", "R&B", "Otro"];

  return (
    <AdminLayout title={isEditing ? "Editar Artista" : "Nuevo Artista"}>
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/admin/artistas")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a artistas
        </button>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="bg-card/50 border border-white/10 h-auto p-1 flex-wrap gap-1">
            <TabsTrigger value="info" className="data-[state=active]:cp-gradient data-[state=active]:text-white text-xs">
              Información General
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:cp-gradient data-[state=active]:text-white text-xs">
              Fotos y Video
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:cp-gradient data-[state=active]:text-white text-xs">
              Redes Sociales
            </TabsTrigger>
          </TabsList>

          {/* ── TAB: Info General ──────────────────────────────────────── */}
          <TabsContent value="info" className="mt-4 space-y-4">
            <div className="p-5 rounded-xl border border-white/10 bg-card/50 space-y-4">
              <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">Datos del Artista</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1.5 block">Nombre real <span className="text-destructive">*</span></Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Juan Pérez"
                    className="bg-card/50 border-white/20 focus:border-primary/50" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block flex items-center gap-1">
                    <Mic2 className="w-3.5 h-3.5" /> Nombre artístico
                  </Label>
                  <Input value={stageName} onChange={(e) => setStageName(e.target.value)} placeholder="Ej: DJ Nova"
                    className="bg-card/50 border-white/20 focus:border-primary/50" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block flex items-center gap-1">
                    <Music className="w-3.5 h-3.5" /> Género musical
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRES.map((g) => (
                      <button key={g} onClick={() => setGenre(g)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${genre === g ? "cp-gradient text-white" : "bg-card/50 border border-white/20 text-muted-foreground hover:border-primary/40"}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                  <Input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="O escribe uno personalizado..."
                    className="bg-card/50 border-white/20 focus:border-primary/50 mt-2 text-sm" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Orden de aparición</Label>
                  <Input type="number" min="0" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                    className="bg-card/50 border-white/20 focus:border-primary/50" />
                  <p className="text-xs text-muted-foreground mt-1">Los artistas se ordenan de menor a mayor</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm mb-1.5 block">Biografía / Reseña</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
                    placeholder="Escribe una reseña del artista..."
                    className="bg-card/50 border-white/20 focus:border-primary/50 min-h-[120px]" />
                  <p className="text-xs text-muted-foreground mt-1">{bio.length} caracteres</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <Switch checked={isActive} onCheckedChange={setIsActive} id="isActive" />
                <Label htmlFor="isActive" className="text-sm cursor-pointer">Artista activo (visible en el sitio)</Label>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: Fotos y Video ──────────────────────────────────────── */}
          <TabsContent value="media" className="mt-4 space-y-4">
            <div className="p-5 rounded-xl border border-white/10 bg-card/50 space-y-6">
              <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">Imágenes del Artista</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploader
                  label="Foto principal"
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  hint="Recomendado: 800×800px (cuadrada)"
                />
                <ImageUploader
                  label="Banner / Cover"
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  hint="Recomendado: 1920×600px"
                />
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5" />
                    Video promocional (YouTube embed)
                  </Label>
                  <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    className="bg-card/50 border-white/20 focus:border-primary/50" />
                  <p className="text-xs text-muted-foreground">Usa el link de embed de YouTube: youtube.com/embed/ID</p>
                  {videoUrl && (
                    <div className="rounded-lg overflow-hidden border border-white/10 aspect-video max-w-lg">
                      <iframe src={videoUrl} className="w-full h-full" allowFullScreen title="Video preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: Redes Sociales ─────────────────────────────────────── */}
          <TabsContent value="social" className="mt-4 space-y-4">
            <div className="p-5 rounded-xl border border-white/10 bg-card/50 space-y-4">
              <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">Redes Sociales</h3>
              <p className="text-xs text-muted-foreground">Agrega los links completos a las redes sociales del artista.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1.5 block flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5" /> Instagram
                  </Label>
                  <Input value={instagram} onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/artista"
                    className="bg-card/50 border-white/20 focus:border-primary/50" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">🎵 Spotify</Label>
                  <Input value={spotify} onChange={(e) => setSpotify(e.target.value)}
                    placeholder="https://open.spotify.com/artist/..."
                    className="bg-card/50 border-white/20 focus:border-primary/50" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">▶️ YouTube</Label>
                  <Input value={youtube} onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/@artista"
                    className="bg-card/50 border-white/20 focus:border-primary/50" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">🎶 TikTok</Label>
                  <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)}
                    placeholder="https://tiktok.com/@artista"
                    className="bg-card/50 border-white/20 focus:border-primary/50" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">𝕏 Twitter / X</Label>
                  <Input value={twitter} onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://x.com/artista"
                    className="bg-card/50 border-white/20 focus:border-primary/50" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" className="border-white/20" onClick={() => navigate("/admin/artistas")}>
            Cancelar
          </Button>
          <Button className="cp-gradient text-white font-bold gap-2 px-8" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Guardando..." : isEditing ? "Actualizar Artista" : "Crear Artista"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
