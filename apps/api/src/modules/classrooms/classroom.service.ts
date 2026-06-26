import { ClassroomStatus } from "../../infrastructure/prisma/generated/prisma/enums";
import { AppError, ErrorCode } from "../../shared/errors/app.error";
import { generateJoinCode } from "../../shared/utils/join-code";
import {
  createClassroom,
  createMembership,
  deleteClassroom,
  findByJoinCode,
  findClassroomById,
  findMembership,
  getAllClassrooms,
  getClassroomMembers,
  updateClassroom,
} from "./classroom.repository";
import {
  CreateClassroomPayload,
  JoinClassroomPayload,
} from "./classroom.schema";

export async function getClassrooms(userId: string, role: string) {
  const classroom = await getAllClassrooms(userId, role);

  if (!classroom) {
    throw new AppError(
      404,
      ErrorCode.CLASSROOM_NOT_FOUND,
      "Classroom not found.",
    );
  }

  return classroom;
}

export async function getMembers(classroomId: string) {
  const classroom = await findClassroomById(classroomId);

  if (!classroom) {
    throw new AppError(
      404,
      ErrorCode.CLASSROOM_NOT_FOUND,
      "Classroom not found",
    );
  }

  return getClassroomMembers(classroomId);
}

export async function getClassroomById(classroomId: string) {
  const classroom = await findClassroomById(classroomId);

  if (!classroom) {
    throw new AppError(
      404,
      ErrorCode.CLASSROOM_NOT_FOUND,
      "Classroom not found",
    );
  }

  return classroom;
}

export async function createClassrooms(
  teacherId: string,
  payload: CreateClassroomPayload,
) {
  let joinCode = generateJoinCode();

  while (await findByJoinCode(joinCode)) {
    joinCode = generateJoinCode();
  }

  return createClassroom({
    teacherId,
    name: payload.name,
    description: payload.description,
    joinCode,
  });
}

export async function updateClassrooms(
  classroomId: string,
  payload: {
    name?: string;
    description?: string;
    status?: ClassroomStatus;
  },
) {
  const classroom = await findClassroomById(classroomId);

  if (!classroom) {
    throw new AppError(
      404,
      ErrorCode.CLASSROOM_NOT_FOUND,
      "Classroom not found",
    );
  }

  return updateClassroom(classroomId, payload);
}

export async function joinClassroom(
  studentId: string,
  payload: JoinClassroomPayload,
) {
  const classroom = await findByJoinCode(payload.joinCode);

  if (!classroom) {
    throw new AppError(404, "CLASSROOM_NOT_FOUND", "Classroom does not exist.");
  }

  if (classroom.status !== ClassroomStatus.ACTIVE) {
    throw new AppError(400, "CLASSROOM_INACTIVE", "Classroom is inactive.");
  }

  const existed = await findMembership(classroom.id, studentId);

  if (existed) {
    throw new AppError(
      409,
      "ALREADY_JOINED",
      "You already joined this classroom.",
    );
  }

  return createMembership(classroom.id, studentId);
}

export async function removeClassroom(classroomId: string) {
  const classroom = await findClassroomById(classroomId);

  if (!classroom) {
    throw new AppError(
      404,
      ErrorCode.CLASSROOM_NOT_FOUND,
      "Classroom not found",
    );
  }

  return deleteClassroom(classroomId);
}
