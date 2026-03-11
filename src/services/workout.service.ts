import api from "./api";
import type { WorkoutPlan } from "@/types";

export const workoutService = {
  generatePlan: async (): Promise<WorkoutPlan> => {
    const { data } = await api.post("/workout/generate");
    return data;
  },

  getActivePlan: async (): Promise<WorkoutPlan> => {
    const { data } = await api.get("/workout/active");
    return data;
  },

  toggleExercise: async (dayNumber: number, exerciseName: string) => {
    const { data } = await api.patch("/workout/toggle-exercise", { dayNumber, exerciseName });
    return data;
  },
};
