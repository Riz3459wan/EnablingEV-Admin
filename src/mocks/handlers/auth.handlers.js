import { http } from "msw";
import { getStore } from "../store";
import { delay, ok, unauthorized, badRequest } from "../utils";

export const authHandlers = [
  http.post("/api/admin/login", async ({ request }) => {
    await delay(400);
    const body = await request.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return badRequest("User ID and password are required.");
    }

    const store = getStore();
    const user = store.users.find(
      (u) => u.userId === userId && u.password === password,
    );

    if (!user) {
      return unauthorized("Invalid credentials. Please try again.");
    }

    return ok(
      {
        token: `mock-token-${user.id}-${Date.now()}`,
        user: {
          id: user.id,
          userId: user.userId,
          fullName: user.fullName,
          role: user.role,
        },
      },
      "Login successful",
    );
  }),

  http.post("/api/admin/logout", async () => {
    await delay(150);
    return ok(null, "Logged out successfully");
  }),

  http.get("/api/admin/me", async () => {
    await delay(150);
    const store = getStore();
    const admin = store.users.find((u) => u.role === "admin");
    if (!admin) return unauthorized("Not logged in");
    return ok(admin);
  }),

  http.post("/api/admin/change-password", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    if (!body.currentPassword || !body.newPassword) {
      return badRequest("Both current and new password are required.");
    }
    return ok(null, "Password updated successfully");
  }),
];
