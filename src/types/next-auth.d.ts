import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      division: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    division: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    division: string;
  }
}
