import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Mail, Lock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);

  const loginMutation = useMutation({
    mutationFn: () => authService.login(email, password),
    onSuccess: () => {
      toast.success("Welcome back!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  const forgotMutation = useMutation({
    mutationFn: () => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success("Password reset link sent to your email");
      setForgotMode(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-electric flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">MrFit</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {forgotMode ? "Reset Password" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {forgotMode ? "Enter your email to receive a reset link" : "Log in to your account"}
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <Label className="text-foreground flex items-center gap-2 mb-2"><Mail className="w-4 h-4" /> Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="bg-muted/50 border-border" />
          </div>

          {!forgotMode && (
            <div>
              <Label className="text-foreground flex items-center gap-2 mb-2"><Lock className="w-4 h-4" /> Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="bg-muted/50 border-border" />
            </div>
          )}

          {forgotMode ? (
            <Button variant="electric" className="w-full" onClick={() => forgotMutation.mutate()} disabled={!email || forgotMutation.isPending}>
              {forgotMutation.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          ) : (
            <Button variant="electric" className="w-full" onClick={() => loginMutation.mutate()} disabled={!email || !password || loginMutation.isPending}>
              {loginMutation.isPending ? "Logging in..." : "Log In"}
            </Button>
          )}

          <button
            onClick={() => setForgotMode(!forgotMode)}
            className="text-sm text-primary hover:underline w-full text-center block"
          >
            {forgotMode ? "Back to login" : "Forgot password?"}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
