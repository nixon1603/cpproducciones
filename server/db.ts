import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { artists, events, purchases, users, type Artist, type Event, type InsertArtist, type InsertEvent, type InsertPurchase, type InsertUser, type Purchase, type User } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _dbFailed = false;
let memoryInitialized = false;
let memoryUsers: User[] = [];
let memoryEvents: Event[] = [];
let memoryPurchases: Purchase[] = [];
let memoryArtists: Artist[] = [];
let nextUserId = 1;
let nextEventId = 1;
let nextPurchaseId = 1;
let nextArtistId = 1;

const useMemoryDb = () => !process.env.DATABASE_URL || _dbFailed;

function initMemoryDb() {
  if (memoryInitialized) return;
  memoryInitialized = true;

  const createdAt = new Date();
  const updatedAt = new Date();

  memoryUsers = [
    {
      id: 1,
      openId: "local-admin",
      name: "Admin Local",
      email: "admin@cp-producciones.local",
      loginMethod: "local",
      role: "admin",
      createdAt,
      updatedAt,
      lastSignedIn: new Date(),
    },
    {
      id: 2,
      openId: "local-user",
      name: "Usuario Demo",
      email: "usuario@cp-producciones.local",
      loginMethod: "local",
      role: "user",
      createdAt,
      updatedAt,
      lastSignedIn: new Date(),
    },
  ];

  memoryEvents = [
    {
      id: 1,
      title: "Caramelos de Cianuro Live",
      description: "Una noche de rock con producción premium.",
      shortDescription: "Rock en vivo con puesta en escena de alto nivel.",
      date: "2026-05-18",
      venue: "Poliedro de Caracas",
      city: "Caracas",
      country: "Venezuela",
      imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80&auto=format&fit=crop",
      bannerUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1920&q=80&auto=format&fit=crop",
      venueMapUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=1200&q=80&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      type: "concert",
      whatsappNumber: "+584121234567",
      zones: [
        { id: "vip", name: "VIP", price: 120, capacity: 300 },
        { id: "general", name: "General", price: 60, capacity: 1500 },
      ],
      days: [
        { id: "d1", name: "Día 1", date: "2026-05-18", artists: ["Caramelos de Cianuro", "Los Mesoneros"] },
      ],
      normativas: "Prohibido el ingreso de envases de vidrio.",
      taquilla: JSON.stringify({
        address: "Torre Británica, Altamira, PB",
        schedule: "Lunes a Sábado 10:00am - 5:00pm",
        mapsUrl: "https://maps.google.com/?q=Caracas",
      }),
      isActive: true,
      isFeatured: true,
      createdAt,
      updatedAt,
    },
    {
      id: 2,
      title: "Noches Electrónicas CP",
      description: "Festival electrónico con DJs internacionales.",
      shortDescription: "Luces, sonido inmersivo y artistas top.",
      date: "2026-06-02",
      venue: "Terraza CCCT",
      city: "Caracas",
      country: "Venezuela",
      imageUrl: "https://images.unsplash.com/photo-1571266028243-d220c9f57da1?w=1200&q=80&auto=format&fit=crop",
      bannerUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80&auto=format&fit=crop",
      venueMapUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
      type: "concert",
      whatsappNumber: "+584124445566",
      zones: [
        { id: "front", name: "Front Stage", price: 180, capacity: 250 },
        { id: "arena", name: "Arena", price: 90, capacity: 1200 },
      ],
      days: [
        { id: "d1", name: "Noche Única", date: "2026-06-02", artists: ["DJ Nova", "Luna Beat"] },
      ],
      normativas: "Ingreso para mayores de 18 años.",
      taquilla: JSON.stringify({
        address: "Centro Ciudad Comercial Tamanaco",
        schedule: "Martes a Domingo 11:00am - 7:00pm",
        mapsUrl: "https://maps.google.com/?q=CCCT",
      }),
      isActive: true,
      isFeatured: false,
      createdAt,
      updatedAt,
    },
  ];

  memoryPurchases = [
    {
      id: 1,
      eventId: 1,
      buyerName: "María González",
      buyerEmail: "maria@example.com",
      buyerPhone: "+584141112233",
      selectedZone: { id: "vip", name: "VIP", price: 120, capacity: 300 },
      selectedDays: [{ id: "d1", name: "Día 1", date: "2026-05-18", artists: ["Caramelos de Cianuro"] }],
      quantity: 2,
      unitPrice: "120.00",
      totalPrice: "240.00",
      status: "confirmed",
      notes: null,
      createdAt,
      updatedAt,
    },
    {
      id: 2,
      eventId: 2,
      buyerName: "Carlos Pérez",
      buyerEmail: "carlos@example.com",
      buyerPhone: "+584121239999",
      selectedZone: { id: "arena", name: "Arena", price: 90, capacity: 1200 },
      selectedDays: [{ id: "d1", name: "Noche Única", date: "2026-06-02", artists: ["DJ Nova"] }],
      quantity: 3,
      unitPrice: "90.00",
      totalPrice: "270.00",
      status: "whatsapp_sent",
      notes: null,
      createdAt,
      updatedAt,
    },
  ];

  memoryArtists = [
    {
      id: 1,
      name: "Artista 1",
      stageName: "Artista Uno",
      bio: "Artista destacado de CP Producciones con amplia trayectoria en la escena musical venezolana e internacional. Su energía en el escenario y su talento lo han convertido en una de las figuras más solicitadas del momento.",
      genre: "Reggaeton",
      photoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80&auto=format&fit=crop",
      bannerUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1920&q=80&auto=format&fit=crop",
      videoUrl: "",
      socialLinks: { instagram: "#", spotify: "#", youtube: "#" },
      isActive: true,
      sortOrder: 1,
      createdAt,
      updatedAt,
    },
    {
      id: 2,
      name: "Artista 2",
      stageName: "Artista Dos",
      bio: "Talento emergente que ha conquistado los escenarios con su estilo único y su capacidad para conectar con el público. Parte fundamental del roster de CP Producciones.",
      genre: "Pop Urban",
      photoUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80&auto=format&fit=crop",
      bannerUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80&auto=format&fit=crop",
      videoUrl: "",
      socialLinks: { instagram: "#", spotify: "#", youtube: "#" },
      isActive: true,
      sortOrder: 2,
      createdAt,
      updatedAt,
    },
  ];

  nextUserId = 3;
  nextEventId = 3;
  nextPurchaseId = 3;
  nextArtistId = 3;
}

