import { useState } from "react";
import { Shield, UserX, UserCheck, Users, Search, Crown, User, Plus, Mail, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminAdmins() {
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    type: "promote" | "demote" | "delete";
    userId: number;
    userName: string;
  } | null>(null);

  const { user: currentUser } = useAuth();
  const { data: admins, isLoading: loadingAdmins, refetch: refetchAdmins } = trpc.admins.list.useQuery();
  const { data: allUsers, isLoading: loadingUsers, refetch: refetchUsers } = trpc.admins.listUsers.useQuery();

  const updateRole = trpc.admins.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Rol actualizado exitosamente");
      refetchAdmins();
      refetchUsers();
      setConfirmAction(null);
    },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const deleteUser = trpc.admins.delete.useMutation({
    onSuccess: () => {
      toast.success("Usuario eliminado");
      refetchAdmins();
      refetchUsers();
      setConfirmAction(null);
    },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const createAdmin = trpc.admins.createAdmin.useMutation({
    onSuccess: (data) => {
      const msg = data.action === "promoted"
        ? "Usuario promovido a administrador"
        : "Administrador creado exitosamente";
      toast.success(msg);
      refetchAdmins();
      refetchUsers();
      setShowCreateDialog(false);
      setNewAdminName("");
      setNewAdminEmail("");
    },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "delete") {
      deleteUser.mutate({ userId: confirmAction.userId });
    } else {
      updateRole.mutate({
        userId: confirmAction.userId,
        role: confirmAction.type === "promote" ? "admin" : "user",
      });
    }
  };

  const handleCreateAdmin = () => {
    if (!newAdminName.trim()) { toast.error("El nombre es requerido"); return; }
    if (!newAdminEmail.trim()) { toast.error("El email es requerido"); return; }
    createAdmin.mutate({ name: newAdminName.trim(), email: newAdminEmail.trim() });
  };

  const filteredAdmins = (admins ?? []).filter((u) =>
    (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const nonAdminUsers = (allUsers ?? []).filter((u) => u.role !== "admin");
  const filteredNonAdmins = nonAdminUsers.filter((u) =>
    (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Administradores">
      <div className="space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-card/50 text-center">
            <p className="text-2xl font-bold font-display cp-gradient-text">{admins?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Administradores</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-card/50 text-center">
            <p className="text-2xl font-bold font-display text-blue-400">{nonAdminUsers.length}</p>
            <p className="text-sm text-muted-foreground">Usuarios registrados</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-card/50 text-center">
            <p className="text-2xl font-bold font-display text-foreground">{allUsers?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Total usuarios</p>
          </div>
        </div>

        {/* Header with search and create button */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card/50 border-white/20"
            />
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="cp-gradient text-white font-semibold gap-2 flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Agregar Administrador
          </Button>
        </div>

        {/* Admins List */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-amber-400" />
            <h2 className="font-heading text-lg font-bold text-foreground">Administradores Activos</h2>
          </div>
          <div className="rounded-xl border border-white/10 bg-card/50 overflow-hidden">
            {loadingAdmins ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No se encontraron administradores.</div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredAdmins.map((admin) => {
                  const isCurrentUser = admin.id === currentUser?.id;
                  const isManual = admin.loginMethod === "manual";
                  return (
                    <div key={admin.id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                      <div className="w-9 h-9 rounded-full cp-gradient flex items-center justify-center flex-shrink-0">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{admin.name ?? "Sin nombre"}</p>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs border-primary/40 text-primary">Tú</Badge>
                          )}
                          {isManual && (
                            <Badge variant="outline" className="text-xs border-blue-400/40 text-blue-400">Manual</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{admin.email ?? "Sin email"}</p>
                        <p className="text-xs text-muted-foreground/60">
                          Desde: {new Date(admin.createdAt).toLocaleDateString("es-VE")}
                        </p>
                      </div>
                      {!isCurrentUser && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                            onClick={() => setConfirmAction({ type: "demote", userId: admin.id, userName: admin.name ?? "este usuario" })}
                          >
                            <UserX className="w-3 h-3 mr-1" />
                            Quitar admin
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => setConfirmAction({ type: "delete", userId: admin.id, userName: admin.name ?? "este usuario" })}
                          >
                            Eliminar
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Regular Users */}
        {filteredNonAdmins.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-heading text-lg font-bold text-foreground">Usuarios Registrados</h2>
              <span className="text-xs text-muted-foreground">(pueden ser promovidos a admin)</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-card/50 overflow-hidden">
              {loadingUsers ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filteredNonAdmins.map((user) => (
                    <div key={user.id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-card border border-white/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{user.name ?? "Sin nombre"}</p>
                        <p className="text-xs text-muted-foreground">{user.email ?? "Sin email"}</p>
                        <p className="text-xs text-muted-foreground/60">
                          {user.loginMethod ?? "—"} · {new Date(user.createdAt).toLocaleDateString("es-VE")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                          onClick={() => setConfirmAction({ type: "promote", userId: user.id, userName: user.name ?? "este usuario" })}
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Hacer admin
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => setConfirmAction({ type: "delete", userId: user.id, userName: user.name ?? "este usuario" })}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Admin Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card border-white/10 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Agregar Administrador
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Crea un nuevo administrador directamente sin necesidad de Manus OAuth. Si el email ya existe, el usuario será promovido a admin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="admin-name" className="text-sm text-foreground">
                Nombre completo <span className="text-red-400">*</span>
              </Label>
              <Input
                id="admin-name"
                placeholder="Ej: Carlos Pérez"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="bg-card/50 border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-sm text-foreground">
                Email <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@cpproducciones.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="pl-9 bg-card/50 border-white/20"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-primary inline mr-1.5" />
              Los administradores creados manualmente tienen acceso completo al panel. Podrán iniciar sesión con su email a través de Manus OAuth.
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-white/20"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateAdmin}
              disabled={createAdmin.isPending}
              className="cp-gradient text-white font-semibold"
            >
              {createAdmin.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Crear Administrador
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="bg-card border-white/10 text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              {confirmAction?.type === "delete" ? "Eliminar usuario" :
               confirmAction?.type === "promote" ? "Promover a administrador" :
               "Quitar rol de administrador"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {confirmAction?.type === "delete"
                ? `¿Estás seguro de que deseas eliminar a "${confirmAction.userName}"? Esta acción no se puede deshacer.`
                : confirmAction?.type === "promote"
                ? `¿Deseas promover a "${confirmAction?.userName}" como administrador? Tendrá acceso completo al panel.`
                : `¿Deseas quitar el rol de administrador a "${confirmAction?.userName}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-foreground">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={confirmAction?.type === "delete" ? "bg-red-600 hover:bg-red-700 text-white" : "cp-gradient text-white"}
            >
              {confirmAction?.type === "delete" ? "Eliminar" :
               confirmAction?.type === "promote" ? "Promover" : "Quitar admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
