import { useState } from "react";
import { useLocation } from "wouter";
import { Shield, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CP_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432613032/4yzfEoxSx65F5YumFPTknr/cp-logo-dark-Go9BaE5TYuBLFpwXvVRuFc.webp";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/local-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error de autenticación");
        toast.error(data.error || "Contraseña incorrecta");
        setLoading(false);
        return;
      }

      toast.success("¡Bienvenido al panel admin!");
      // Small delay to let the cookie be set
      setTimeout(() => {
        window.location.href = "/admin";
      }, 300);
    } catch (err) {
      setError("Error de conexión con el servidor");
      toast.error("No se pudo conectar al servidor");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={CP_LOGO}
            alt="CP Producciones"
            className="h-16 w-auto mx-auto mb-4 object-contain"
          />
          <p className="text-xs text-muted-foreground font-display tracking-[0.3em] uppercase">
            Panel de Administración
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl p-8 shadow-2xl shadow-primary/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl cp-gradient flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">Acceso Admin</h1>
              <p className="text-sm text-muted-foreground">Ingresa para gestionar eventos</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Ingresa la contraseña"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full cp-gradient text-white font-semibold py-3 rounded-xl gap-2 text-base hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Contraseña por defecto: configurada en variable de entorno ADMIN_PASSWORD
        </p>
      </div>
    </div>
  );
}
