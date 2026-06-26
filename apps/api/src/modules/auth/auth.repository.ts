import { prisma } from "../../config/prisma.js";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
}) {
  return prisma.user.create({
    data,
  });
}

export function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      xp: true,
      streak: true,
    },
  });
}
