import { FastifyReply, FastifyRequest } from "fastify";
import {
  createClassrooms,
  getClassroomById,
  getClassrooms,
  getMembers,
  joinClassroom,
  removeClassroom,
  updateClassrooms,
} from "./classroom.service";
import {
  CreateClassroomPayload,
  JoinClassroomPayload,
} from "./classroom.schema";

export async function getClassroomsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const classrooms = await getClassrooms(request.user.id, request.user.role);

  return reply.send(classrooms);
}

export async function getClassById(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  const classroom = await getClassroomById(request.params.id);

  return reply.send(classroom);
}

export async function createClassroomController(
  request: FastifyRequest<{
    Body: CreateClassroomPayload;
  }>,
  reply: FastifyReply,
) {
  const classroom = await createClassrooms(request.user.id, request.body);

  return reply.code(201).send(classroom);
}

export async function joinClassroomController(
  request: FastifyRequest<{
    Body: JoinClassroomPayload;
  }>,
  reply: FastifyReply,
) {
  const classroom = await joinClassroom(request.user.id, request.body);

  return reply.code(201).send(classroom);
}

export async function getMembersController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  const members = await getMembers(request.params.id);

  return reply.send(members);
}

export async function updateClassroomController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Body: {
      name?: string;
      description?: string;
    };
  }>,
) {
  return updateClassrooms(request.params.id, request.body);
}

export async function deleteClassroomController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
) {
  return removeClassroom(request.params.id);
}
