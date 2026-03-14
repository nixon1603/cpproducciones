import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, CalendarDays, ShoppingBag, Users, Menu, X,
  LogOut, ChevronRight, Shield, Mic2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const CP_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432613032/4yzfEoxSx65F5YumFPTknr/cp-logo-dark-Go9BaE5TYuBLFpwXvVRuFc.webp";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/admin/artistas", label: "Artistas", icon: Mic2 },
  { href: "/admin/compras", label: "Compras", icon: ShoppingBag },
  { href: "/admin/administradores", label: "Administradores", icon: Users },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl border border-white/10 bg-card/50 max-w-sm">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">Acceso Restringido</h2>
          <p className="text-muted-foreground text-sm mb-6">Debes iniciar sesión para acceder al panel de administración.</p>
          <Link href="/admin/login">
            <Button className="cp-gradient text-white w-full">Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl border border-white/10 bg-card/50 max-w-sm">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">Sin Permisos</h2>
          <p className="text-muted-foreground text-sm mb-6">No tienes permisos de administrador.</p>
          <Link href="/">
            <Button variant="outline" className="border-white/20 w-full">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <img src={CP_LOGO} alt="CP Producciones" className="h-10 w-auto object-contain" />
          </Link>
          <p className="text-xs text-muted-foreground mt-2 font-display tracking-widest uppercase">
            Panel Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "cp-gradient text-white shadow-md shadow-primary/20"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full cp-gradient flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name ?? "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
            onClick={() => logout.mutate()}
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-background/95 backdrop-blur-sm border-b border-white/10 flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <Menu className="w-5 h-5" />
          </button>
          {title && (
            <h1 className="font-heading text-lg font-semibold text-foreground">{title}</h1>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
