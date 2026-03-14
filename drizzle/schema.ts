import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Events ───────────────────────────────────────────────────────────────────
/**
 * Zone shape stored in JSON:
 * { id: string, name: string, price: number, capacity?: number }[]
 *
 * Day shape stored in JSON:
 * { id: string, name: string, date: string, artists: string[] }[]
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  /** ISO date string for the first/main date */
  date: varchar("date", { length: 50 }),
  venue: varchar("venue", { length: 255 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Venezuela"),
  /** CDN URL for card/thumbnail image (recommended: 800×500 px) */
  imageUrl: text("imageUrl"),
  /** CDN URL for hero/banner image (recommended: 1920×600 px) */
  bannerUrl: text("bannerUrl"),
  /** CDN URL for venue map/floor plan (recommended: 1200×900 px) */
  venueMapUrl: text("venueMapUrl"),
  /** YouTube/Vimeo embed URL */
  videoUrl: text("videoUrl"),
  type: mysqlEnum("type", ["concert", "festival", "other"]).default("concert").notNull(),
  /** WhatsApp number including country code, e.g. +584121234567 */
  whatsappNumber: varchar("whatsappNumber", { length: 30 }),
  /** JSON array of up to 6 zones: [{id,name,price,capacity?}] */
  zones: json("zones").$type<Zone[]>(),
  /** JSON array of up to 4 days: [{id,name,date,artists:[]}] */
  days: json("days").$type<EventDay[]>(),
  /** Rules/norms for the event */
  normativas: text("normativas"),
  /** Physical ticket office info */
  taquilla: text("taquilla"),
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Zone = {
  id: string;
  name: string;
  price: number;
  capacity?: number;
};

export type EventDay = {
  id: string;
  name: string;
  date: string;
  artists: string[];
};

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Artists ──────────────────────────────────────────────────────────────────
/**
 * SocialLinks shape stored in JSON:
 * { instagram?: string, spotify?: string, youtube?: string, tiktok?: string, twitter?: string }
 */
export const artists = mysqlTable("artists", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  stageName: varchar("stageName", { length: 255 }),
  bio: text("bio"),
  genre: varchar("genre", { length: 100 }),
  /** CDN URL for main photo (recommended: 800×800 px) */
  photoUrl: text("photoUrl"),
  /** CDN URL for banner image (recommended: 1920×600 px) */
  bannerUrl: text("bannerUrl"),
  /** YouTube/Vimeo embed URL */
  videoUrl: text("videoUrl"),
  /** JSON object with social media links */
  socialLinks: json("socialLinks").$type<SocialLinks>(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialLinks = {
  instagram?: string;
  spotify?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
};

export type Artist = typeof artists.$inferSelect;
export type InsertArtist = typeof artists.$inferInsert;

// ─── Purchases ────────────────────────────────────────────────────────────────
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  buyerName: varchar("buyerName", { length: 255 }).notNull(),
  buyerEmail: varchar("buyerEmail", { length: 320 }),
  buyerPhone: varchar("buyerPhone", { length: 50 }),
  /** Snapshot of selected zone: {id,name,price,capacity?} */
  selectedZone: json("selectedZone").$type<Zone>(),
  /** Snapshot of selected days: [{id,name,date,artists:[]}] */
  selectedDays: json("selectedDays").$type<EventDay[]>(),
  quantity: int("quantity").notNull().default(1),
  /** Price per ticket per day */
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }),
  /** Total = unitPrice × quantity × numberOfDays */
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "whatsapp_sent"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;