export async function getDb() {
  if (_dbFailed) return null;
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
      // Test the connection with a simple query
      await _db.execute(sql`SELECT 1`);
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.warn("[Database] Failed to connect, falling back to in-memory DB:", (error as Error).message);
      _db = null;
      _dbFailed = true;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  if (useMemoryDb()) {
    initMemoryDb();
    const idx = memoryUsers.findIndex(u => u.openId === user.openId);
    if (idx >= 0) {
      const current = memoryUsers[idx];
      if (!current) return;
      memoryUsers[idx] = {
        ...current,
        name: user.name ?? current.name ?? null,
        email: user.email ?? current.email ?? null,
        loginMethod: user.loginMethod ?? current.loginMethod ?? null,
        role: user.role ?? current.role,
        lastSignedIn: user.lastSignedIn ?? new Date(),
        updatedAt: new Date(),
      };
      return;
    }
    memoryUsers.push({
      id: nextUserId++,
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: user.lastSignedIn ?? new Date(),
    });
    return;
  }
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  if (useMemoryDb()) {
    initMemoryDb();
    return memoryUsers.find(u => u.openId === openId);
  }
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Admin helpers ────────────────────────────────────────────────────────────

export async function getAllAdmins() {
  if (useMemoryDb()) {
    initMemoryDb();
    return memoryUsers
      .filter(u => u.role === "admin")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.role, "admin")).orderBy(desc(users.createdAt));
}

