import "@fastify/jwt";
import { UserRole } from "../../infrastructure/prisma/generated/prisma/enums";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      role: UserRole;
    };

    user: {
      id: string;
      role: UserRole;
    };
  }
}
