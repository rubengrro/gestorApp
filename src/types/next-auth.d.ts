/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, {DefaultSession} from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
      user: {
        role?: string;
        plant?: string;  // Extiende la sesión para incluir plant
      } & DefaultSession["user"];
    }
  
    interface User {
      role?: string;
      plant?: string; // Extiende el usuario para incluir plant
    }
  }
  
  declare module "next-auth/jwt" {
    interface JWT {
      role?: string;
      plant?: string; // Extiende el token JWT para incluir plant
    }
  }