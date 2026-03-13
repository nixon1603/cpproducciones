import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  createEvent: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  updateEvent: vi.fn().mockResolvedValue(undefined),
  deleteEvent: vi.fn().mockResolvedValue(undefined),
  getAllEvents: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: "Concierto de Rock 2025",
      description: "Un gran concierto",
      shortDescription: "Concierto épico",
      date: "Viernes 15 de Marzo",
      venue: "Poliedro de Caracas",
      city: "Caracas",
      country: "Venezuela",
      imageUrl: null,
      bannerUrl: null,
      venueMapUrl: null,
      videoUrl: null,
      type: "concert",
      whatsappNumber: "+584121234567",
      zones: [
        { id: "z1", name: "VIP", price: 100, capacity: 200 },
        { id: "z2", name: "General", price: 50 },
      ],
      days: [
        { id: "d1", name: "Viernes", date: "15/03/2025", artists: ["Artista A", "Artista B"] },
        { id: "d2", name: "Sábado", date: "16/03/2025", artists: ["Artista C"] },
      ],
      normativas: JSON.stringify([{ id: "n1", icon: "🚫", title: "No bebidas", description: "No se permiten bebidas" }]),
      taquilla: JSON.stringify({ address: "Torre Britanica Altamira", schedule: "Lunes a Sábado 10am-5pm", mapUrl: "https://maps.google.com" }),
      isActive: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getActiveEvents: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: "Concierto de Rock 2025",
      type: "concert",
      isActive: true,
      isFeatured: true,
      zones: [{ id: "z1", name: "VIP", price: 100 }],
      days: [{ id: "d1", name: "Viernes", date: "15/03/2025", artists: ["Artista A"] }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getEventById: vi.fn().mockResolvedValue({
    id: 1,
    title: "Concierto de Rock 2025",
    type: "concert",
    isActive: true,
    zones: [{ id: "z1", name: "VIP", price: 100 }],
    days: [{ id: "d1", name: "Viernes", date: "15/03/2025", artists: ["Artista A"] }],
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  toggleEventActive: vi.fn().mockResolvedValue(undefined),
  toggleEventFeatured: vi.fn().mockResolvedValue(undefined),
  createPurchase: vi.fn().mockResolvedValue([{ insertId: 10 }]),
  getAllPurchases: vi.fn().mockResolvedValue([
    {
      id: 10,
      eventId: 1,
      buyerName: "Juan Pérez",
      buyerEmail: "juan@example.com",
      buyerPhone: "+58412000000",
      selectedZone: { id: "z1", name: "VIP", price: 100 },
      selectedDays: [{ id: "d1", name: "Viernes", date: "15/03/2025", artists: ["Artista A"] }],
      quantity: 2,
      unitPrice: "100.00",
      totalPrice: "200.00",
      status: "whatsapp_sent",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getPurchasesByEvent: vi.fn().mockResolvedValue([
    {
      id: 11,
      eventId: 1,
      buyerName: "Ana López",
      quantity: 1,
      totalPrice: "100.00",
      status: "whatsapp_sent",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getPurchaseById: vi.fn().mockResolvedValue({
    id: 10,
    eventId: 1,
    buyerName: "Juan Pérez",
    quantity: 2,
    totalPrice: "200.00",
    status: "whatsapp_sent",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  updatePurchaseStatus: vi.fn().mockResolvedValue(undefined),
  getAllAdmins: vi.fn().mockResolvedValue([
    {
      id: 1,
      openId: "admin-open-id",
      name: "Admin User",
      email: "admin@cp.com",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  ]),
  getAllUsers: vi.fn().mockResolvedValue([
    {
      id: 2,
      openId: "user-open-id",
      name: "Regular User",
      email: "user@example.com",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  ]),
  getUserById: vi.fn().mockResolvedValue({
    id: 2,
    openId: "user-open-id",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  }),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
  deleteUser: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  getUserByEmail: vi.fn().mockResolvedValue(null),
  createAdminUser: vi.fn().mockResolvedValue({
    id: 99,
    openId: "new-admin-id",
    name: "Nuevo Admin",
    email: "nuevo@cp.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  }),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(overrides: Partial<NonNullable<TrpcContext["user"]>> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-open-id",
      name: "Admin User",
      email: "admin@cp.com",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-open-id",
      name: "Regular User",
      email: "user@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("events.listPublic", () => {
  it("returns active events for public users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.events.listPublic({ type: "concert" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].type).toBe("concert");
  });

  it("returns events without authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.events.listPublic();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("events.getById", () => {
  it("returns event by id for public users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.events.getById({ id: 1 });
    expect(result.id).toBe(1);
    expect(result.title).toBe("Concierto de Rock 2025");
  });
});

describe("events.listAll (admin only)", () => {
  it("allows admin to list all events", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.events.listAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.events.listAll()).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.events.listAll()).rejects.toThrow();
  });
});

describe("events.create (admin only)", () => {
  it("allows admin to create event with zones and days", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.events.create({
      title: "Nuevo Concierto",
      type: "concert",
      whatsappNumber: "+584121234567",
      zones: [
        { id: "z1", name: "VIP", price: 150, capacity: 100 },
        { id: "z2", name: "General", price: 50 },
      ],
      days: [
        { id: "d1", name: "Viernes 20", date: "20/06/2025", artists: ["Artista X", "Artista Y"] },
        { id: "d2", name: "Sábado 21", date: "21/06/2025", artists: ["Artista Z"] },
      ],
      isActive: true,
      isFeatured: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects event creation with more than 6 zones", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    await expect(
      caller.events.create({
        title: "Evento con muchas zonas",
        type: "concert",
        whatsappNumber: "+584121234567",
        zones: [
          { id: "z1", name: "Zona 1", price: 10 },
          { id: "z2", name: "Zona 2", price: 20 },
          { id: "z3", name: "Zona 3", price: 30 },
          { id: "z4", name: "Zona 4", price: 40 },
          { id: "z5", name: "Zona 5", price: 50 },
          { id: "z6", name: "Zona 6", price: 60 },
          { id: "z7", name: "Zona 7", price: 70 },
        ],
        isActive: true,
        isFeatured: false,
      })
    ).rejects.toThrow();
  });

  it("rejects event creation with more than 4 days", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    await expect(
      caller.events.create({
        title: "Evento con muchos días",
        type: "concert",
        whatsappNumber: "+584121234567",
        days: [
          { id: "d1", name: "Día 1", date: "01/01/2025", artists: [] },
          { id: "d2", name: "Día 2", date: "02/01/2025", artists: [] },
          { id: "d3", name: "Día 3", date: "03/01/2025", artists: [] },
          { id: "d4", name: "Día 4", date: "04/01/2025", artists: [] },
          { id: "d5", name: "Día 5", date: "05/01/2025", artists: [] },
        ],
        isActive: true,
        isFeatured: false,
      })
    ).rejects.toThrow();
  });
});

describe("events.toggleActive (admin only)", () => {
  it("allows admin to toggle event active status", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.events.toggleActive({ id: 1, isActive: false });
    expect(result.success).toBe(true);
  });
});

describe("events.toggleFeatured (admin only)", () => {
  it("allows admin to toggle event featured status", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.events.toggleFeatured({ id: 1, isFeatured: true });
    expect(result.success).toBe(true);
  });
});

describe("purchases.create (public)", () => {
  it("allows public users to create a purchase", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.purchases.create({
      eventId: 1,
      buyerName: "María García",
      buyerEmail: "maria@example.com",
      buyerPhone: "+58412000001",
      selectedZone: { id: "z1", name: "VIP", price: 100, capacity: 200 },
      selectedDays: [{ id: "d1", name: "Viernes", date: "15/03/2025", artists: ["Artista A"] }],
      quantity: 2,
      unitPrice: 100,
      totalPrice: 200,
    });
    expect(result.success).toBe(true);
    expect(result.insertId).toBeDefined();
  });

  it("rejects purchase with quantity 0", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.purchases.create({ eventId: 1, buyerName: "Test User", quantity: 0 })
    ).rejects.toThrow();
  });

  it("rejects purchase with quantity > 20", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.purchases.create({ eventId: 1, buyerName: "Test User", quantity: 21 })
    ).rejects.toThrow();
  });
});

describe("purchases.listAll (admin only)", () => {
  it("allows admin to list all purchases", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.purchases.listAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].buyerName).toBe("Juan Pérez");
  });

  it("rejects non-admin access to purchases", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.purchases.listAll()).rejects.toThrow();
  });
});

