import { FastifyReply, FastifyRequest } from "fastify";
import { SubmissionService } from "./submission.service";
import {
  SubmitAssignmentParamsSchema,
  SubmitAssignmentSchema,
} from "./submission.schema";

export class SubmissionController {
  constructor(private readonly service: SubmissionService) {}

  submitAssignment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = SubmitAssignmentParamsSchema.parse(request.params);
    const body = SubmitAssignmentSchema.parse(request.body);
    const result = await this.service.submitAssignment(
      id,
      request.user.id,
      body,
    );
    reply.status(201).send(result);
  };
}
