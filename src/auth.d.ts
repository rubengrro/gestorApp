import{ DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
      plant?: string;
      relatedSupervisors?: string[];
      relatedRis?: string[];
      relatedInplants?: string[];
      relatedGps?: string[];
      relatedGerentes?: string[];
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    plant?: string;
    relatedSupervisors?: string[];
    relatedRis?: string[];
    relatedInplants?: string[];
    relatedGps?: string[];
    relatedGerentes?: string[];
  }
}
