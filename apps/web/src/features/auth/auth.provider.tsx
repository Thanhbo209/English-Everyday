import { useEffect, useState } from "react";
import { AuthContext } from "./auth.context";
import { getMe, login, register } from "@/features/auth/api/auth.api";
import type { User } from "./types/auth.types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getMe();

        setUser(user);
      } catch {
        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function loginUser(email: string, password: string) {
    const data = await login({
      email,
      password,
    });

    localStorage.setItem("accessToken", data.accessToken);

    setUser(data.user);

    return data;
  }

  async function registerUser(email: string, password: string, name: string) {
    return await register({
      email,
      password,
      name,
    });
  }

  function logout() {
    localStorage.removeItem("accessToken");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        loginUser,
        registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
