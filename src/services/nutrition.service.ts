import api from "./api";
import type { NutritionPlan } from "@/types";

export const nutritionService = {
  getPlan: async (): Promise<NutritionPlan> => {
    const { data } = await api.get("/nutrition/active");
    // Destructure based on: { status: "success", data: { plan: { ... } } }
    return data.data?.plan || data.plan || data;
  },

  generatePlan: async (): Promise<NutritionPlan> => {
    const { data } = await api.post("/nutrition/generate");
    return data.data?.plan || data.plan || data;
  },

  toggleMeal: async (dayNumber: number, mealName: string) => {
    const { data } = await api.patch("/nutrition/toggle-meal", {
      dayNumber,
      mealName,
    });
    return data;
  },
};
