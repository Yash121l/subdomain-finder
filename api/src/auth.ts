import { Hono } from "hono";
import { SignJWT, jwtVerify } from "jose";
import type { Env, User } from "./types";

const auth = new Hono<{ Bindings: Env }>();

// Generate a random UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

// Create JWT token
async function createToken(user: User, secret: string): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  const token = await new SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey);
  return token;
}

// Register new user
auth.post("/register", async (c) => {
  try {
    const body = await c.req.json<{ email: string; password: string; name?: string; organization?: string }>();
    const { email, password, name, organization } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    // Check if user exists
    const existing = await c.env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email.toLowerCase()).first();

    if (existing) {
      return c.json({ error: "Email already registered" }, 409);
    }

    // Create user
    const id = generateId();
    const passwordHash = await hashPassword(password);

    await c.env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, name, organization) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, email.toLowerCase(), passwordHash, name || null, organization || null).run();

    const user: User = { 
      id, 
      email: email.toLowerCase(), 
      password_hash: passwordHash, 
      created_at: new Date().toISOString() 
    };
    const token = await createToken(user, c.env.JWT_SECRET);

    return c.json({ 
      token, 
      user: { id, email: email.toLowerCase(), name: name || null } 
    }, 201);
  } catch (error) {
    console.error("Register error:", error);
    return c.json({ error: error instanceof Error ? error.message : "Registration failed" }, 500);
  }
});

// Login user
auth.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Find user
    const user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind(email.toLowerCase()).first<User>();

    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const token = await createToken(user, c.env.JWT_SECRET);

    return c.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: error instanceof Error ? error.message : "Login failed" }, 500);
  }
});

// Get current user (requires auth)
auth.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const token = authHeader.slice(7);
    const secretKey = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);

    const user = await c.env.DB.prepare(
      "SELECT id, email, name, organization, created_at FROM users WHERE id = ?"
    ).bind(payload.sub).first();

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user });
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
});

export { auth };
