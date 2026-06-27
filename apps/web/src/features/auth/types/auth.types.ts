export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: "TEACHER" | "STUDENT";
  streak: number;
  xp: number;
}

export interface AuthContextType {
  user: User | null;

  loading: boolean;

  loginUser(email: string, password: string): Promise<void>;

  registerUser(email: string, password: string, name: string): Promise<void>;

  logout(): void;

  setUser(user: User | null): void;
}
