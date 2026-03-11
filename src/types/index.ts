export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  fitnessLevel: string;
  goal: string;
  budgetLevel: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  profile: UserProfile;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  completed: boolean;
}

export interface WorkoutDay {
  dayNumber: number;
  name: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  _id: string;
  userId: string;
  days: WorkoutDay[];
  createdAt: string;
}

export interface Ingredient {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  name: string;
  type: string;
  completed: boolean;
  ingredients: Ingredient[];
}

export interface NutritionDay {
  dayNumber: number;
  meals: Meal[];
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export interface NutritionPlan {
  _id: string;
  userId: string;
  days: NutritionDay[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  profile: Partial<UserProfile>;
}
