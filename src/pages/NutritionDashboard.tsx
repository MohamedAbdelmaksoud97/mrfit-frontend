import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nutritionService } from "@/services/nutrition.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import AILoadingAnimation from "@/components/AILoadingAnimation";
import {
  Flame,
  Beef,
  Wheat,
  Droplets,
  ChevronDown,
  ChevronUp,
  Salad,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import type { NutritionPlan } from "@/types";
import { toast } from "sonner";

const macroConfig = [
  {
    key: "calories",
    label: "Calories",
    unit: "kcal",
    icon: Flame,
    color: "from-orange-500 to-red-500",
  },
  {
    key: "protein",
    label: "Protein",
    unit: "g",
    icon: Beef,
    color: "from-primary to-electric-glow",
  },
  {
    key: "carbs",
    label: "Carbs",
    unit: "g",
    icon: Wheat,
    color: "from-amber-500 to-yellow-500",
  },
  {
    key: "fats",
    label: "Fat",
    unit: "g",
    icon: Droplets,
    color: "from-emerald-500 to-teal-500",
  },
];

const NutritionDashboard = () => {
  const queryClient = useQueryClient();
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);

  const { data: plan, isLoading } = useQuery<NutritionPlan>({
    queryKey: ["nutrition-plan"],
    queryFn: nutritionService.getPlan,
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: nutritionService.generatePlan,
    onSuccess: (newPlan) => {
      queryClient.setQueryData(["nutrition-plan"], newPlan);
      toast.success("Nutrition plan generated!");
    },
    onError: () => toast.error("Failed to generate nutrition plan"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      dayNumber,
      mealName,
    }: {
      dayNumber: number;
      mealName: string;
    }) => nutritionService.toggleMeal(dayNumber, mealName),
    onMutate: async ({ dayNumber, mealName }) => {
      await queryClient.cancelQueries({ queryKey: ["nutrition-plan"] });
      const prev = queryClient.getQueryData<NutritionPlan>(["nutrition-plan"]);
      if (prev) {
        const updated = {
          ...prev,
          days: prev.days.map((d) =>
            d.dayNumber === dayNumber
              ? {
                  ...d,
                  meals: d.meals.map((m) =>
                    m.name === mealName
                      ? { ...m, isCompleted: !m.isCompleted }
                      : m,
                  ),
                }
              : d,
          ),
        };
        queryClient.setQueryData(["nutrition-plan"], updated);
      }
      return { prev };
    },
    onSuccess: (response) => {
      const updatedPlan = response.data?.plan || response.plan;
      if (updatedPlan) {
        queryClient.setQueryData(["nutrition-plan"], updatedPlan);
      }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["nutrition-plan"], ctx.prev);
      toast.error("Failed to update meal");
    },
  });

  const currentDay =
    plan?.days.find((d) => d.dayNumber === activeDayNumber) || plan?.days[0];

  const dailyMacros = currentDay?.meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.macros?.calories || 0),
      protein: acc.protein + (meal.macros?.protein || 0),
      carbs: acc.carbs + (meal.macros?.carbs || 0),
      fats: acc.fats + (meal.macros?.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!plan) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-16 px-4">
          {generateMutation.isPending ? (
            <AILoadingAnimation />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Salad className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                No Nutrition Plan
              </h1>
              <p className="text-muted-foreground">
                Fuel your progress with a personalized meal plan.
              </p>
              <Button onClick={() => generateMutation.mutate()} size="lg">
                <Sparkles className="w-4 h-4 mr-2" /> Generate Plan
              </Button>
            </motion.div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 p-4"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Nutrition Plan
            </h1>
            <p className="text-sm text-muted-foreground">{plan.goalSnapshot}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Regenerate
          </Button>
        </div>

        {generateMutation.isPending && <AILoadingAnimation />}

        {dailyMacros && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {macroConfig.map((macro, i) => (
              <motion.div
                key={macro.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-4 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-br ${macro.color} flex items-center justify-center`}
                  >
                    <macro.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                    {macro.label}
                  </span>
                </div>
                <p className="font-display text-xl font-bold text-foreground">
                  {dailyMacros[macro.key as keyof typeof dailyMacros]}
                  <span className="text-xs text-muted-foreground ml-1 font-normal">
                    {macro.unit}
                  </span>
                </p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {plan.days.map((day) => {
            const isActive = activeDayNumber === day.dayNumber;
            const done = day.meals.filter((m) => m.isCompleted).length;
            return (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDayNumber(day.dayNumber)}
                className={`flex-shrink-0 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "gradient-electric text-white shadow-md shadow-primary/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {day.dayName}
                <span className="ml-2 text-xs opacity-60">
                  {done}/{day.meals.length}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDayNumber}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            className="space-y-3"
          >
            {currentDay?.meals.map((meal) => (
              <MealCard
                key={meal.name}
                meal={meal}
                onToggle={(name) =>
                  toggleMutation.mutate({
                    dayNumber: currentDay.dayNumber,
                    mealName: name,
                  })
                }
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

const MealCard = ({
  meal,
  onToggle,
}: {
  meal: any;
  onToggle: (name: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/20 transition-all">
      <div className="flex items-center justify-between p-4">
        <div
          className="flex items-center gap-4 flex-1 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
            <Salad className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3
              className={`font-bold text-sm ${meal.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}
            >
              {meal.name}
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">
              {meal.mealType} • {meal.macros.calories} kcal
            </p>
          </div>
          <div className="ml-auto">
            {open ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <Switch
          checked={!!meal.isCompleted}
          onCheckedChange={() => onToggle(meal.name)}
          className="ml-3 data-[state=checked]:bg-primary"
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 bg-muted/10"
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {macroConfig.map((m) => (
                  <div
                    key={m.key}
                    className="text-center p-2 rounded-lg bg-background/50 border border-border/50"
                  >
                    <p className="text-[9px] uppercase text-muted-foreground font-bold">
                      {m.label}
                    </p>
                    <p className="text-xs font-bold">
                      {meal.macros[m.key]}
                      {m.unit}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Ingredients
                </h4>
                {meal.ingredients.map((ing: any) => (
                  <div
                    key={ing._id || ing.item}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-border/20 last:border-0"
                  >
                    <span
                      className={
                        ing.isOptional
                          ? "text-muted-foreground italic"
                          : "text-foreground font-medium"
                      }
                    >
                      {ing.item} {ing.isOptional && "(Optional)"}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {ing.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NutritionDashboard;
