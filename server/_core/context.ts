import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId, upsertUser } from "../db";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // If standard auth fails, try to verify the JWT directly
    // This handles the case where DB is not available but JWT is valid
    try {
      const cookies = parseCookieHeader(opts.req.headers.cookie ?? "");
      const sessionCookie = cookies[COOKIE_NAME];
      if (sessionCookie) {
        const session = await sdk.verifySession(sessionCookie);
        if (session) {
          // Valid JWT but no DB user — create a mock admin user
          user = {
            id: 0,
            openId: session.openId,
            name: session.name || "Admin Local",
            email: "admin@cpproducciones.com",
            loginMethod: "local",
            role: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          } as User;
        }
      }
    } catch {
      // Session verification also failed, user remains null
      user = null;
    }
  }

  if (!user && process.env.NODE_ENV !== "production" && process.env.LOCAL_AUTO_ADMIN !== "false") {
    const localOpenId = "local-admin";
    await upsertUser({
      openId: localOpenId,
      name: "Admin Local",
      email: "admin@cp-producciones.local",
      loginMethod: "local",
      role: "admin",
      lastSignedIn: new Date(),
    });
    const localAdmin = await getUserByOpenId(localOpenId);
    user = localAdmin ?? null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
