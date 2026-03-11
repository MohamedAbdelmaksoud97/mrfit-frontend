import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workoutService } from "@/services/workout.service";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/DashboardLayout";
import AILoadingAnimation from "@/components/AILoadingAnimation";
import ProgressRing from "@/components/ProgressRing";
import {
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import type { WorkoutDay, WorkoutPlan } from "@/types";
import { toast } from "sonner";

const WorkoutDashboard = () => {
  const queryClient = useQueryClient();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const {
    data: plan,
    isLoading,
    isError,
  } = useQuery<WorkoutPlan>({
    queryKey: ["workout-plan"],
    queryFn: async () => {
      const response = await workoutService.getActivePlan();
      // Destructuring based on your Postman output: response.data.plan
      return response.data?.plan || response.plan || response;
    },
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: workoutService.generatePlan,
    onSuccess: (data: any) => {
      // Ensure we cache the nested plan object if the generator returns the same structure
      const newPlan = data.data?.plan || data.plan || data;
      queryClient.setQueryData(["workout-plan"], newPlan);
      toast.success("Workout plan generated!");
    },
    onError: () => toast.error("Failed to generate plan"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      dayNumber,
      exerciseName,
    }: {
      dayNumber: number;
      exerciseName: string;
    }) => workoutService.toggleExercise(dayNumber, exerciseName),
    onMutate: async ({ dayNumber, exerciseName }) => {
      await queryClient.cancelQueries({ queryKey: ["workout-plan"] });
      const prev = queryClient.getQueryData<WorkoutPlan>(["workout-plan"]);
      if (prev) {
        const updated = {
          ...prev,
          days: prev.days.map((d) =>
            d.dayNumber === dayNumber
              ? {
                  ...d,
                  exercises: d.exercises.map((e: any) =>
                    e.name === exerciseName
                      ? { ...e, isCompleted: !e.isCompleted }
                      : e,
                  ),
                }
              : d,
          ),
        };
        queryClient.setQueryData(["workout-plan"], updated);
      }
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev)
        queryClient.setQueryData(["workout-plan"], context.prev);
      toast.error("Failed to update exercise");
    },
  });

  // --- CALCULATIONS ---
  const totalExercises =
    plan?.days?.reduce((a, d) => a + (d.exercises?.length || 0), 0) || 0;

  const completedExercises =
    plan?.days?.reduce(
      (a, d) =>
        a + (d.exercises?.filter((e: any) => e.isCompleted).length || 0),
      0,
    ) || 0;

  const percentage =
    totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const getDayCompletion = (day: WorkoutDay) => {
    const exercises = day.exercises || [];
    const done = exercises.filter((e: any) => e.isCompleted).length;
    return {
      done,
      total: exercises.length,
      pct: exercises.length > 0 ? (done / exercises.length) * 100 : 0,
    };
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !plan || !plan.days) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          {generateMutation.isPending ? (
            <AILoadingAnimation />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                No Active Plan
              </h1>
              <p className="text-muted-foreground">
                Generate an AI-powered workout plan tailored to your profile.
              </p>
              <Button
                variant="default"
                size="lg"
                onClick={() => generateMutation.mutate()}
              >
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
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Workout Plan
            </h1>
            <p className="text-sm text-muted-foreground">
              {completedExercises} of {totalExercises} exercises completed
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing percentage={percentage} size={80} strokeWidth={6} />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Regenerate
            </Button>
          </div>
        </div>

        {generateMutation.isPending && <AILoadingAnimation />}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {plan.days.map((day) => {
            const { done, total, pct } = getDayCompletion(day);
            const isExpanded = expandedDay === day.dayNumber;

            return (
              <motion.div
                key={day.dayNumber}
                layout
                className={`glass-card rounded-xl overflow-hidden cursor-pointer transition-colors hover:border-primary/30 border ${
                  isExpanded
                    ? "col-span-2 md:col-span-3 lg:col-span-4"
                    : "border-transparent"
                }`}
                onClick={() =>
                  setExpandedDay(isExpanded ? null : day.dayNumber)
                }
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Day {day.dayNumber}
                      </p>
                      <h3 className="font-display font-semibold text-foreground">
                        {day.dayName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {day.workoutTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {done}/{total}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-3">
                        {day.exercises.length > 0 ? (
                          day.exercises.map((exercise: any) => (
                            <div
                              key={exercise.name}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={exercise.isCompleted}
                                onCheckedChange={() =>
                                  toggleMutation.mutate({
                                    dayNumber: day.dayNumber,
                                    exerciseName: exercise.name,
                                  })
                                }
                                className="border-primary data-[state=checked]:bg-primary"
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium ${exercise.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}
                                >
                                  {exercise.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {exercise.sets} sets × {exercise.reps} ·{" "}
                                  {exercise.restSeconds}s rest
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-center text-muted-foreground py-2">
                            Rest Day - Enjoy your recovery!
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default WorkoutDashboard;
