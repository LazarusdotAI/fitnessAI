import { createContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Toaster } from "../components/ui/toaster";
import { useToast } from "../hooks/use-toast";
import type { InsertUser } from "../../../shared/schema";

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loginMutation: any;
  registerMutation: any;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to login");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        loginMutation,
        registerMutation,
      }}
    >
      {children}
      <Toaster />
    </AuthContext.Provider>
  );
}
