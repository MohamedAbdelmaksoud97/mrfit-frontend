import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Dumbbell, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg gradient-electric flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">MrFit</span>
        </Link>

        <div className="glass-card rounded-xl p-8">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-foreground font-medium">Verifying your email...</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-foreground font-medium">{message}</p>
              <Button variant="electric" asChild className="mt-2">
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="w-12 h-12 text-destructive" />
              <p className="text-foreground font-medium">{message}</p>
              <Button variant="secondary" asChild className="mt-2">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
