import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { checkRateLimit, resetRateLimit, throttlingEnabled, DEFAULT_LIMITS } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      // Brute-force guard: throttled per IP. authorize() runs in the Node
      // runtime (db/bcrypt not available in the middleware runtime), so the
      // limiter lives here instead of the proxy matcher.
      authorize: async (credentials, request) => {
        const ip =
          request instanceof Request
            ? (request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anonymous")
            : "anonymous";
        if (throttlingEnabled() && !checkRateLimit(`login:${ip}`, DEFAULT_LIMITS.login)) return null;

        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (!user.approved) {
          throw new Error("APPROVAL_PENDING");
        }

        // Successful login clears the throttle counter for this IP
        if (throttlingEnabled()) resetRateLimit(`login:${ip}`);

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.id = user.id;
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
