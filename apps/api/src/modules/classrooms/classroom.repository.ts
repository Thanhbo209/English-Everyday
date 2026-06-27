import { prisma } from "../../config/prisma.js";
import { ClassroomStatus } from "../../infrastructure/prisma/generated/prisma/enums.js";

interface CreateClassroomData {
  teacherId: string;
  name: string;
  description?: string;
  joinCode: string;
}

export function getAllClassrooms(userId: string, role: string) {
  if (role === "TEACHER") {
    return prisma.classroom.findMany({
      where: {
        teacherId: userId,
      },
      include: {
        _count: {
          select: {
            classroomsMembers: true,
          },
        },
      },
    });
  } else {
    return prisma.classroom.findMany({
      where: {
        classroomsMembers: {
          some: {
            studentId: userId,
          },
        },
      },
      include: {
        teacher: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            classroomsMembers: true,
          },
        },
      },
    });
  }
}

// model ClassroomsMember {
//   id          String    @id @default(uuid())
//   classroomId String
//   studentId   String
//   joinAt      DateTime  @default(now())
//   classroom   Classroom @relation(fields: [classroomId], references: [id], onDelete: Cascade)
//   user        User      @relation(fields: [studentId], references: [id], onDelete: Cascade)

//   @@unique([classroomId, studentId])
// }

export async function getClassroomMembers(classroomId: string) {
  return prisma.classroom.findMany({
    where: {
      id: classroomId,
    },
    include: {
      classroomsMembers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

export function findClassroomById(classroomId: string) {
  return prisma.classroom.findUnique({
    where: {
      id: classroomId,
    },
  });
}

export function createClassroom(data: CreateClassroomData) {
  return prisma.classroom.create({
    data: {
      teacherId: data.teacherId,
      name: data.name,
      description: data.description,
      joinCode: data.joinCode,
      status: ClassroomStatus.ACTIVE,
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}

export function findByJoinCode(joinCode: string) {
  return prisma.classroom.findUnique({
    where: {
      joinCode,
    },
  });
}

export function findMembership(classroomId: string, studentId: string) {
  return prisma.classroomsMember.findUnique({
    where: {
      classroomId_studentId: {
        classroomId,
        studentId,
      },
    },
  });
}

export function createMembership(classroomId: string, studentId: string) {
  return prisma.classroomsMember.create({
    data: {
      classroomId,
      studentId,
    },
    include: {
      classroom: {
        select: {
          id: true,
          name: true,
          joinCode: true,
          status: true,
        },
      },
    },
  });
}

export async function updateClassroom(
  classroomId: string,
  data: {
    name?: string;
    description?: string;
    status?: ClassroomStatus;
  },
) {
  return prisma.classroom.update({
    where: {
      id: classroomId,
    },
    data,
  });
}

export async function deleteClassroom(classroomId: string) {
  return prisma.classroom.delete({
    where: {
      id: classroomId,
    },
  });
}
