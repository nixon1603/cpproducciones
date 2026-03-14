import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import QuienesSomos from "./pages/QuienesSomos";
import NuestrosArtistas from "./pages/NuestrosArtistas";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminEventForm from "./pages/admin/AdminEventForm";
import AdminArtists from "./pages/admin/AdminArtists";
import AdminArtistForm from "./pages/admin/AdminArtistForm";
import AdminPurchases from "./pages/admin/AdminPurchases";
import AdminAdmins from "./pages/admin/AdminAdmins";
import AdminLogin from "./pages/admin/AdminLogin";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/eventos" component={Events} />
      <Route path="/eventos/:id" component={EventDetail} />
      <Route path="/quienes-somos" component={QuienesSomos} />
      <Route path="/nuestros-artistas" component={NuestrosArtistas} />
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/eventos" component={AdminEvents} />
      <Route path="/admin/eventos/nuevo" component={AdminEventForm} />
      <Route path="/admin/eventos/:id/editar" component={AdminEventForm} />
      <Route path="/admin/artistas" component={AdminArtists} />
      <Route path="/admin/artistas/nuevo" component={AdminArtistForm} />
      <Route path="/admin/artistas/:id/editar" component={AdminArtistForm} />
      <Route path="/admin/compras" component={AdminPurchases} />
      <Route path="/admin/administradores" component={AdminAdmins} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
