import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { User, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

const ProfilePage = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ["profile"],
    queryFn: authService.getProfile,
  });

  const [profileForm, setProfileForm] = useState({
    username: "",
    age: "",
    height: "",
    weight: "",
    goal: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [initialized, setInitialized] = useState(false);
  if (user && !initialized) {
    setProfileForm({
      username: user.username || "",
      age: String(user.profile?.age || ""),
      height: String(user.profile?.height || ""),
      weight: String(user.profile?.weight || ""),
      goal: user.profile?.goal || "",
    });
    setInitialized(true);
  }

  const profileMutation = useMutation({
    mutationFn: () =>
      authService.updateProfile({
        username: profileForm.username,
        profile: {
          age: Number(profileForm.age),
          height: Number(profileForm.height),
          weight: Number(profileForm.weight),
          goal: profileForm.goal,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const passwordMutation = useMutation({
    mutationFn: () => authService.updatePassword(passwordForm.currentPassword, passwordForm.newPassword),
    onSuccess: () => {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated");
    },
    onError: () => toast.error("Failed to update password"),
  });

  const canSavePassword =
    passwordForm.currentPassword &&
    passwordForm.newPassword.length >= 6 &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Profile Settings</h1>

        {/* Profile Info */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <User className="w-4 h-4" /> Personal Info
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground text-xs">Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted/30 border-border" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Username</Label>
              <Input
                value={profileForm.username}
                onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-muted-foreground text-xs">Age</Label>
                <Input
                  type="number"
                  value={profileForm.age}
                  onChange={(e) => setProfileForm((p) => ({ ...p, age: e.target.value }))}
                  className="bg-muted/50 border-border"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Height (cm)</Label>
                <Input
                  type="number"
                  value={profileForm.height}
                  onChange={(e) => setProfileForm((p) => ({ ...p, height: e.target.value }))}
                  className="bg-muted/50 border-border"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Weight (kg)</Label>
                <Input
                  type="number"
                  value={profileForm.weight}
                  onChange={(e) => setProfileForm((p) => ({ ...p, weight: e.target.value }))}
                  className="bg-muted/50 border-border"
                />
              </div>
            </div>
          </div>

          <Button variant="electric" onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending} className="w-full">
            <Save className="w-4 h-4 mr-1" /> {profileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Separator className="bg-border" />

        {/* Change Password */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Lock className="w-4 h-4" /> Change Password
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground text-xs">Current Password</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                className="bg-muted/50 border-border"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">New Password</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                className="bg-muted/50 border-border"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Confirm New Password</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="bg-muted/50 border-border"
              />
            </div>
          </div>

          <Button variant="electric" onClick={() => passwordMutation.mutate()} disabled={!canSavePassword || passwordMutation.isPending} className="w-full">
            <Lock className="w-4 h-4 mr-1" /> {passwordMutation.isPending ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProfilePage;
