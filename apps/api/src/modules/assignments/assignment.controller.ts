import { FastifyReply, FastifyRequest } from "fastify";
import { AssignmentService } from "./assignment.service";
import {
  AssignmentParamsSchema,
  AssignmentQuerySchema,
  CreateAssignmentSchema,
  UpdateAssignmentSchema,
} from "./assignment.schema";

export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  getAssignments = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = AssignmentQuerySchema.parse(request.query);
    const assignments = await this.service.getAssignments(request.user.id, query);
    reply.status(200).send(assignments);
  };

  createAssignment = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = CreateAssignmentSchema.parse(request.body);
    const assignment = await this.service.createAssignment(request.user.id, body);
    reply.status(201).send(assignment);
  };

  getAssignment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = AssignmentParamsSchema.parse(request.params);
    const assignment = await this.service.getTeacherAssignment(
      id,
      request.user.id,
    );
    reply.status(200).send(assignment);
  };

  updateAssignment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = AssignmentParamsSchema.parse(request.params);
    const body = UpdateAssignmentSchema.parse(request.body);
    const assignment = await this.service.updateAssignment(
      id,
      request.user.id,
      body,
    );
    reply.status(200).send(assignment);
  };

  deleteAssignment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = AssignmentParamsSchema.parse(request.params);
    await this.service.deleteAssignment(id, request.user.id);
    reply.status(204).send();
  };

  getStudentAssignments = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const assignments = await this.service.getStudentAssignments(
      request.user.id,
    );
    reply.status(200).send(assignments);
  };

  getStudentAssignment = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { id } = AssignmentParamsSchema.parse(request.params);
    const assignment = await this.service.getStudentAssignment(
      id,
      request.user.id,
    );
    reply.status(200).send(assignment);
  };
}