export async function getAllUsers() {
  if (useMemoryDb()) {
    initMemoryDb();
    return [...memoryUsers].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  if (useMemoryDb()) {
    initMemoryDb();
    memoryUsers = memoryUsers.map(u => (u.id === userId ? { ...u, role, updatedAt: new Date() } : u));
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function deleteUser(userId: number) {
  if (useMemoryDb()) {
    initMemoryDb();
    memoryUsers = memoryUsers.filter(u => u.id !== userId);
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(users).where(eq(users.id, userId));
}

export async function getUserById(userId: number) {
  if (useMemoryDb()) {
    initMemoryDb();
    return memoryUsers.find(u => u.id === userId);
  }
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  if (useMemoryDb()) {
    initMemoryDb();
    return memoryUsers.find(u => u.email === email);
  }
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createAdminUser(data: { name: string; email: string }) {
  if (useMemoryDb()) {
    initMemoryDb();
    const openId = `manual_${data.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    memoryUsers.push({
      id: nextUserId++,
      openId,
      name: data.name,
      email: data.email,
      loginMethod: "manual",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    return { openId };
  }
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // Use email as openId prefix to create a unique identifier for manually-created admins
  const openId = `manual_${data.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
  await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    loginMethod: "manual",
    role: "admin",
    lastSignedIn: new Date(),
  });
  return { openId };
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function getActiveEvents(type?: "concert" | "festival" | "other") {
  if (useMemoryDb()) {
    initMemoryDb();
    return memoryEvents
      .filter(e => e.isActive && (!type || e.type === type))
      .sort((a, b) => {
        if (a.isFeatured === b.isFeatured) return b.createdAt.getTime() - a.createdAt.getTime();
        return a.isFeatured ? -1 : 1;
      });
  }
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(events.isActive, true)];
  if (type) conditions.push(eq(events.type, type));
  return db.select().from(events).where(and(...conditions)).orderBy(desc(events.isFeatured), desc(events.createdAt));
}

export async function getAllEvents() {
  if (useMemoryDb()) {
    initMemoryDb();
    return [...memoryEvents].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).orderBy(desc(events.createdAt));
}

export async function getEventById(id: number) {
  if (useMemoryDb()) {
    initMemoryDb();
    return memoryEvents.find(e => e.id === id);
  }
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0];
}

export async function createEvent(data: InsertEvent) {
  if (useMemoryDb()) {
    initMemoryDb();
    const now = new Date();
    const created: Event = {
      id: nextEventId++,
      title: data.title,
      description: data.description ?? null,
      shortDescription: data.shortDescription ?? null,
      date: data.date ?? null,
      venue: data.venue ?? null,
      city: data.city ?? null,
      country: data.country ?? "Venezuela",
      imageUrl: data.imageUrl ?? null,
      bannerUrl: data.bannerUrl ?? null,
      venueMapUrl: data.venueMapUrl ?? null,
      videoUrl: data.videoUrl ?? null,
      type: data.type ?? "concert",
      whatsappNumber: data.whatsappNumber ?? null,
      zones: (data.zones as any) ?? null,
      days: (data.days as any) ?? null,
      normativas: data.normativas ?? null,
      taquilla: data.taquilla ?? null,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      createdAt: now,
      updatedAt: now,
    };
    memoryEvents.push(created);
    return [{ insertId: created.id }];
  }
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(events).values(data);
  return result;
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  if (useMemoryDb()) {
    initMemoryDb();
    memoryEvents = memoryEvents.map(event => {
      if (event.id !== id) return event;
      return {
        ...event,
        ...data,
        updatedAt: new Date(),
      } as Event;
    });
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(events).set(data).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  if (useMemoryDb()) {
    initMemoryDb();
    memoryEvents = memoryEvents.filter(e => e.id !== id);
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(events).where(eq(events.id, id));
}

export async function toggleEventActive(id: number, isActive: boolean) {
  if (useMemoryDb()) {
    initMemoryDb();
    memoryEvents = memoryEvents.map(e => (e.id === id ? { ...e, isActive, updatedAt: new Date() } : e));
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(events).set({ isActive }).where(eq(events.id, id));
}

// ─── Purchases ────────────────────────────────────────────────────────────────

export async function createPurchase(data: InsertPurchase) {
  if (useMemoryDb()) {
    initMemoryDb();
    const now = new Date();
    const created: Purchase = {
      id: nextPurchaseId++,
      eventId: data.eventId,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail ?? null,
      buyerPhone: data.buyerPhone ?? null,
      selectedZone: (data.selectedZone as any) ?? null,
      selectedDays: (data.selectedDays as any) ?? null,
      quantity: data.quantity ?? 1,
      unitPrice: data.unitPrice ?? null,
      totalPrice: data.totalPrice ?? null,
      status: (data.status as any) ?? "pending",
      notes: data.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    memoryPurchases.push(created);
    return [{ insertId: created.id }];
  }
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(purchases).values(data);
  return result;
}

export async function getAllPurchases() {
  if (useMemoryDb()) {
    initMemoryDb();
    return [...memoryPurchases].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  const db = await getDb();
  if (!db) return [];
  return db.select().from(purchases).orderBy(desc(purchases.createdAt));
}

export async function getPurchasesByEvent(eventId: number) {
  if (useMemoryDb()) {
    initMemoryDb();
    return memoryPurchases
      .filter(p => p.eventId === eventId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  const db = await getDb();
  if (!db) return [];
  return db.select().from(purchases).where(eq(purchases.eventId, eventId)).orderBy(desc(purchases.createdAt));
}

export async function getPurchaseById(id: number) {
  if (useMemoryDb()) {
    initMemoryDb();
    return memoryPurchases.find(p => p.id === id);
  }
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(purchases).where(eq(purchases.id, id)).limit(1);
  return result[0];
}

export async function updatePurchaseStatus(id: number, status: "pending" | "confirmed" | "cancelled" | "whatsapp_sent") {
  if (useMemoryDb()) {
    initMemoryDb();
    memoryPurchases = memoryPurchases.map(p => (p.id === id ? { ...p, status, updatedAt: new Date() } : p));
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(purchases).set({ status }).where(eq(purchases.id, id));
}

// ─── Artists ──────────────────────────────────────────────────────────────────

export async function getActiveArtists() {
  if (useMemoryDb()) {
    initMemoryDb();
    return memoryArtists
      .filter(a => a.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artists).where(eq(artists.isActive, true)).orderBy(asc(artists.sortOrder));
}

export async function getAllArtists() {
  if (useMemoryDb()) {
    initMemoryDb();
    return [...memoryArtists].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artists).orderBy(asc(artists.sortOrder));
}

export async function getArtistById(id: number) {
  if (useMemoryDb()) {
    initMemoryDb();
    return memoryArtists.find(a => a.id === id);
  }
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(artists).where(eq(artists.id, id)).limit(1);
  return result[0];
}

export async function createArtist(data: InsertArtist) {
  if (useMemoryDb()) {
    initMemoryDb();
    const now = new Date();
    const created: Artist = {
      id: nextArtistId++,
      name: data.name,
      stageName: data.stageName ?? null,
      bio: data.bio ?? null,
      genre: data.genre ?? null,
      photoUrl: data.photoUrl ?? null,
      bannerUrl: data.bannerUrl ?? null,
      videoUrl: data.videoUrl ?? null,
      socialLinks: (data.socialLinks as any) ?? null,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    memoryArtists.push(created);
    return [{ insertId: created.id }];
  }
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(artists).values(data);
  return result;
}

export async function updateArtist(id: number, data: Partial<InsertArtist>) {
  if (useMemoryDb()) {
    initMemoryDb();
    memoryArtists = memoryArtists.map(artist => {
      if (artist.id !== id) return artist;
      return {
        ...artist,
        ...data,
        updatedAt: new Date(),
      } as Artist;
    });
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(artists).set(data).where(eq(artists.id, id));
}

export async function deleteArtist(id: number) {
  if (useMemoryDb()) {
    initMemoryDb();
    memoryArtists = memoryArtists.filter(a => a.id !== id);
    return;
  }
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(artists).where(eq(artists.id, id));
}
