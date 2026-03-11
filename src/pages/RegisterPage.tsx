import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, ArrowRight, ArrowLeft, User, Mail, Lock, Ruler, Weight, Target } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

const steps = ["Account", "Profile"];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
    height: "",
    weight: "",
    gender: "",
    goal: "",
    budgetLevel: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      authService.register({
        username: form.username,
        email: form.email,
        password: form.password,
        profile: {
          age: Number(form.age),
          height: Number(form.height),
          weight: Number(form.weight),
          goal: form.goal,
          budgetLevel: form.budgetLevel,
        },
      }),
    onSuccess: () => {
      toast.success("Account created! Check your email to verify.");
      navigate("/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const canNext = step === 0 ? form.username && form.email && form.password.length >= 6 : form.age && form.height && form.weight && form.goal;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-electric flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">MrFit</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Step {step + 1} of 2 — {steps[step]}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "gradient-electric" : "bg-muted"}`} />
          ))}
        </div>

        <div className="glass-card rounded-xl p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div>
                  <Label className="text-foreground flex items-center gap-2 mb-2"><User className="w-4 h-4" /> Username</Label>
                  <Input value={form.username} onChange={(e) => update("username", e.target.value)} placeholder="johndoe" className="bg-muted/50 border-border" />
                </div>
                <div>
                  <Label className="text-foreground flex items-center gap-2 mb-2"><Mail className="w-4 h-4" /> Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" className="bg-muted/50 border-border" />
                </div>
                <div>
                  <Label className="text-foreground flex items-center gap-2 mb-2"><Lock className="w-4 h-4" /> Password</Label>
                  <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Min 6 characters" className="bg-muted/50 border-border" />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground flex items-center gap-2 mb-2">Age</Label>
                    <Input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} placeholder="25" className="bg-muted/50 border-border" />
                  </div>
                  <div>
                    <Label className="text-foreground flex items-center gap-2 mb-2">Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                      <SelectTrigger className="bg-muted/50 border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground flex items-center gap-2 mb-2"><Ruler className="w-4 h-4" /> Height (cm)</Label>
                    <Input type="number" value={form.height} onChange={(e) => update("height", e.target.value)} placeholder="175" className="bg-muted/50 border-border" />
                  </div>
                  <div>
                    <Label className="text-foreground flex items-center gap-2 mb-2"><Weight className="w-4 h-4" /> Weight (kg)</Label>
                    <Input type="number" value={form.weight} onChange={(e) => update("weight", e.target.value)} placeholder="70" className="bg-muted/50 border-border" />
                  </div>
                </div>
                <div>
                  <Label className="text-foreground flex items-center gap-2 mb-2"><Target className="w-4 h-4" /> Fitness Goal</Label>
                  <Select value={form.goal} onValueChange={(v) => update("goal", v)}>
                    <SelectTrigger className="bg-muted/50 border-border"><SelectValue placeholder="Select goal" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose_weight">Lose Weight</SelectItem>
                      <SelectItem value="build_muscle">Build Muscle</SelectItem>
                      <SelectItem value="maintain">Maintain</SelectItem>
                      <SelectItem value="improve_endurance">Improve Endurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-foreground mb-2 block">Budget Level</Label>
                  <Select value={form.budgetLevel} onValueChange={(v) => update("budgetLevel", v)}>
                    <SelectTrigger className="bg-muted/50 border-border"><SelectValue placeholder="Select budget" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low — Home workouts</SelectItem>
                      <SelectItem value="medium">Medium — Basic gym</SelectItem>
                      <SelectItem value="high">High — Full gym access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            {step < 1 ? (
              <Button variant="electric" onClick={() => setStep(1)} disabled={!canNext} className="flex-1">
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="electric" onClick={() => mutation.mutate()} disabled={!canNext || mutation.isPending} className="flex-1">
                {mutation.isPending ? "Creating..." : "Create Account"}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
