'use client';
import { create } from 'zustand';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';

type Project = {
  name: string;
  technology: string;
  createdAt: string;
}
type User = {
  id: string;
  name: string;
  email: string;
  projects: Project[];
};

type UserStore = {
  user: User | null;
  isLoading: boolean;
  selectedProject: string | null;
  setUser: (user: User) => void;
  fetchUser: (id: string | null) => Promise<void>;
  addProject: (project: string, technology: string) => Promise<Boolean | undefined>;
  deleteProject: (project: string) => Promise<Boolean | undefined>;
  setSelectedProject: (project: string) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set,get) => ({
  user: null,
  isLoading: false,
  selectedProject: null,
  setUser: (user) => set({ user }),
  fetchUser: async (id) => {
    if (!id || id === undefined) return;
    set({ isLoading: true });
    try {
      const response = await axios.get(`/api/users`, { params: { id } });
      set({ user: response.data });
    } catch (error) {
      console.error("Failed to fetch user data", error);
    } finally {
      set({ isLoading: false });
    }
  },
  addProject: async (project, technology) => {
    const { user } = get();
    if (!user) return;

    try {
      const createdAt = new Date().toISOString();
      const response = await axios.post('/api/users/addProject', { id: user.id, name: project, technology, createdAt });
      const currentProject = {
        name: project,
        technology,
        createdAt
      }
      if(response.status === 409){
        alert("Please enter a unique project name.");
        return false;
      }
      // Update the local state with the new project
      set((state) => ({
        user: {
          ...state.user!,
          projects: [...state.user!.projects, currentProject],
        },
      }));
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          alert("Please enter a unique project name.");
        } else {
          console.error("Axios error:", error.response?.data);
        }
      } else {
        console.error("Unexpected error:", error);
      }
      return false;
    }
  },
  deleteProject: async (projectName) => {
    const { user } = get();
    if (!user) return;

    try {
      const response = await axios.post('/api/users/deleteProject', {userId: user.id, projectName });

      if (response.status === 404) {
        alert("Project not found.");
        return false;
      }

      // Update the local state to remove the deleted project
      set((state) => ({
        user: {
          ...state.user!,
          projects: state.user!.projects.filter((project) => project.name !== projectName),
        },
      }));

      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          alert("Project not found.");
        } else {
          console.error("Axios error:", error.response?.data);
        }
      } else {
        console.error("Unexpected error:", error);
      }
      return false;
    }
  },
  setSelectedProject: (project) => {
    set({ selectedProject: project }); // Update the selectedProject
  },
  clearUser: () => set({ user: null, selectedProject: null }),
}));

export const useInitializeUser = () => {
  const { userId } = useAuth();
  const { fetchUser } = useUserStore();

  useEffect(() => {
    if (userId) fetchUser(userId);
  }, [userId, fetchUser]);
};
