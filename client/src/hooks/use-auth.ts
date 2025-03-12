import { create } from 'zustand';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-service';
import { type InsertUser } from '../../../shared/schema';

interface User {
  id: number;
  username: string;
  age: number;
  gender: string;
  heightFeet: number;
  heightInches: number;
  weight: string;
  fitnessGoal: string;
  experienceLevel: string;
  currentActivityLevel: string;
  workoutPreferences: string;
  motivationFactors: string;
  pastAttempts: number;
  confidenceLevel: number;
  timeCommitment: number;
  obstacles: string;
  stressLevel: number;
  sleepQuality: number;
  dietaryPreferences: string;
  supplementPreferences: string;
  occupationType: string;
  workSchedule: string;
  emotionalDrivers?: string;
  personalVision?: string;
  readinessAssessment?: string;
  injuries?: string | null;
  medicalConditions?: string | null;
  additionalNotes?: string | null;
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user: User | null) => set({ user }),
}));

export function useAuth() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      return api.login(data.username, data.password);
    },
    onSuccess: (data: User) => {
      setUser(data);
      // Redirect to stored URL or dashboard
      const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
      sessionStorage.removeItem('redirectUrl');
      window.location.href = redirectUrl;
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      return api.register(data);
    },
    onSuccess: (data: User) => {
      setUser(data);
      window.location.href = '/dashboard';
    }
  });

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      // Clear any cached queries
      queryClient.clear();
      // Redirect to login
      window.location.href = '/';
    } catch (error) {
      // Error is already handled by the API service
      setUser(null);
      window.location.href = '/';
    }
  };

  const checkSession = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
      return true;
    } catch (error) {
      setUser(null);
      return false;
    }
  };

  const checkUsername = async (username: string) => {
    try {
      const { available } = await api.checkUsername(username);
      return available;
    } catch (error) {
      return false;
    }
  };

  return {
    user,
    loginMutation,
    registerMutation,
    logout,
    checkSession,
    checkUsername,
  };
}

// Export the store for direct access in special cases
export { useAuthStore };
