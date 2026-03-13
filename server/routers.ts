import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createAdminUser, createEvent, createPurchase, deleteEvent, deleteUser,
  getAllAdmins, getAllEvents, getAllPurchases, getAllUsers,
  getActiveEvents, getEventById, getPurchaseById,
  getPurchasesByEvent, getUserByEmail, getUserById, toggleEventActive,
  updateEvent, updatePurchaseStatus, updateUserRole,
} from "./db";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const zoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().min(0),
  capacity: z.number().optional(),
});

const daySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  date: z.string(),
  artists: z.array(z.string()),
});

const eventCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  date: z.string().optional(),
  venue: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  imageUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  venueMapUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  type: z.enum(["concert", "festival", "other"]).default("concert"),
  whatsappNumber: z.string().optional(),
  zones: z.array(zoneSchema).max(6).optional(),
  days: z.array(daySchema).max(4).optional(),
  normativas: z.string().optional(),
  taquilla: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

const purchaseCreateSchema = z.object({
  eventId: z.number(),
  buyerName: z.string().min(1),
  buyerEmail: z.string().email().optional(),
  buyerPhone: z.string().optional(),
  selectedZone: zoneSchema.optional(),
  selectedDays: z.array(daySchema).optional(),
  quantity: z.number().min(1).max(20),
  unitPrice: z.number().min(0).optional(),
  totalPrice: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// ─── Admin middleware ─────────────────────────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acceso restringido a administradores" });
  }
  return next({ ctx });
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Events ──────────────────────────────────────────────────────────────
  events: router({
    /** Public: list active concerts */
    listPublic: publicProcedure
      .input(z.object({ type: z.enum(["concert", "festival", "other"]).optional() }).optional())
      .query(async ({ input }) => {
        return getActiveEvents(input?.type ?? "concert");
      }),

    /** Public: get event by id */
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const event = await getEventById(input.id);
        if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "Evento no encontrado" });
        return event;
      }),

    /** Admin: list all events */
    listAll: adminProcedure.query(async () => getAllEvents()),

    /** Admin: create event */
    create: adminProcedure
      .input(eventCreateSchema)
      .mutation(async ({ input }) => {
        const result = await createEvent({
          title: input.title,
          description: input.description ?? null,
          shortDescription: input.shortDescription ?? null,
          date: input.date ?? null,
          venue: input.venue ?? null,
          city: input.city ?? null,
          country: input.country ?? null,
          imageUrl: input.imageUrl ?? null,
          bannerUrl: input.bannerUrl ?? null,
          venueMapUrl: input.venueMapUrl ?? null,
          videoUrl: input.videoUrl ?? null,
          type: input.type,
          whatsappNumber: input.whatsappNumber ?? null,
          zones: input.zones ?? null,
          days: input.days ?? null,
          normativas: input.normativas ?? null,
          taquilla: input.taquilla ?? null,
          isActive: input.isActive,
          isFeatured: input.isFeatured,
        } as any);
        return { success: true, insertId: (result as any)[0]?.insertId };
      }),

    /** Admin: update event */
    update: adminProcedure
      .input(z.object({ id: z.number(), data: eventCreateSchema.partial() }))
      .mutation(async ({ input }) => {
        await updateEvent(input.id, input.data as any);
        return { success: true };
      }),

    /** Admin: delete event */
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteEvent(input.id);
        return { success: true };
      }),

    /** Admin: toggle active */
    toggleActive: adminProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        await toggleEventActive(input.id, input.isActive);
        return { success: true };
      }),

    /** Admin: toggle featured */
    toggleFeatured: adminProcedure
      .input(z.object({ id: z.number(), isFeatured: z.boolean() }))
      .mutation(async ({ input }) => {
        await updateEvent(input.id, { isFeatured: input.isFeatured } as any);
        return { success: true };
      }),
  }),

  // ─── Purchases ────────────────────────────────────────────────────────────
  purchases: router({
    /** Public: create purchase */
    create: publicProcedure
      .input(purchaseCreateSchema)
      .mutation(async ({ input }) => {
        const result = await createPurchase({
          ...input,
          unitPrice: input.unitPrice?.toString(),
          totalPrice: input.totalPrice?.toString(),
          selectedZone: input.selectedZone ?? null,
          selectedDays: input.selectedDays ?? null,
        } as any);
        return { success: true, insertId: (result as any)[0]?.insertId };
      }),

    /** Admin: list all purchases */
    listAll: adminProcedure.query(async () => getAllPurchases()),

    /** Admin: list by event */
    listByEvent: adminProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => getPurchasesByEvent(input.eventId)),

    /** Admin: get by id */
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const p = await getPurchaseById(input.id);
        if (!p) throw new TRPCError({ code: "NOT_FOUND" });
        return p;
      }),

    /** Admin: update status */
    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "confirmed", "cancelled", "whatsapp_sent"]) }))
      .mutation(async ({ input }) => {
        await updatePurchaseStatus(input.id, input.status as any);
        return { success: true };
      }),
  }),

  // ─── Admins ───────────────────────────────────────────────────────────────
  admins: router({
    /** Admin: list all admins */
    list: adminProcedure.query(async () => getAllAdmins()),

    /** Admin: list all users */
    listUsers: adminProcedure.query(async () => getAllUsers()),

    /** Admin: update user role */
    updateRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input, ctx }) => {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No puedes cambiar tu propio rol" });
        }
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    /** Admin: delete user */
    delete: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No puedes eliminarte a ti mismo" });
        }
        await deleteUser(input.userId);
        return { success: true };
      }),

    /** Admin: get user by id */
    getUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await getUserById(input.userId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        return user;
      }),

    /** Admin: create a new admin directly (without Manus OAuth) */
    createAdmin: adminProcedure
      .input(z.object({
        name: z.string().min(1, "El nombre es requerido"),
        email: z.string().email("Email inválido"),
      }))
      .mutation(async ({ input }) => {
        // Check if email already exists
        const existing = await getUserByEmail(input.email);
        if (existing) {
          if (existing.role === "admin") {
            throw new TRPCError({ code: "CONFLICT", message: "Este email ya tiene rol de administrador" });
          }
          // Promote existing user to admin
          await updateUserRole(existing.id, "admin");
          return { success: true, action: "promoted", userId: existing.id };
        }
        // Create new admin user
        await createAdminUser({ name: input.name, email: input.email });
        return { success: true, action: "created" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
