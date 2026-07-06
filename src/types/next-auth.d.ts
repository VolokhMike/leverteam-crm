import { DefaultSession } from "next-auth";

type AppRole = "ADMIN" | "SALES" | "TRAFFER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: AppRole;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    role: AppRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: AppRole;
  }
}
