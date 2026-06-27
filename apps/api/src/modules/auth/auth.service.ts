import { AppError, ErrorCode } from "../../shared/errors/app.error.js";
import { comparePassword, hashPassword } from "../../shared/utils/password";
import { createUser, findUserByEmail, getProfile } from "./auth.repository.js";
import jwt from "jsonwebtoken";
import { LoginPayload, RegisterPayload } from "./auth.schema.js";

export async function register(data: RegisterPayload) {
  const existed = await findUserByEmail(data.email);

  if (existed) {
    throw new AppError(
      409,
      ErrorCode.EMAIL_ALREADY_EXISTS,
      "Email already exists",
    );
  }

  const passwordHash = await hashPassword(data.password);

  return createUser({
    email: data.email,
    name: data.name,
    passwordHash,
  });
}

export async function login(data: LoginPayload) {
  const user = await findUserByEmail(data.email);
  const generateToken = (payload: object) => {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });
  };

  if (!user) {
    throw new AppError(
      401,
      ErrorCode.INVALID_CREDENTIALS,
      "Invalid email or password",
    );
  }

  const valid = await comparePassword(data.password, user.passwordHash);

  if (!valid) {
    throw new AppError(
      401,
      ErrorCode.INVALID_CREDENTIALS,
      "Invalid email or password",
    );
  }

  const accessToken = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    accessToken,

    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function getMe(userId: string) {
  const profile = await getProfile(userId);

  if (!profile) {
    throw new AppError(404, ErrorCode.USER_NOT_FOUND, "User Not Found");
  }

  return profile;
}
