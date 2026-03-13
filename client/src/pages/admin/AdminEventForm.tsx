import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { nanoid } from "nanoid";
import {
  Plus, Trash2, Save, ChevronLeft, Music, DollarSign,
  Calendar, MapPin, Globe, Phone, Image as ImageIcon, FileText,
  Building2, Play, Users, Map as MapIcon, Upload, Loader2,
  AlertCircle, CheckCircle2, Clock, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { Zone, EventDay } from "../../../../drizzle/schema";

interface ZoneForm extends Omit<Zone, "capacity"> {
  capacity: string;
}
interface DayForm extends Omit<EventDay, "artists"> {
  artists: string;
}
interface NormativaItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const emptyZone = (): ZoneForm => ({ id: nanoid(8), name: "", price: 0, capacity: "" });
const emptyDay = (): DayForm => ({ id: nanoid(8), name: "", date: "", artists: "" });
const emptyNormativa = (): NormativaItem => ({ id: nanoid(8), icon: "✅", title: "", description: "" });

const NORMATIVA_ICONS = ["✅", "❌", "🚫", "⚠️", "📵", "🎒", "👕", "🍺", "📸", "🎫", "🔞", "🌿", "🐾", "🔫", "💊"];

// ─── Image Upload Component ───────────────────────────────────────────────────
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

      {/* Preview */}
      {value && (
        <div className="relative rounded-lg overflow-hidden border border-white/10 bg-card/30">
          <img src={value} alt="preview" className="w-full h-32 object-cover" />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center text-xs transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
          ${uploading ? "border-primary/40 bg-primary/5" : "border-white/20 hover:border-primary/40 hover:bg-primary/5"}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
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

      {/* URL manual */}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="O pega una URL directamente..."
          className="bg-card/50 border-white/20 focus:border-primary/50 text-xs"
        />
        {value && (
          <a href={value} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 p-2 rounded-lg border border-white/20 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminEventForm() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const parsedId = id ? parseInt(id, 10) : null;
  const isEditing = parsedId !== null && !isNaN(parsedId);

  // Basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Venezuela");
  const [type, setType] = useState<"concert" | "festival" | "other">("concert");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Media
  const [imageUrl, setImageUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [venueMapUrl, setVenueMapUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Zones & Days
  const [zones, setZones] = useState<ZoneForm[]>([emptyZone()]);
  const [days, setDays] = useState<DayForm[]>([emptyDay()]);

  // Normativas (structured)
  const [normativaItems, setNormativaItems] = useState<NormativaItem[]>([emptyNormativa()]);

  // Taquilla (structured)
  const [taquillaAddress, setTaquillaAddress] = useState("TORRE BRITANICA ALTAMIRA NIVEL PB CP PRODUCCIONES");
  const [taquillaSchedule, setTaquillaSchedule] = useState("Lunes a Sábado de 10:00am a 05:00pm\nDomingos de 11:00am a 3:00pm (Horario Corrido)");
  const [taquillaMapUrl, setTaquillaMapUrl] = useState("https://maps.google.com/?q=Torre+Britanica+Altamira+Caracas");
  const [taquillaExtra, setTaquillaExtra] = useState("");

  // Load existing event
  const { data: existingEvent } = trpc.events.getById.useQuery(
    { id: parsedId! },
    { enabled: isEditing && parsedId !== null }
  );

  useEffect(() => {
    if (!existingEvent) return;
    setTitle(existingEvent.title);
    setDescription(existingEvent.description ?? "");
    setShortDescription(existingEvent.shortDescription ?? "");
    setDate(existingEvent.date ?? "");
    setVenue(existingEvent.venue ?? "");
    setCity(existingEvent.city ?? "");
    setCountry(existingEvent.country ?? "Venezuela");
    setImageUrl(existingEvent.imageUrl ?? "");
    setBannerUrl(existingEvent.bannerUrl ?? "");
    setVenueMapUrl(existingEvent.venueMapUrl ?? "");
    setVideoUrl(existingEvent.videoUrl ?? "");
    setType(existingEvent.type as any);
    setWhatsappNumber(existingEvent.whatsappNumber ?? "");
    setIsActive(existingEvent.isActive ?? true);
    setIsFeatured(existingEvent.isFeatured ?? false);

    const existingZones = (existingEvent.zones as Zone[]) ?? [];
    if (existingZones.length > 0) {
      setZones(existingZones.map((z) => ({ ...z, capacity: z.capacity?.toString() ?? "" })));
    }
    const existingDays = (existingEvent.days as EventDay[]) ?? [];
    if (existingDays.length > 0) {
      setDays(existingDays.map((d) => ({ ...d, artists: d.artists.join(", ") })));
    }

    // Parse normativas from JSON string or plain text
    if (existingEvent.normativas) {
      try {
        const parsed = JSON.parse(existingEvent.normativas);
        if (Array.isArray(parsed)) {
          setNormativaItems(parsed);
        } else {
          setNormativaItems([{ id: nanoid(8), icon: "📋", title: "Normativas", description: existingEvent.normativas }]);
        }
      } catch {
        setNormativaItems([{ id: nanoid(8), icon: "📋", title: "Normativas", description: existingEvent.normativas }]);
      }
    }

    // Parse taquilla from JSON string or plain text
    if (existingEvent.taquilla) {
      try {
        const parsed = JSON.parse(existingEvent.taquilla);
        if (parsed.address) setTaquillaAddress(parsed.address);
        if (parsed.schedule) setTaquillaSchedule(parsed.schedule);
        if (parsed.mapUrl) setTaquillaMapUrl(parsed.mapUrl);
        if (parsed.extra) setTaquillaExtra(parsed.extra);
      } catch {
        setTaquillaExtra(existingEvent.taquilla);
      }
    }
  }, [existingEvent]);

  const createEvent = trpc.events.create.useMutation({
    onSuccess: () => { toast.success("Evento creado exitosamente"); navigate("/admin/eventos"); },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });
  const updateEvent = trpc.events.update.useMutation({
    onSuccess: () => { toast.success("Evento actualizado exitosamente"); navigate("/admin/eventos"); },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const handleSubmit = () => {
    if (!title.trim()) { toast.error("El título es requerido"); return; }
    if (!whatsappNumber.trim()) { toast.error("El número de WhatsApp es requerido"); return; }

    const validZones = zones
      .filter((z) => z.name.trim())
      .map((z) => ({ id: z.id, name: z.name.trim(), price: Number(z.price) || 0, capacity: z.capacity ? Number(z.capacity) : undefined }));

    const validDays = days
      .filter((d) => d.name.trim())
      .map((d) => ({ id: d.id, name: d.name.trim(), date: d.date, artists: d.artists.split(",").map((a) => a.trim()).filter(Boolean) }));

    const validNormativas = normativaItems.filter((n) => n.title.trim() || n.description.trim());
    const normativasJson = validNormativas.length > 0 ? JSON.stringify(validNormativas) : undefined;

    const taquillaJson = JSON.stringify({
      address: taquillaAddress.trim() || undefined,
      schedule: taquillaSchedule.trim() || undefined,
      mapUrl: taquillaMapUrl.trim() || undefined,
      extra: taquillaExtra.trim() || undefined,
    });

    const payload = {
      title: title.trim(), description: description || undefined,
      shortDescription: shortDescription || undefined, date: date || undefined,
      venue: venue || undefined, city: city || undefined, country: country || undefined,
      imageUrl: imageUrl || undefined, bannerUrl: bannerUrl || undefined,
      venueMapUrl: venueMapUrl || undefined, videoUrl: videoUrl || undefined,
      type, whatsappNumber: whatsappNumber.trim(),
      zones: validZones, days: validDays,
      normativas: normativasJson, taquilla: taquillaJson,
      isActive, isFeatured,
    };

    if (isEditing && parsedId) {
      updateEvent.mutate({ id: parsedId, data: payload });
    } else {
      createEvent.mutate(payload);
    }
  };

  // Zone helpers
  const addZone = () => { if (zones.length >= 6) { toast.warning("Máximo 6 zonas"); return; } setZones((z) => [...z, emptyZone()]); };
  const removeZone = (idx: number) => setZones((z) => z.filter((_, i) => i !== idx));
  const updateZone = (idx: number, field: keyof ZoneForm, value: string | number) =>
    setZones((z) => z.map((zone, i) => i === idx ? { ...zone, [field]: value } : zone));

  // Day helpers
  const addDay = () => { if (days.length >= 4) { toast.warning("Máximo 4 días"); return; } setDays((d) => [...d, emptyDay()]); };
  const removeDay = (idx: number) => setDays((d) => d.filter((_, i) => i !== idx));
  const updateDay = (idx: number, field: keyof DayForm, value: string) =>
    setDays((d) => d.map((day, i) => i === idx ? { ...day, [field]: value } : day));

  // Normativa helpers
  const addNormativa = () => setNormativaItems((n) => [...n, emptyNormativa()]);
  const removeNormativa = (idx: number) => setNormativaItems((n) => n.filter((_, i) => i !== idx));
  const updateNormativa = (idx: number, field: keyof NormativaItem, value: string) =>
    setNormativaItems((n) => n.map((item, i) => i === idx ? { ...item, [field]: value } : item));

  const isSaving = createEvent.isPending || updateEvent.isPending;

  return (
    <AdminLayout title={isEditing ? "Editar Evento" : "Nuevo Evento"}>
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/admin/eventos")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a eventos
        </button>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="bg-card/50 border border-white/10 h-auto p-1 flex-wrap gap-1">
            <TabsTrigger value="info" className="data-[state=active]:cp-gradient data-[state=active]:text-white text-xs">
              Información General
            </TabsTrigger>
            <TabsTrigger value="dias" className="data-[state=active]:cp-gradient data-[state=active]:text-white text-xs">
              Días y Artistas
              <Badge variant="secondary" className="ml-1.5 text-xs py-0 px-1">{days.filter(d => d.name).length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="zonas" className="data-[state=active]:cp-gradient data-[state=active]:text-white text-xs">
              Zonas y Precios
              <Badge variant="secondary" className="ml-1.5 text-xs py-0 px-1">{zones.filter(z => z.name).length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:cp-gradient data-[state=active]:text-white text-xs">
              Imágenes y Video
            </TabsTrigger>
            <TabsTrigger value="extras" className="data-[state=active]:cp-gradient data-[state=active]:text-white text-xs">
              Normativas y Taquilla
            </TabsTrigger>
          </TabsList>

          {/* ── TAB: Info General ──────────────────────────────────────────── */}
          <TabsContent value="info" className="mt-4 space-y-4">
            <div className="p-5 rounded-xl border border-white/10 bg-card/50 space-y-4">
              <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">Datos Principales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-sm mb-1.5 block">Título del evento <span className="text-destructive">*</span></Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Festival de Rock 2025" className="bg-card/50 border-white/20 focus:border-primary/50" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm mb-1.5 block">Descripción corta (máx. 500 caracteres)</Label>
                  <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Resumen breve para la tarjeta del evento" className="bg-card/50 border-white/20 focus:border-primary/50" maxLength={500} />
                  <p className="text-xs text-muted-foreground mt-1">{shortDescription.length}/500</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm mb-1.5 block">Descripción completa</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción detallada del evento..." className="bg-card/50 border-white/20 focus:border-primary/50 min-h-[100px]" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Tipo de evento</Label>
                  <div className="flex gap-2">
                    {(["concert", "festival", "other"] as const).map((t) => (
                      <button key={t} onClick={() => setType(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${type === t ? "cp-gradient text-white" : "bg-card/50 border border-white/20 text-muted-foreground hover:border-primary/40"}`}>
                        {t === "concert" ? "Concierto" : t === "festival" ? "Festival" : "Otro"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Fecha</Label>
                  <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Ej: Viernes 15 de Marzo, 2025" className="bg-card/50 border-white/20 focus:border-primary/50" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Venue / Recinto</Label>
                  <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Ej: Poliedro de Caracas" className="bg-card/50 border-white/20 focus:border-primary/50" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Ciudad</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej: Caracas" className="bg-card/50 border-white/20 focus:border-primary/50" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> País</Label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Venezuela" className="bg-card/50 border-white/20 focus:border-primary/50" />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> WhatsApp <span className="text-destructive">*</span></Label>
                  <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+58412XXXXXXX" className="bg-card/50 border-white/20 focus:border-primary/50" />
                  <p className="text-xs text-muted-foreground mt-1">Número al que se enviarán los pedidos</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 pt-2 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Switch checked={isActive} onCheckedChange={setIsActive} id="isActive" />
                  <Label htmlFor="isActive" className="text-sm cursor-pointer">Evento activo (visible en el sitio)</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={isFeatured} onCheckedChange={setIsFeatured} id="isFeatured" />
                  <Label htmlFor="isFeatured" className="text-sm cursor-pointer">Destacar en la landing</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: Días y Artistas ───────────────────────────────────────── */}
          <TabsContent value="dias" className="mt-4 space-y-4">
            <div className="p-5 rounded-xl border border-white/10 bg-card/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">Días del Evento</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Máximo 4 días. Artistas separados por comas.</p>
                </div>
                <Button variant="outline" size="sm" onClick={addDay} disabled={days.length >= 4}
                  className="border-primary/40 text-primary hover:bg-primary/10 gap-1">
                  <Plus className="w-3.5 h-3.5" /> Agregar día
                </Button>
              </div>
              <div className="space-y-4">
                {days.map((day, idx) => (
                  <div key={day.id} className="p-4 rounded-xl border border-white/10 bg-card/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg cp-gradient flex items-center justify-center text-white text-xs font-bold">{idx + 1}</div>
                        <span className="text-sm font-medium text-foreground">Día {idx + 1}</span>
                      </div>
                      {days.length > 1 && (
                        <button onClick={() => removeDay(idx)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Nombre del día</Label>
                        <Input value={day.name} onChange={(e) => updateDay(idx, "name", e.target.value)} placeholder="Ej: Viernes 15 de Marzo" className="bg-card/50 border-white/20 focus:border-primary/50 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Fecha (opcional)</Label>
                        <Input value={day.date} onChange={(e) => updateDay(idx, "date", e.target.value)} placeholder="Ej: 15/03/2025" className="bg-card/50 border-white/20 focus:border-primary/50 text-sm" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                          <Music className="w-3 h-3" /> Artistas (separados por comas)
                        </Label>
                        <Input value={day.artists} onChange={(e) => updateDay(idx, "artists", e.target.value)} placeholder="Ej: Artista 1, Artista 2, Artista 3" className="bg-card/50 border-white/20 focus:border-primary/50 text-sm" />
                        {day.artists && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {day.artists.split(",").map((a, i) => a.trim() && (
                              <Badge key={i} variant="secondary" className="text-xs bg-primary/10 text-primary border border-primary/20 py-0">{a.trim()}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: Zonas y Precios ───────────────────────────────────────── */}
          <TabsContent value="zonas" className="mt-4 space-y-4">
            <div className="p-5 rounded-xl border border-white/10 bg-card/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">Zonas y Precios</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Máximo 6 zonas. El precio es por persona por día.</p>
                </div>
                <Button variant="outline" size="sm" onClick={addZone} disabled={zones.length >= 6}
                  className="border-primary/40 text-primary hover:bg-primary/10 gap-1">
                  <Plus className="w-3.5 h-3.5" /> Agregar zona
                </Button>
              </div>
              <div className="space-y-3">
                {zones.map((zone, idx) => (
                  <div key={zone.id} className="p-4 rounded-xl border border-white/10 bg-card/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground">Zona {idx + 1}</span>
                      {zones.length > 1 && (
                        <button onClick={() => removeZone(idx)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Nombre de la zona</Label>
                        <Input value={zone.name} onChange={(e) => updateZone(idx, "name", e.target.value)} placeholder="Ej: VIP, Platea, General" className="bg-card/50 border-white/20 focus:border-primary/50 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><DollarSign className="w-3 h-3" /> Precio (USD)</Label>
                        <Input type="number" min="0" value={zone.price} onChange={(e) => updateZone(idx, "price", parseFloat(e.target.value) || 0)} placeholder="0" className="bg-card/50 border-white/20 focus:border-primary/50 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Users className="w-3 h-3" /> Capacidad (opcional)</Label>
                        <Input type="number" min="0" value={zone.capacity} onChange={(e) => updateZone(idx, "capacity", e.target.value)} placeholder="Sin límite" className="bg-card/50 border-white/20 focus:border-primary/50 text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {zones.some((z) => z.name) && (
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-display mb-3">Vista previa</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {zones.filter((z) => z.name).map((zone) => (
                      <div key={zone.id} className="p-2 rounded-lg bg-card/50 border border-white/10 text-center">
                        <p className="text-sm font-semibold text-foreground">{zone.name}</p>
                        <p className="text-base font-bold cp-gradient-text">${zone.price.toLocaleString()}</p>
                        {zone.capacity && <p className="text-xs text-muted-foreground">Cap. {Number(zone.capacity).toLocaleString()}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── TAB: Imágenes y Video ─────────────────────────────────────── */}
          <TabsContent value="media" className="mt-4 space-y-4">
            <div className="p-5 rounded-xl border border-white/10 bg-card/50 space-y-6">
              <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">Imágenes del Evento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploader
                  label="Imagen de tarjeta (catálogo)"
                  value={imageUrl}
                  onChange={setImageUrl}
                  hint="Recomendado: 800×450px (16:9)"
                />
                <ImageUploader
                  label="Banner (página de detalle)"
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  hint="Recomendado: 1920×600px"
                />
                <ImageUploader
                  label="Plano del venue / recinto"
                  value={venueMapUrl}
                  onChange={setVenueMapUrl}
                  hint="Recomendado: 1200×900px"
                />
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5" />
                    Video promocional (YouTube embed)
                  </Label>
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    className="bg-card/50 border-white/20 focus:border-primary/50"
                  />
                  <p className="text-xs text-muted-foreground">Usa el link de embed de YouTube: youtube.com/embed/ID</p>
                  {videoUrl && (
                    <div className="rounded-lg overflow-hidden border border-white/10 aspect-video">
                      <iframe src={videoUrl} className="w-full h-full" allowFullScreen title="Video preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: Normativas y Taquilla ────────────────────────────────── */}
          <TabsContent value="extras" className="mt-4 space-y-4">

            {/* Normativas */}
            <div className="p-5 rounded-xl border border-white/10 bg-card/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Normativas del Evento
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Agrega cada normativa con su icono y descripción.</p>
                </div>
                <Button variant="outline" size="sm" onClick={addNormativa}
                  className="border-primary/40 text-primary hover:bg-primary/10 gap-1">
                  <Plus className="w-3.5 h-3.5" /> Agregar normativa
                </Button>
              </div>

              <div className="space-y-3">
                {normativaItems.map((item, idx) => (
                  <div key={item.id} className="p-4 rounded-xl border border-white/10 bg-card/30">
                    <div className="flex items-start gap-3">
                      {/* Icon selector */}
                      <div className="flex-shrink-0">
                        <Label className="text-xs text-muted-foreground mb-1 block">Icono</Label>
                        <select
                          value={item.icon}
                          onChange={(e) => updateNormativa(idx, "icon", e.target.value)}
                          className="w-16 h-9 rounded-lg bg-card/50 border border-white/20 text-center text-lg cursor-pointer focus:border-primary/50 focus:outline-none"
                        >
                          {NORMATIVA_ICONS.map((icon) => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Título</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => updateNormativa(idx, "title", e.target.value)}
                            placeholder="Ej: Prohibido grabar, Acceso permitido..."
                            className="bg-card/50 border-white/20 focus:border-primary/50 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Descripción (opcional)</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateNormativa(idx, "description", e.target.value)}
                            placeholder="Detalle adicional..."
                            className="bg-card/50 border-white/20 focus:border-primary/50 text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeNormativa(idx)}
                        className="mt-6 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview */}
              {normativaItems.some((n) => n.title) && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-display mb-3">Vista previa</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {normativaItems.filter((n) => n.title).map((n) => (
                      <div key={n.id} className="flex items-start gap-2 p-2 rounded-lg bg-card/50 border border-white/10">
                        <span className="text-xl flex-shrink-0">{n.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          {n.description && <p className="text-xs text-muted-foreground">{n.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Taquilla */}
            <div className="p-5 rounded-xl border border-white/10 bg-card/50 space-y-4">
              <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Información de Taquilla
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm mb-1.5 block flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Dirección
                  </Label>
                  <Input
                    value={taquillaAddress}
                    onChange={(e) => setTaquillaAddress(e.target.value)}
                    placeholder="Ej: Torre Britanica Altamira Nivel PB"
                    className="bg-card/50 border-white/20 focus:border-primary/50"
                  />
                </div>

                <div>
                  <Label className="text-sm mb-1.5 block flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Horarios de atención
                  </Label>
                  <Textarea
                    value={taquillaSchedule}
                    onChange={(e) => setTaquillaSchedule(e.target.value)}
                    placeholder="Lunes a Sábado de 10:00am a 05:00pm&#10;Domingos de 11:00am a 3:00pm"
                    className="bg-card/50 border-white/20 focus:border-primary/50 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label className="text-sm mb-1.5 block flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Link de Google Maps
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={taquillaMapUrl}
                      onChange={(e) => setTaquillaMapUrl(e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
                      className="bg-card/50 border-white/20 focus:border-primary/50"
                    />
                    {taquillaMapUrl && (
                      <a href={taquillaMapUrl} target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 rounded-lg border border-white/20 text-muted-foreground hover:text-foreground transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Copia el link de Google Maps de la ubicación</p>
                </div>

                <div>
                  <Label className="text-sm mb-1.5 block">Información adicional (opcional)</Label>
                  <Textarea
                    value={taquillaExtra}
                    onChange={(e) => setTaquillaExtra(e.target.value)}
                    placeholder="Puntos de venta adicionales, notas especiales..."
                    className="bg-card/50 border-white/20 focus:border-primary/50 min-h-[80px]"
                  />
                </div>
              </div>

              {/* Preview */}
              {(taquillaAddress || taquillaSchedule) && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-display mb-3">Vista previa de taquilla</p>
                  <div className="space-y-2">
                    {taquillaAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">{taquillaAddress}</p>
                      </div>
                    )}
                    {taquillaSchedule && (
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          {taquillaSchedule.split("\n").map((line, i) => (
                            <p key={i} className="text-sm text-foreground">{line}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {taquillaMapUrl && (
                      <a href={taquillaMapUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver en Google Maps
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Save button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" className="border-white/20" onClick={() => navigate("/admin/eventos")}>
            Cancelar
          </Button>
          <Button className="cp-gradient text-white font-bold gap-2 px-8" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Guardando..." : isEditing ? "Actualizar Evento" : "Crear Evento"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
