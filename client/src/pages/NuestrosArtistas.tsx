import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Music, ArrowRight, Instagram, ExternalLink, Play, Mic2, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import type { SocialLinks } from "../../../drizzle/schema";

const HERO_BG = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1920&q=80&auto=format&fit=crop";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
};

function SocialButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  if (!href || href === "#") return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 hover:scale-110 transition-all duration-300"
    >
      {icon}
    </a>
  );
}

export default function NuestrosArtistas() {
  const { data: artists, isLoading } = trpc.artists.listPublic.useQuery();
  const allArtists = artists ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden mt-0">
        <img src={HERO_BG} alt="Nuestros Artistas" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/40 animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.div variants={fadeInUp} custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
              <Sparkles className="w-3 h-3" />
              CP Producciones
            </motion.div>
            <motion.h1 variants={fadeInUp} custom={1}
              className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight">
              <span className="cp-gradient-text">NUESTROS</span>
              <br />
              <span className="text-foreground">ARTISTAS</span>
            </motion.h1>
            <motion.p variants={fadeInUp} custom={2}
              className="text-muted-foreground mt-4 max-w-lg mx-auto text-sm md:text-base px-4">
              Conoce a los talentos que hacen posible experiencias musicales inolvidables
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Artists Grid ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="h-[500px] rounded-2xl bg-card/50 animate-pulse border border-white/10" />
              ))}
            </div>
          ) : allArtists.length === 0 ? (
            <div className="text-center py-24 rounded-2xl border border-white/10 bg-card/30">
              <Mic2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">Próximamente</h3>
              <p className="text-muted-foreground">Estamos preparando algo increíble. ¡Vuelve pronto!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {allArtists.map((artist, idx) => {
                const social = (artist.socialLinks as SocialLinks) ?? {};
                return (
                  <motion.div
                    key={artist.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={scaleIn}
                    custom={idx}
                    className="group relative rounded-2xl overflow-hidden border border-white/10 bg-card/50 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
                  >
                    {/* Photo */}
                    <div className="relative h-72 md:h-96 overflow-hidden">
                      {artist.photoUrl ? (
                        <img
                          src={artist.photoUrl}
                          alt={artist.stageName || artist.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full cp-gradient flex items-center justify-center">
                          <Mic2 className="w-20 h-20 text-white/20" />
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

                      {/* Genre badge */}
                      {artist.genre && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary/80 backdrop-blur-sm text-white text-xs font-bold border-0 py-1 px-3">
                            <Music className="w-3 h-3 mr-1.5" />
                            {artist.genre}
                          </Badge>
                        </div>
                      )}

                      {/* Glow effect on hover */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 space-y-4">
                      {/* Name */}
                      <div>
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground group-hover:cp-gradient-text transition-all">
                          {artist.stageName || artist.name}
                        </h2>
                        {artist.stageName && artist.name !== artist.stageName && (
                          <p className="text-sm text-muted-foreground mt-1">{artist.name}</p>
                        )}
                      </div>

                      {/* Bio */}
                      {artist.bio && (
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                          {artist.bio}
                        </p>
                      )}

                      {/* Social Links */}
                      <div className="flex items-center gap-3 pt-2">
                        <SocialButton href={social.instagram ?? ""} icon={<Instagram className="w-4 h-4" />} label="Instagram" />
                        <SocialButton href={social.spotify ?? ""} icon={<span className="text-sm">🎵</span>} label="Spotify" />
                        <SocialButton href={social.youtube ?? ""} icon={<Play className="w-4 h-4" />} label="YouTube" />
                        <SocialButton href={social.tiktok ?? ""} icon={<span className="text-sm">🎶</span>} label="TikTok" />
                        <SocialButton href={social.twitter ?? ""} icon={<span className="text-sm font-bold">𝕏</span>} label="Twitter" />
                      </div>

                      {/* Video */}
                      {artist.videoUrl && (
                        <div className="rounded-xl overflow-hidden border border-white/10 aspect-video">
                          <iframe
                            src={artist.videoUrl}
                            className="w-full h-full"
                            allowFullScreen
                            title={`Video de ${artist.stageName || artist.name}`}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 cp-gradient" />
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)",
              }}
            />
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative z-10 px-8 md:px-16 py-16 md:py-20 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-4">
                <Mic2 className="w-3 h-3" />
                Booking Disponible
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                ¿QUIERES CONTRATAR
                <br />
                <span className="text-white/80">A NUESTROS ARTISTAS?</span>
              </h2>
              <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8">
                Contáctanos para llevar el talento de CP Producciones a tu evento.
                Producción integral, logística y experiencias de primer nivel.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/eventos">
                  <Button size="lg" className="bg-white text-primary font-bold hover:bg-white/90 shadow-2xl hover:scale-105 transition-all">
                    Ver Eventos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/quienes-somos">
                  <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-bold">
                    Contactar
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