describe("purchases.listByEvent (admin only)", () => {
  it("allows admin to list purchases filtered by event", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.purchases.listByEvent({ eventId: 1 });
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].eventId).toBe(1);
  });

  it("rejects non-admin access", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.purchases.listByEvent({ eventId: 1 })).rejects.toThrow();
  });
});

describe("purchases.updateStatus (admin only)", () => {
  it("allows admin to update purchase status to confirmed", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.purchases.updateStatus({ id: 10, status: "confirmed" });
    expect(result.success).toBe(true);
  });

  it("allows admin to update purchase status to whatsapp_sent", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.purchases.updateStatus({ id: 10, status: "whatsapp_sent" });
    expect(result.success).toBe(true);
  });

  it("allows admin to update purchase status to cancelled", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.purchases.updateStatus({ id: 10, status: "cancelled" });
    expect(result.success).toBe(true);
  });
});

describe("admins.list (admin only)", () => {
  it("allows admin to list all admins", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admins.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].role).toBe("admin");
  });
});

describe("admins.createAdmin (admin only)", () => {
  it("allows admin to create a new admin user directly", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admins.createAdmin({
      name: "Nuevo Admin",
      email: "nuevo@cp.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin from creating admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.admins.createAdmin({ name: "Hacker", email: "hack@evil.com" })
    ).rejects.toThrow();
  });
});

describe("admins.updateRole (admin only)", () => {
  it("allows admin to promote a user to admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admins.updateRole({ userId: 2, role: "admin" });
    expect(result.success).toBe(true);
  });

  it("prevents admin from changing their own role", async () => {
    const caller = appRouter.createCaller(makeAdminCtx({ id: 1 }));
    await expect(
      caller.admins.updateRole({ userId: 1, role: "user" })
    ).rejects.toThrow();
  });
});

describe("admins.delete (admin only)", () => {
  it("allows admin to delete another user", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admins.delete({ userId: 2 });
    expect(result.success).toBe(true);
  });

  it("prevents admin from deleting themselves", async () => {
    const caller = appRouter.createCaller(makeAdminCtx({ id: 1 }));
    await expect(
      caller.admins.delete({ userId: 1 })
    ).rejects.toThrow();
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
